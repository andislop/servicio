import express from "express";
import pool from "../config/bd.js";
import db from "../config/firebase.js";
import dotenv from "dotenv";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verificarToken from "../Middleware/autenticación.js";

const Router = express.Router();
dotenv.config();

// 1. Obtener todos los usuarios con datos de persona y núcleo
Router.get("/usuarios", async (req, res) => {
  try {
    // 1. Obtener los usuarios ordenados por email
    const usuariosSnapshot = await db
      .collection("usuarios")
      .orderBy("email", "asc")
      .get();

    const usuariosPromesas = usuariosSnapshot.docs.map(async (doc) => {
      const u = doc.data();
      let primer_nombre = "N/A";
      let vivienda = "N/A";
      let rol = "N/A";
      let totalMiembros = 0;

      if (u.id_persona !== undefined) {
        // IMPORTANTE: Convertimos a String porque el ID del documento en 'personas' es un string
        const pDoc = await db
          .collection("personas")
          .doc(String(u.id_persona))
          .get();

        if (pDoc.exists) {
          const pData = pDoc.data();
          primer_nombre = pData.primer_nombre;
          rol = pData.rol;
          const idNucleo = pData.id_nucleo; // Obtenemos el ID del núcleo

          // 2. Buscar vivienda en 'nucleos_familiares' usando el id_jefe_principal
          // Nota: En tu captura el campo es número, asegúrate de que coincida el tipo
          const nSnapshot = await db
            .collection("nucleos_familiares")
            .where("id_jefe_principal", "==", u.id_persona)
            .limit(1)
            .get();

          if (!nSnapshot.empty) {
            vivienda = nSnapshot.docs[0].data().vivienda;
          }

          // 3. Obtener el total de miembros real del núcleo
          if (idNucleo) {
            const conteoSnapshot = await db
              .collection("personas")
              .where("id_nucleo", "==", idNucleo)
              .where("status", "==", "Activo")
              .count()
              .get();
            totalMiembros = conteoSnapshot.data().count;
          }
        }
      }

      return {
        email: u.email,
        id_persona: u.id_persona,
        primer_nombre,
        vivienda,
        rol,
        totalMiembros, // Ahora devuelve el conteo real basado en id_nucleo
      };
    });

    const resultados = await Promise.all(usuariosPromesas);
    res.json(resultados);
  } catch (err) {
    console.error("Error en /usuarios:", err);
    res
      .status(500)
      .json({
        message: "Error al obtener usuarios de Firebase",
        error: err.message,
      });
  }
});

