import express from "express";
import pool from "../config/bd.js";
import db from "../config/firebase.js";
import admin from "firebase-admin";
import verificarToken from "../Middleware/autenticación.js";

const Router = express.Router();


Router.get("/nucleos", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user;

    // 1. Obtener todos los núcleos y personas en paralelo para mayor velocidad
    const [nucleosSnap, personasSnap] = await Promise.all([
      db.collection("nucleos_familiares").get(),
      db.collection("personas").where("status", "==", "Activo").get()
    ]);

    let nucleosDocs = nucleosSnap.docs.map(doc => doc.data());
    const todasLasPersonas = personasSnap.docs.map(doc => doc.data());

    // 2. Lógica de filtrado por vivienda para Jefes de Calle
    if (rol !== "Administrador") {
      // Buscamos el núcleo del jefe que hace la petición para saber su vivienda
      const miNucleo = nucleosDocs.find(n => String(n.id_jefe_principal) === String(id_persona));
      const miVivienda = miNucleo?.vivienda;

      if (miVivienda) {
        nucleosDocs = nucleosDocs.filter(n => n.vivienda === miVivienda);
      } else {
        return res.json([]); // Si no tiene vivienda asignada, no ve nada
      }
    }

    // 3. Agrupación y mapeo (Hidratación de datos)
    const familiasMap = {};

    nucleosDocs.forEach((n) => {
      // Buscamos los miembros que pertenecen a este núcleo
      const miembros = todasLasPersonas.filter(p => String(p.id_nucleo) === String(n.id_nucleo));

      familiasMap[n.id_nucleo] = {
        id: n.id_nucleo,
        nombre_familia: n.nombre_familia,
        vivienda: n.vivienda,
        mercado: n.mercado,
        totalMiembros: miembros.length,
        members: miembros.map(p => ({
          id: p.id_persona,
          primer_nombre: p.primer_nombre,
          primer_apellido: p.primer_apellido,
          rol: (p.rol === "Jefe" || p.rol === "Administrador") ? "Jefe de Familia" : "Miembro",
          status: p.status,
          isHead: p.rol === "Jefe"
        }))
      };
    });

    const resultado = Object.values(familiasMap).sort((a, b) => 
      String(a.id).localeCompare(String(b.id))
    );

    res.json(resultado);
  } catch (err) {
    console.error("Error GET /api/nucleos:", err);
    res.status(500).json({ message: "Error al obtener los núcleos familiares" });
  }
});

Router.get("/personas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const personaDoc = await db.collection("personas").doc(String(id)).get();
    if (!personaDoc.exists) return res.status(404).json({ message: "Persona no encontrada" });

    const personaData = personaDoc.data();

    // DISPARAR TODO EN PARALELO
    const [nucleoDoc, usuarioQuery, miembrosSnapshot] = await Promise.all([
      db.collection("nucleos_familiares").doc(String(personaData.id_nucleo)).get(),
      personaData.es_jefe_calle 
        ? db.collection("usuarios").where("id_persona", "==", personaData.id_persona).limit(1).get()
        : Promise.resolve({ empty: true }),
      db.collection("personas").where("id_nucleo", "==", personaData.id_nucleo).get()
    ]);

    // Procesar resultados
    const datosNucleo = nucleoDoc.exists ? nucleoDoc.data() : { nombre_familia: "N/A", vivienda: "N/A" };
    const u = !usuarioQuery.empty ? usuarioQuery.docs[0].data() : {};
    
    // Formatear fecha para el Frontend (evita el Invalid Date)
    let fechaISO = null;
    if (personaData.fecha_nacimiento?._seconds) {
      fechaISO = new Date(personaData.fecha_nacimiento._seconds * 1000).toISOString().split('T')[0];
    }

    res.json({
      ...personaData,
      ...datosNucleo,
      email: u.email || null,
      password: u.password || null,
      fecha_nacimiento: fechaISO,
      totalMiembros: miembrosSnapshot.size
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener la ficha" });
  }
});


