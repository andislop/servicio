import express from "express";
import pool from "../config/bd.js";
import db from "../config/firebase.js";
import admin from "firebase-admin";
import verificarToken from "../Middleware/autenticación.js";
const Router = express.Router();

Router.get("/jefes", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user;
    
    // Filtro base: solo personas con rol Jefe y status Activo
    let jefesQuery = db.collection("personas")
      .where("rol", "==", "Jefe")
      .where("status", "==", "Activo");
    
    if (rol === "Jefe") {
      const jefeSnapshot = await db.collection("personas").doc(String(id_persona)).get();
      const idNucleoPropio = jefeSnapshot.data()?.id_nucleo;
      const nucleoPropioDoc = await db.collection("nucleos_familiares").doc(String(idNucleoPropio)).get();
      const viviendaPropia = nucleoPropioDoc.data()?.vivienda;

      const nucleosMismaVivienda = await db.collection("nucleos_familiares")
        .where("vivienda", "==", viviendaPropia).get();
      const idsNucleos = nucleosMismaVivienda.docs.map(doc => doc.data().id_nucleo);
      
      jefesQuery = jefesQuery.where("id_nucleo", "in", idsNucleos);
    }

    // Nota: Es posible que Firebase pida un nuevo índice compuesto para status + rol + id_persona
    const snapshot = await jefesQuery.orderBy("id_persona", "asc").get();
    
    const nucleosSnapshot = await db.collection("nucleos_familiares").get();
    const viviendasMap = {};
    nucleosSnapshot.forEach(doc => viviendasMap[doc.data().id_nucleo] = doc.data().vivienda);

    const rows = snapshot.docs.map(doc => {
      const p = doc.data();
      return {
        ...p,
        vivienda: viviendasMap[p.id_nucleo] || "N/A",
        totalJefes: snapshot.size 
      };
    });

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

Router.post("/registrar-jefe", verificarToken, async (req, res) => {
  const { rol, id_persona: idUsuarioLogueado } = req.user;
  const d = req.body; // Datos provenientes del formulario

  try {
    // --- CASO 1: EL USUARIO ES JEFE DE CALLE (CREA SOLICITUD) ---
    if (rol !== "Administrador") {
      const solicitudRef = db.collection("solicitudes_aprobacion").doc();
      
      await solicitudRef.set({
        id_usuario_solicitante: String(idUsuarioLogueado),
        tipo_operacion: "Registro Jefe",
        estado: "Pendiente",
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
        // Guardamos los datos como un Objeto (Map) en Firestore
        datos_json: {
          nombreFamilia: d.nombreFamilia,
          vivienda: d.vivienda,
          mercado: Number(d.mercado) || 0,
          cedula: d.cedula,
          primerNombre: d.primerNombre,
          segundoNombre: d.segundoNombre || "",
          primerApellido: d.primerApellido,
          segundoApellido: d.segundoApellido || "",
          sexo: d.sexo,
          telefono: d.telefono,
          nacionalidad: d.nacionalidad,
          fechaNacimiento: d.fechaNacimiento, // Se guarda string para procesar al aprobar
          es_manzanero: Boolean(d.esManzanero),
          es_jefe_calle: Boolean(d.esJefeCalle),
          carnetCodigo: d.carnetCodigo || "",
          carnetSerial: d.carnetSerial || "",
          email: d.email || "",
          password: d.password || "", // Se encriptará solo al momento de la aprobación final
          notes: d.notes || ""
        }
      });

      return res.status(201).json({ 
        message: "Solicitud de registro enviada con éxito. El Administrador debe aprobarla." 
      });
    }

    // --- CASO 2: EL USUARIO ES ADMINISTRADOR (REGISTRO DIRECTO) ---
    const personaRef = db.collection("personas").doc();
    const nucleoRef = db.collection("nucleos_familiares").doc();

    await db.runTransaction(async (t) => {
      // 1. Guardar Núcleo
      t.set(nucleoRef, {
        id_nucleo: nucleoRef.id,
        id_jefe_principal: personaRef.id,
        nombre_familia: d.nombreFamilia,
        vivienda: d.vivienda,
        mercado: Number(d.mercado) || 0,
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Guardar Persona
      t.set(personaRef, {
        id_persona: personaRef.id,
        id_nucleo: nucleoRef.id,
        cedula: d.cedula,
        status: "Activo",
        primer_nombre: d.primerNombre,
        segundo_nombre: d.segundoNombre || "",
        primer_apellido: d.primerApellido,
        segundo_apellido: d.segundoApellido || "",
        rol: "Jefe",
        sexo: d.sexo,
        telefono: d.telefono,
        nacionalidad: d.nacionalidad,
        fecha_nacimiento: d.fechaNacimiento ? admin.firestore.Timestamp.fromDate(new Date(d.fechaNacimiento)) : null,
        es_manzanero: Boolean(d.esManzanero),
        es_jefe_calle: Boolean(d.esJefeCalle),
        codigo_carnet: d.carnetCodigo || "",
        serial_carnet: d.carnetSerial || "",
        notes: d.notes || "",
        fecha_registro: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. Crear cuenta de usuario si es Jefe de Calle
      if (d.esJefeCalle && d.email && d.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(d.password, salt);
        const usuarioRef = db.collection("usuarios").doc();
        
        t.set(usuarioRef, {
          id_persona: personaRef.id,
          email: d.email,
          password: hashedPassword,
          rol: "Jefe",
          status: "Activo"
        });
      }
    });

    res.status(201).json({ 
      message: "Registro directo realizado con éxito", 
      idPersona: personaRef.id 
    });

  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ message: "Error al procesar la operación: " + err.message });
  }
});

Router.put("/editar-jefe/:idPersona", verificarToken, async (req, res) => {
  const { idPersona } = req.params;
  const { rol, id_persona: idUsuarioLogueado } = req.user;
  const d = req.body;

  try {
    // --- CASO 1: EL USUARIO ES JEFE DE CALLE (CREA SOLICITUD DE EDICIÓN) ---
    if (rol !== "Administrador") {
      const solicitudRef = db.collection("solicitudes_aprobacion").doc();
      
      await solicitudRef.set({
        id_usuario_solicitante: String(idUsuarioLogueado),
        tipo_operacion: "Edicion Jefe", // Tipo específico
        id_referencia: String(idPersona), // ID de la persona a editar
        estado: "Pendiente",
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
        datos_json: {
          // Empaquetamos todos los campos para que el Admin los reciba
          nombreFamilia: d.nombreFamilia,
          vivienda: d.vivienda,
          mercado: Number(d.mercado) || 0,
          cedula: d.cedula,
          primerNombre: d.primerNombre,
          segundoNombre: d.segundoNombre || "",
          primerApellido: d.primerApellido,
          segundoApellido: d.segundoApellido || "",
          sexo: d.sexo,
          telefono: d.telefono,
          nacionalidad: d.nacionalidad,
          fechaNacimiento: d.fechaNacimiento,
          esManzanero: Boolean(d.esManzanero),
          esJefeCalle: Boolean(d.esJefeCalle),
          carnetCodigo: d.carnetCodigo || "",
          carnetSerial: d.carnetSerial || "",
          email: d.email || "",
          password: d.password || "", // Solo se hasheará si el Admin aprueba
          notes: d.notes || ""
        }
      });

      return res.status(202).json({ 
        message: "Los cambios han sido enviados al Administrador para su revisión." 
      });
    }

    // --- CASO 2: EL USUARIO ES ADMINISTRADOR (EDICIÓN DIRECTA CON TRANSACCIÓN) ---
    await db.runTransaction(async (t) => {
      const personaRef = db.collection("personas").doc(String(idPersona));
      const pSnap = await t.get(personaRef);
      
      if (!pSnap.exists) throw new Error("Persona no encontrada");

      const idNucleo = pSnap.data().id_nucleo;
      const nucleoRef = db.collection("nucleos_familiares").doc(String(idNucleo));

      // 1. Actualizar Núcleo
      t.update(nucleoRef, {
        nombre_familia: d.nombreFamilia,
        vivienda: d.vivienda,
        mercado: Number(d.mercado) || 0
      });

      // 2. Preparar objeto de actualización de Persona
      const updatePersona = {
        cedula: d.cedula,
        primer_nombre: d.primerNombre,
        primer_apellido: d.primerApellido,
        segundo_nombre: d.segundoNombre || "",
        segundo_apellido: d.segundoApellido || "",
        sexo: d.sexo,
        telefono: d.telefono,
        codigo_carnet: d.carnetCodigo || "",
        serial_carnet: d.carnetSerial || "",
        nacionalidad: d.nacionalidad,
        es_manzanero: Boolean(d.esManzanero),
        es_jefe_calle: Boolean(d.esJefeCalle),
        fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
      };

      if (d.fechaNacimiento) {
        updatePersona.fecha_nacimiento = admin.firestore.Timestamp.fromDate(new Date(d.fechaNacimiento));
      }

      t.update(personaRef, updatePersona);

      // 3. Gestión de Usuario (Credenciales)
      const userQuery = await db.collection("usuarios")
        .where("id_persona", "==", String(idPersona))
        .get();
      
      if (d.esJefeCalle) {
        let userData = { 
          email: d.email, 
          id_persona: String(idPersona),
          rol: "Jefe"
        };

        if (d.password) {
          const salt = await bcrypt.genSalt(10);
          userData.password = await bcrypt.hash(d.password, salt);
        }

        if (userQuery.empty) {
          t.set(db.collection("usuarios").doc(), userData);
        } else {
          t.update(userQuery.docs[0].ref, userData);
        }
      } else if (!userQuery.empty) {
        // Si ya no es jefe de calle, se revoca el acceso
        t.delete(userQuery.docs[0].ref);
      }
    });

    res.json({ message: "Jefe actualizado correctamente por el Administrador" });

  } catch (err) {
    console.error("Error en PUT editar-jefe:", err);
    res.status(500).json({ message: "Error al procesar: " + err.message });
  }
});

Router.get("/solicitudes-pendientes", verificarToken, async (req, res) => {
  try {
    const snapshot = await db.collection("solicitudes_aprobacion")
      .where("estado", "==", "Pendiente")
      .orderBy("fecha_creacion", "desc")
      .get();

    if (snapshot.empty) return res.json([]);

    const solicitudes = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let nombreSolicitante = "Usuario Desconocido";

      // Buscamos quién hizo la solicitud usando su id_usuario
      const userDoc = await db.collection("usuarios").doc(String(data.id_usuario_solicitante)).get();
      if (userDoc.exists) {
        const personaDoc = await db.collection("personas").doc(String(userDoc.data().id_persona)).get();
        if (personaDoc.exists) {
          nombreSolicitante = `${personaDoc.data().primer_nombre} ${personaDoc.data().primer_apellido}`;
        }
      }

      return {
        id_solicitud: doc.id,
        ...data,
        primer_nombre: nombreSolicitante // Para mantener compatibilidad con tu tabla
      };
    }));

    res.json(solicitudes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
});

Router.post("/procesar-solicitud", verificarToken, async (req, res) => {
  const { id_solicitud, accion } = req.body;

  try {
    const solicitudRef = db.collection("solicitudes_aprobacion").doc(id_solicitud);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) return res.status(404).json({ message: "Solicitud no encontrada" });

    const solicitudData = solicitudDoc.data();
    const { tipo_operacion, datos_json, id_referencia } = solicitudData;

    if (accion === "Aprobado") {
      
      // --- CASO A: REGISTRO DE JEFE NUEVO ---
      if (tipo_operacion === "Registro Jefe") {
        const nuevoNucleoRef = db.collection("nucleos_familiares").doc();
        const nuevaPersonaRef = db.collection("personas").doc();
        const personaId = nuevaPersonaRef.id;

        await nuevoNucleoRef.set({
          id_nucleo: nuevoNucleoRef.id,
          nombre_familia: datos_json.nombreFamilia,
          vivienda: datos_json.vivienda,
          mercado: datos_json.mercado || 0,
          status: "Activo"
        });

        await nuevaPersonaRef.set({
          id_persona: personaId,
          id_nucleo: nuevoNucleoRef.id,
          cedula: datos_json.cedula,
          primer_nombre: datos_json.primerNombre,
          primer_apellido: datos_json.primerApellido,
          rol: "Jefe",
          status: "Activo",
          fecha_nacimiento: datos_json.fechaNacimiento ? new Date(datos_json.fechaNacimiento) : null,
          // ... (resto de tus campos)
        });

        await nuevoNucleoRef.update({ id_jefe_principal: personaId });

        if (datos_json.esJefeCalle && datos_json.email && datos_json.password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(datos_json.password, salt);
          await db.collection("usuarios").add({
            id_persona: personaId,
            email: datos_json.email,
            password: hashedPassword,
            rol: "Jefe",
            status: "Activo"
          });
        }
      }

      // --- CASO B: EDICIÓN DE PERSONA EXISTENTE ---
      else if (tipo_operacion === "Edicion Persona") {
        await db.collection("personas").doc(id_referencia).update({
          primer_nombre: datos_json.primerNombre,
          primer_apellido: datos_json.primerApellido,
          cedula: datos_json.cedula,
          telefono: datos_json.telefono
          // Solo actualizas los campos que permitas editar
        });
      }

      // --- CASO C: ARCHIVAR (BAJA) ---
      else if (tipo_operacion === "Baja Persona") {
        await db.collection("personas").doc(id_referencia).update({
          status: "Inactivo",
          fecha_baja: new Date(),
          motivo_baja: datos_json.motivo || "Solicitado por Jefe de Calle"
        });
      }
    }

    // Al final, marcamos la solicitud como procesada (sea Aprobado o Denegado)
    await solicitudRef.update({ estado: accion });

    res.json({ message: `Solicitud de ${tipo_operacion} procesada como: ${accion}` });

  } catch (err) {
    console.error("Error al procesar:", err);
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

Router.post("/registrar-solicitud", verificarToken, async (req, res) => {
  try {
    const { id_usuario, id_persona: idSolicitante } = req.user;
    const { tipo_operacion, datos_json, id_referencia } = req.body; 
    // id_referencia: ID de la persona o núcleo que se quiere editar/archivar

    const nuevaSolicitud = {
      id_usuario_solicitante: String(id_usuario),
      tipo_operacion, // "Edicion Persona", "Baja Persona", etc.
      datos_json,    // Objeto con los nuevos datos o motivo de baja
      id_referencia: id_referencia || null,
      estado: "Pendiente",
      fecha_creacion: new Date()
    };

    await db.collection("solicitudes_aprobacion").add(nuevaSolicitud);
    res.json({ message: "Solicitud enviada al administrador" });
  } catch (err) {
    res.status(500).json({ message: "Error al enviar solicitud" });
  }
});

export default Router;