// 2. Login con Firebase
Router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por email
    const snapshot = await db
      .collection("usuarios")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const doc = snapshot.docs[0];
    const usuario = doc.data();

    // En producción usar bcrypt. En tu captura el password es "a"
    // Si ya usas hashes, mantén bcrypt.compare
    const match =
      password === usuario.password ||
      (await bcrypt.compare(password, usuario.password));

    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Buscar el rol en la colección personas
    const pDoc = await db
      .collection("personas")
      .doc(String(usuario.id_persona))
      .get();
    const rol = pDoc.exists ? pDoc.data().rol : "Usuario";

    const token = jwt.sign(
      {
        id: doc.id,
        rol: rol,
        id_persona: usuario.id_persona,
        email: usuario.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.cookie("acceso_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: { email: usuario.email, id_login: usuario.id_persona },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// 3. Obtener perfil actual (/me)
Router.get("/me", verificarToken, async (req, res) => {
  try {
    const uDoc = await db.collection("usuarios").doc(req.user.id).get();
    if (!uDoc.exists) return res.status(404).json({ message: "No encontrado" });

    const pDoc = await db
      .collection("personas")
      .doc(String(uDoc.data().id_persona))
      .get();

    res.json({
      user: {
        email: uDoc.data().email,
        ...pDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil" });
  }
});

// 4. Datos para Grafica 1 (Habitantes por Torre)
Router.get("/datos-grafica", async (req, res) => {
  try {
    // 1. Obtener todos los núcleos para mapear ID -> Vivienda
    const nucleosSnapshot = await db.collection("nucleos_familiares").get();
    const mapaViviendas = {};
    nucleosSnapshot.forEach((doc) => {
      const data = doc.data();
      mapaViviendas[data.id_nucleo] = data.vivienda; // Ejemplo: { "1": "Torre 5" }
    });

    // 2. Obtener todas las personas
    const personasSnapshot = await db.collection("personas").get();
    const conteo = {};

    personasSnapshot.forEach((doc) => {
      const p = doc.data();
      // Buscamos la vivienda usando el id_nucleo de la persona
      const torre = mapaViviendas[p.id_nucleo] || "Sin Torre";
      conteo[torre] = (conteo[torre] || 0) + 1;
    });

    const data = Object.keys(conteo).map((torre) => ({
      torre,
      total_habitantes: conteo[torre],
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al generar gráfica de torres" });
  }
});

// 5. Datos para Grafica 2 (Rangos de Edad)
Router.get("/datos-grafica-2", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user;
    const hoy = new Date();
    const rangos = {
      Niños: 0,
      Adolescentes: 0,
      Adultos: 0,
      "Adultos Mayores": 0,
    };

    // 1. Obtener todas las personas (podemos filtrar por 'Activo' si es necesario)
    let personasSnapshot = await db
      .collection("personas")
      .where("status", "==", "Activo")
      .get();

    if (personasSnapshot.empty) return res.json([]);

    let personasParaConteo = [];

    // 2. Lógica de filtrado según Rol
    if (rol === "Administrador") {
      // El admin procesa todos los documentos directamente
      personasParaConteo = personasSnapshot.docs.map((doc) => doc.data());
    } else {
      // --- Lógica para Jefe de Calle ---
      // Buscamos la vivienda del Jefe
      const nJefeSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "in", [
          Number(id_persona),
          String(id_persona),
        ])
        .limit(1)
        .get();

      if (nJefeSnapshot.empty) return res.json([]);

      const viviendaJefe = nJefeSnapshot.docs[0].data().vivienda;

      // Obtenemos los IDs de los núcleos de esa torre/vivienda
      const nucleosTorreSnapshot = await db
        .collection("nucleos_familiares")
        .where("vivienda", "==", viviendaJefe)
        .get();

      const idsNucleosTorre = nucleosTorreSnapshot.docs.map((doc) =>
        String(doc.id),
      );

      // Filtramos las personas que pertenezcan a esos núcleos
      personasParaConteo = personasSnapshot.docs
        .map((doc) => doc.data())
        .filter((p) => idsNucleosTorre.includes(String(p.id_nucleo)));
    }

    // 3. Procesar los rangos de edad con la lista filtrada
    personasParaConteo.forEach((p) => {
      if (p.fecha_nacimiento) {
        const fechaNac = p.fecha_nacimiento.toDate
          ? p.fecha_nacimiento.toDate()
          : new Date(p.fecha_nacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }

        if (edad < 12) rangos["Niños"]++;
        else if (edad >= 12 && edad <= 17) rangos["Adolescentes"]++;
        else if (edad >= 18 && edad <= 59)
          rangos["Adultos"]++; // Ajustado a 59 según tu lógica previa
        else rangos["Adultos Mayores"]++;
      }
    });

    const totalFiltrado = personasParaConteo.length;
    const data = Object.keys(rangos).map((rango) => ({
      rango_edad: rango,
      cantidad: rangos[rango],
      porcentaje:
        totalFiltrado > 0
          ? parseFloat(((rangos[rango] * 100) / totalFiltrado).toFixed(2))
          : 0,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error en /datos-grafica-2:", err);
    res.status(500).json({ message: "Error al generar gráfica de edades" });
  }
});

// Logout (Se mantiene igual ya que solo borra la cookie)
Router.post("/logout", (req, res) => {
  res.clearCookie("acceso_token");
  return res.status(200).json({ message: "Sesión cerrada" });
});

Router.get("/datos-personas", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user;

    if (rol === "Administrador") {
      const personasSnapshot = await db.collection("personas").get();
      const total_miembros = personasSnapshot.size;

      const nucleosUnicos = new Set();
      personasSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id_nucleo) nucleosUnicos.add(String(data.id_nucleo));
      });

      const total_nucleos = nucleosUnicos.size || 1;
      const promedio = Math.round(total_miembros / total_nucleos);

      return res.json([{ total_miembros, promedio }]);
    } else {
      // --- LÓGICA PARA JEFE DE CALLE ---
      // Buscamos el núcleo donde el usuario es el jefe principal
      const nJefeSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "in", [
          Number(id_persona),
          String(id_persona),
        ])
        .limit(1)
        .get();

      if (nJefeSnapshot.empty) {
        return res.json([{ total_miembros: 0, promedio: 0 }]);
      }

      const jefeData = nJefeSnapshot.docs[0].data();
      const viviendaJefe = jefeData.vivienda;

      // Obtenemos todos los núcleos de esa torre/vivienda
      const nucleosTorreSnapshot = await db
        .collection("nucleos_familiares")
        .where("vivienda", "==", viviendaJefe)
        .get();

      // Mapeamos los IDs asegurando que sean Strings para la siguiente consulta
      const idsNucleosTorre = nucleosTorreSnapshot.docs.map((doc) =>
        String(doc.id),
      );

      if (idsNucleosTorre.length === 0) {
        return res.json([{ total_miembros: 0, promedio: 0 }]);
      }

      // Contamos personas: Buscamos por id_nucleo (como String y Number)
      const personasTorreSnapshot = await db
        .collection("personas")
        .where("id_nucleo", "in", idsNucleosTorre)
        .get();

      // Si la consulta anterior falla por tipos de datos, sumamos manualmente o
      // verificamos si al menos hay 1 (el jefe mismo)
      const total_miembros = personasTorreSnapshot.size || 1;
      const promedio = Math.round(total_miembros / idsNucleosTorre.length);

      return res.json([{ total_miembros, promedio }]);
    }
  } catch (err) {
    console.error("Error en /datos-personas:", err);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});
Router.get("/datos-personas-2", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user; // id_persona debe ser el ID numérico

    if (rol === "Administrador") {
      // 1. Estadísticas Globales
      const personasSnapshot = await db
        .collection("personas")
        .where("status", "==", "Inactivo")
        .get();
      const total_miembros = personasSnapshot.size;

      // Contar núcleos únicos presentes en la colección personas
      const nucleosUnicos = new Set();
      personasSnapshot.forEach((doc) => {
        if (doc.data().id_nucleo) nucleosUnicos.add(doc.data().id_nucleo);
      });

      const total_nucleos = nucleosUnicos.size || 1;
      const promedio = Math.round(total_miembros / total_nucleos);

      return res.json([{ total_miembros, promedio }]);
    } else {
      // 2. Estadísticas por Torre (Jefe de Calle)
      // Buscamos la vivienda asignada al jefe
      const nJefeSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "==", Number(id_persona))
        .limit(1)
        .get();

      if (nJefeSnapshot.empty)
        return res.json([{ total_miembros: 0, promedio: 0 }]);

      const viviendaJefe = nJefeSnapshot.docs[0].data().vivienda;

      // Obtenemos todos los núcleos de esa torre
      const nucleosTorreSnapshot = await db
        .collection("nucleos_familiares")
        .where("vivienda", "==", viviendaJefe)
        .get();

      const idsNucleosTorre = nucleosTorreSnapshot.docs.map(
        (doc) => doc.data().id_nucleo,
      );

      if (idsNucleosTorre.length === 0)
        return res.json([{ total_miembros: 0, promedio: 0 }]);

      // Contamos personas que pertenezcan a esos núcleos
      const personasTorreSnapshot = await db
        .collection("personas")
        .where("id_nucleo", "in", idsNucleosTorre)
        .get();

      const total_miembros = personasTorreSnapshot.size;
      const promedio = Math.round(total_miembros / idsNucleosTorre.length);

      return res.json([{ total_miembros, promedio }]);
    }
  } catch (err) {
    console.error("Error en /datos-personas:", err);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

Router.get("/manzaneros", async (req, res) => {
  try {
    // 1. Obtener todos los que son manzaneros
    const manzanerosSnapshot = await db
      .collection("personas")
      .where("es_manzanero", "==", true)
      .get();

    // 2. Necesitamos mapear viviendas y conteos
    const nucleosSnapshot = await db.collection("nucleos_familiares").get();
    const viviendasMap = {}; // id_nucleo -> vivienda
    const conteoPorVivienda = {}; // vivienda -> cantidad personas

    nucleosSnapshot.forEach((doc) => {
      const d = doc.data();
      viviendasMap[d.id_nucleo] = d.vivienda;
    });

    // Contar personas por vivienda
    const todasLasPersonas = await db.collection("personas").get();
    todasLasPersonas.forEach((doc) => {
      const p = doc.data();
      const viv = viviendasMap[p.id_nucleo];
      if (viv) {
        conteoPorVivienda[viv] = (conteoPorVivienda[viv] || 0) + 1;
      }
    });

    // 3. Formatear resultado final
    const resultados = manzanerosSnapshot.docs.map((doc) => {
      const p = doc.data();
      const vivienda = viviendasMap[p.id_nucleo] || "N/A";
      return {
        id_persona: p.id_persona,
        primer_nombre: p.primer_nombre,
        primer_apellido: p.primer_apellido,
        vivienda: vivienda,
        rol: p.rol,
        totalMiembrosVivienda: conteoPorVivienda[vivienda] || 0,
      };
    });

    res.json(resultados);
  } catch (err) {
    console.error("Error en /manzaneros:", err);
    res.status(500).json({ message: "Error al obtener manzaneros" });
  }
});

Router.get("/personas-inactivas", verificarToken, async (req, res) => {
  try {
    const { rol: userRol, id_persona } = req.user;

    // 1. Obtener todos los inactivos primero
    const snapshot = await db
      .collection("personas")
      .where("status", "==", "Inactivo")
      .orderBy("primer_nombre", "asc")
      .get();

    if (snapshot.empty) return res.json([]);

    // 2. Procesar datos y buscar viviendas
    const promesas = snapshot.docs.map(async (doc) => {
      const pData = doc.data();
      const idPersonaDoc = doc.id;
      const idNucleo = pData.id_nucleo;

      let vivienda = "N/A";
      let totalMiembros = 0;

      // Etiqueta de Rol
      const rolOriginal = pData.rol || "";
      const rolEtiqueta =
        rolOriginal === "Jefe" || rolOriginal === "Administrador"
          ? "Jefe de Familia"
          : "Miembro";

      // Búsqueda de Vivienda (por jefe principal o por id_nucleo)
      const nSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "in", [
          idPersonaDoc,
          Number(idPersonaDoc),
          String(idPersonaDoc),
        ])
        .limit(1)
        .get();

      if (!nSnapshot.empty) {
        vivienda = nSnapshot.docs[0].data().vivienda;
      } else if (idNucleo) {
        const nucleoDoc = await db
          .collection("nucleos_familiares")
          .doc(String(idNucleo))
          .get();
        if (nucleoDoc.exists) {
          vivienda = nucleoDoc.data().vivienda;
        }
      }

      // Conteo de miembros
      if (idNucleo) {
        const conteoSnapshot = await db
          .collection("personas")
          .where("id_nucleo", "==", idNucleo)
          .count()
          .get();
        totalMiembros = conteoSnapshot.data().count;
      }

      return {
        id_persona: idPersonaDoc,
        primer_nombre: pData.primer_nombre || "N/A",
        primer_apellido: pData.primer_apellido || "N/A",
        cedula: pData.cedula || "N/A",
        rol: rolEtiqueta,
        vivienda: vivienda,
        totalMiembros: totalMiembros,
        rol_original: rolOriginal,
      };
    });

    let resultados = await Promise.all(promesas);

    // 3. Aplicar Filtro de Seguridad por Rol
    if (userRol === "Administrador") {
      res.json(resultados);
    } else {
      // Si es Jefe de Calle, buscamos su propia vivienda
      const nJefeSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "in", [
          Number(id_persona),
          String(id_persona),
        ])
        .limit(1)
        .get();

      if (nJefeSnapshot.empty) return res.json([]);

      const viviendaJefe = nJefeSnapshot.docs[0].data().vivienda;

      // Solo devolvemos los inactivos de SU torre
      const filtrados = resultados.filter((p) => p.vivienda === viviendaJefe);
      res.json(filtrados);
    }
  } catch (err) {
    console.error("Error al obtener personas inactivas:", err);
    res.status(500).json({ message: "Error interno", error: err.message });
  }
});

Router.put("/eliminar-persona/:id", verificarToken, async (req, res) => {
  const { id } = req.params; // ID de la persona a inactivar
  const { rol, id_persona: idUsuarioLogueado } = req.user;
  const { motivo } = req.body; // El front debería enviar un motivo (ej: "Se mudó")

  try {
    const personaRef = db.collection("personas").doc(String(id));
    const pSnap = await personaRef.get();

    if (!pSnap.exists) {
      return res.status(404).json({ message: "La persona no existe" });
    }

    // --- CASO 1: JEFE DE CALLE (CREA SOLICITUD DE BAJA) ---
    if (rol !== "Administrador") {
      const solicitudRef = db.collection("solicitudes_aprobacion").doc();

      await solicitudRef.set({
        id_usuario_solicitante: String(idUsuarioLogueado),
        tipo_operacion: "Baja Persona",
        id_referencia: String(id), // ID de la persona afectada
        estado: "Pendiente",
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(),
        datos_json: {
          nombre_completo: `${pSnap.data().primer_nombre} ${pSnap.data().primer_apellido}`,
          cedula: pSnap.data().cedula,
          motivo: motivo || "Solicitud de inactivación por Jefe de Calle",
          id_nucleo: pSnap.data().id_nucleo,
        },
      });

      return res.status(202).json({
        message: "Solicitud de baja enviada al Administrador.",
      });
    }

    // --- CASO 2: ADMINISTRADOR (INACTIVACIÓN DIRECTA) ---
    // Usamos una transacción o batch por si hay que eliminar también el usuario
    const batch = db.batch();

    // 1. Marcar persona como Inactiva
    batch.update(personaRef, {
      status: "Inactivo",
      fecha_baja: admin.firestore.FieldValue.serverTimestamp(),
      motivo_baja: motivo || "Inactivado por Administrador",
    });

    // 2. Si tenía cuenta de usuario, también la inactivamos
    const userQuery = await db
      .collection("usuarios")
      .where("id_persona", "==", String(id))
      .get();

    userQuery.forEach((uDoc) => {
      batch.update(uDoc.ref, { status: "Inactivo" });
    });

    await batch.commit();

    res.json({
      message: "Persona y sus accesos marcados como inactivos correctamente.",
    });
  } catch (err) {
    console.error("Error al inactivar persona:", err);
    res
      .status(500)
      .json({ message: "Error al procesar la solicitud", error: err.message });
  }
});

Router.put("/restaurar-persona/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { rol: userRol } = req.user;

    // Solo el administrador debería poder restaurar registros
    if (userRol !== "Administrador") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para restaurar registros" });
    }

    const personaRef = db.collection("personas").doc(String(id));
    const pSnap = await personaRef.get();

    if (!pSnap.exists) {
      return res.status(404).json({ message: "La persona no existe" });
    }

    // Cambiamos status a Activo
    await personaRef.update({
      status: "Activo",
      fecha_restauracion: new Date().toISOString(),
    });

    res.json({ message: "Persona restaurada con éxito" });
  } catch (err) {
    console.error("Error al restaurar persona:", err);
    res
      .status(500)
      .json({ message: "Error al restaurar el registro", error: err.message });
  }
});