Router.post("/agregar-miembro", verificarToken, async (req, res) => {
  const { rol, id_persona: idUsuarioLogueado } = req.user;
  const d = req.body;

  if (!d.idNucleo || !d.primerNombre || !d.cedula) {
    return res.status(400).json({ message: "idNucleo, primerNombre y cedula son requeridos" });
  }

  try {
    // --- CASO 1: JEFE DE CALLE (CREA SOLICITUD) ---
    if (rol !== "Administrador") {
      const solicitudRef = db.collection("solicitudes_aprobacion").doc();
      
      await solicitudRef.set({
        id_usuario_solicitante: String(idUsuarioLogueado),
        tipo_operacion: "Registro Miembro",
        id_referencia: String(d.idNucleo), // Referenciamos al núcleo donde se agregará
        estado: "Pendiente",
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
        datos_json: {
          idNucleo: String(d.idNucleo),
          cedula: d.cedula,
          primerNombre: d.primerNombre,
          segundoNombre: d.segundoNombre || "",
          primerApellido: d.primerApellido,
          segundoApellido: d.segundoApellido || "",
          sexo: d.sexo || "",
          telefono: d.telefono || "",
          nacionalidad: d.nacionalidad || "",
          carnetCodigo: d.carnetCodigo || "",
          carnetSerial: d.carnetSerial || "",
          fechaNacimiento: d.fechaNacimiento || null
        }
      });

      return res.status(201).json({ 
        message: "Solicitud de registro de miembro enviada al Administrador." 
      });
    }

    // --- CASO 2: ADMINISTRADOR (REGISTRO DIRECTO) ---
    const personaRef = db.collection("personas").doc();
    const nuevoMiembro = {
      id_persona: personaRef.id,
      id_nucleo: String(d.idNucleo),
      rol: "Miembro",
      cedula: d.cedula,
      status: "Activo",
      primer_nombre: d.primerNombre,
      segundo_nombre: d.segundoNombre || "",
      primer_apellido: d.primerApellido,
      segundo_apellido: d.segundoApellido || "",
      sexo: d.sexo || "",
      telefono: d.telefono || "",
      nacionalidad: d.nacionalidad || "",
      codigo_carnet: d.carnetCodigo || "",
      serial_carnet: d.carnetSerial || "",
      es_manzanero: false,
      es_jefe_calle: false,
      fecha_registro: admin.firestore.FieldValue.serverTimestamp(),
      fecha_nacimiento: d.fechaNacimiento 
        ? admin.firestore.Timestamp.fromDate(new Date(d.fechaNacimiento)) 
        : null
    };

    await personaRef.set(nuevoMiembro);
    res.status(201).json({ message: "Miembro agregado directamente", id: personaRef.id });

  } catch (err) {
    console.error("Error en agregar-miembro:", err);
    res.status(500).json({ message: "Error al procesar operación" });
  }
});

Router.put("/editar-miembro/:id", verificarToken, async (req, res) => {
  const { id } = req.params; // ID de la persona a editar
  const { rol, id_persona: idUsuarioLogueado } = req.user;
  const d = req.body;

  try {
    // --- CASO 1: JEFE DE CALLE (CREA SOLICITUD DE EDICIÓN) ---
    if (rol !== "Administrador") {
      const solicitudRef = db.collection("solicitudes_aprobacion").doc();
      
      await solicitudRef.set({
        id_usuario_solicitante: String(idUsuarioLogueado),
        tipo_operacion: "Edicion Miembro",
        id_referencia: String(id), // ID de la persona a editar
        estado: "Pendiente",
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
        datos_json: {
          cedula: d.cedula,
          primerNombre: d.primerNombre,
          segundoNombre: d.segundoNombre || "",
          primerApellido: d.primerApellido,
          segundoApellido: d.segundoApellido || "",
          sexo: d.sexo,
          telefono: d.telefono || "",
          nacionalidad: d.nacionalidad,
          carnetCodigo: d.carnetCodigo || "",
          carnetSerial: d.carnetSerial || "",
          fechaNacimiento: d.fechaNacimiento || null
        }
      });

      return res.status(202).json({ 
        message: "Los cambios del miembro han sido enviados a revisión." 
      });
    }

    // --- CASO 2: ADMINISTRADOR (ACTUALIZACIÓN DIRECTA) ---
    const personaRef = db.collection("personas").doc(String(id));
    
    const updateData = {
      cedula: d.cedula,
      primer_nombre: d.primerNombre,
      segundo_nombre: d.segundoNombre || "",
      primer_apellido: d.primerApellido,
      segundo_apellido: d.segundoApellido || "",
      sexo: d.sexo,
      telefono: d.telefono || "",
      nacionalidad: d.nacionalidad,
      codigo_carnet: d.carnetCodigo || "",
      serial_carnet: d.carnetSerial || "",
      fecha_actualizacion: admin.firestore.FieldValue.serverTimestamp()
    };

    if (d.fechaNacimiento) {
      updateData.fecha_nacimiento = admin.firestore.Timestamp.fromDate(new Date(d.fechaNacimiento));
    }

    await personaRef.update(updateData);
    res.json({ message: "Miembro actualizado directamente por el Administrador" });

  } catch (err) {
    console.error("Error en editar-miembro:", err);
    res.status(500).json({ message: "Error al actualizar el miembro" });
  }
});


export default Router;