Router.get("/poblacion", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user;
    let personasFiltradas = [];

    // 1. Obtener todas las personas activas inicialmente
    const snapshot = await db
      .collection("personas")
      .where("status", "==", "Activo")
      .get();
    if (snapshot.empty) return res.json([]);

    // 2. Procesar datos básicos y categorías
    const todasLasPersonas = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const idNucleo = data.id_nucleo;

        // Cálculo de Edad
        let edad = 0;
        if (data.fecha_nacimiento) {
          const birthDate = data.fecha_nacimiento.toDate
            ? data.fecha_nacimiento.toDate()
            : new Date(data.fecha_nacimiento);
          const today = new Date();
          edad = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
            edad--;
        }

        // Categorización
        let categoria = "Otro";
        if (edad <= 12) categoria = "Niño/a";
        else if (edad <= 17) categoria = "Adolescente";
        else if (edad <= 59) categoria = "Adulto";
        else categoria = "Adulto Mayor";

        // Obtener Vivienda del núcleo
        let vivienda = "N/A";
        let idNucleoStr = idNucleo ? String(idNucleo) : null;

        if (idNucleoStr) {
          const nucleoDoc = await db
            .collection("nucleos_familiares")
            .doc(idNucleoStr)
            .get();
          if (nucleoDoc.exists) {
            vivienda = nucleoDoc.data().vivienda || "Sin Dirección";
          }
        }

        return {
          id: doc.id,
          primer_nombre: data.primer_nombre || "",
          segundo_nombre: data.segundo_nombre || "",
          primer_apellido: data.primer_apellido || "",
          segundo_apellido: data.segundo_apellido || "",
          cedula: data.cedula || "N/A",
          vivienda: vivienda,
          edad,
          categoria,
          id_nucleo: idNucleoStr,
        };
      }),
    );

    // 3. Lógica de Filtrado por Rol
    if (rol === "Administrador") {
      // El administrador ve a todos
      personasFiltradas = todasLasPersonas;
    } else {
      // Buscamos la vivienda que gestiona este Jefe
      const nJefeSnapshot = await db
        .collection("nucleos_familiares")
        .where("id_jefe_principal", "in", [
          Number(id_persona),
          String(id_persona),
        ])
        .limit(1)
        .get();

      if (nJefeSnapshot.empty) {
        return res.json([]); // Si no tiene vivienda asignada, no ve a nadie
      }

      const viviendaJefe = nJefeSnapshot.docs[0].data().vivienda;

      // Filtramos la lista global: solo personas cuya vivienda coincida con la del jefe
      personasFiltradas = todasLasPersonas.filter(
        (p) => p.vivienda === viviendaJefe,
      );
    }

    res.json(personasFiltradas);
  } catch (err) {
    console.error("Error en /poblacion:", err);
    res.status(500).json({ message: "Error al filtrar población" });
  }
});

Router.get("/personas", async (req, res) => {
  try {
    const personasSnapshot = await db.collection("personas").get();
    const nucleosSnapshot = await db.collection("nucleos_familiares").get();

    const nucleosMap = {};
    nucleosSnapshot.forEach((doc) => {
      nucleosMap[doc.id] = doc.data();
    });

    const datosCompletos = personasSnapshot.docs.map((doc) => {
      const p = doc.data();
      let fechaLegible = "N/A";
      let edadCalculada = "N/A";

      if (p.fecha_nacimiento && p.fecha_nacimiento._seconds) {
        const fecha = new Date(p.fecha_nacimiento._seconds * 1000);
        fechaLegible = `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1).toString().padStart(2, "0")}/${fecha.getFullYear()}`;

        const hoy = new Date();
        edadCalculada = hoy.getFullYear() - fecha.getFullYear();
        if (
          hoy.getMonth() < fecha.getMonth() ||
          (hoy.getMonth() === fecha.getMonth() &&
            hoy.getDate() < fecha.getDate())
        ) {
          edadCalculada--;
        }
      }

      const infoNucleo = nucleosMap[p.id_nucleo] || {};

      return {
        ...p,
        fecha_nacimiento: fechaLegible,
        edad: edadCalculada,
        // Convertimos a Mayúsculas para mantener uniformidad
        vivienda_extra: (infoNucleo.vivienda || "N/A").toUpperCase(),
        nombre_familia_extra: (
          infoNucleo.nombre_familia || "N/A"
        ).toUpperCase(),
      };
    });

    // --- EL TRUCO DEL ORDENAMIENTO ---
    // Ordenamos alfabéticamente por vivienda (Torre 1, Torre 2...)
    datosCompletos.sort((a, b) => {
      if (b.vivienda_extra > a.vivienda_extra) return 1;
      if (b.vivienda_extra < a.vivienda_extra) return -1;
      return 0;
    });

    res.json(datosCompletos);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
export default Router;
