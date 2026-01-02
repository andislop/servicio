import express from "express";
import pool from "../bd.js";

const Router = express.Router();

// Api para obtener jefes de familia
Router.get("/jefes", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
    p.id_persona,
    p.primer_nombre,
    p.primer_apellido,
    n.vivienda, 
    p.rol
    FROM personas p
    LEFT JOIN usuarios u ON p.id_persona = u.id_persona
    LEFT JOIN nucleos_familiares n ON p.id_nucleo = n.id_nucleo
    WHERE p.rol = "Jefe"
    ORDER BY p.id_persona ASC`
    );

    const mRoutered = rows.map((r) => ({
      id: r.id_persona,
      primerNombre: r.primer_nombre ?? "",
      primerApellido: r.primer_apellido ?? "",
      vivienda: r.vivienda ?? "",
      rol: r.rol ?? "",

    }));

    res.status(200).json(mRoutered);
  } catch (err) {
    console.error("Error GET /api/jefes:", err);
    res.status(500).json({ message: "Error al obtener jefes de familia" });
  }
});

// Api para enviar jefes de familia
Router.post("/jefes", async (req, res) => {
  const {
    nombre,
    fechaNacimiento,
    ocupacion,
    email,
    telefono,
    estado,
    nombreFamilia,
    direccion,
    notas,
  } = req.body;

  if (!nombre || !nombreFamilia) {
    return res
      .status(400)
      .json({ message: "nombre y nombreFamilia son requeridos" });
  }

  try {
    const query = `INSERT INTO jefes_familia 
      (nombre, fechaNacimiento, ocupacion, email, telefono, estado, nombreFamilia, direccion, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      nombre,
      fechaNacimiento || null,
      ocupacion || null,
      email || null,
      telefono || null,
      estado || null,
      nombreFamilia,
      direccion || null,
      notas || null,
    ]);

    res.status(201).json({ message: "Creado", id: result.insertId });
  } catch (err) {
    console.error("Error POST /api/jefes:", err);
    res.status(500).json({ message: "Error al crear jefe de familia" });
  }
});

// Api para actualizar jefes de familia
Router.put("/jefes/:id", async (req, res) => {
  const { id } = req.params;
  // Aceptamos tanto claves en español que enviará el frontend (nombre, fechaNacimiento...)
  // como claves en camelCase por si alguna parte las envía así.
  const {
    nombre,
    name,
    fechaNacimiento,
    dob,
    ocupacion,
    occupation,
    email,
    telefono,
    phone,
    estado,
    status,
    nombreFamilia,
    familyName,
    direccion,
    address,
    notas,
    notes,
  } = req.body;

  // Mapear valores preferidos (primero el español)
  const finalNombre = nombre ?? name ?? "";
  const finalFechaNacimiento = fechaNacimiento ?? dob ?? null;
  const finalOcupacion = ocupacion ?? occupation ?? null;
  const finalEmail = email ?? null;
  const finalTelefono = telefono ?? phone ?? null;
  const finalEstado = estado ?? status ?? null;
  const finalNombreFamilia = nombreFamilia ?? familyName ?? "";
  const finalDireccion = direccion ?? address ?? null;
  const finalNotas = notas ?? notes ?? null;

  try {
    const query = `
      UPDATE jefes_familia
      SET nombre = ?, fechaNacimiento = ?, ocupacion = ?, email = ?, telefono = ?, estado = ?, nombreFamilia = ?, direccion = ?, notas = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      finalNombre,
      finalFechaNacimiento,
      finalOcupacion,
      finalEmail,
      finalTelefono,
      finalEstado,
      finalNombreFamilia,
      finalDireccion,
      finalNotas,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No encontrado" });
    }

    res.status(200).json({ message: "Actualizado" });
  } catch (err) {
    console.error("Error PUT /api/jefes/:id", err);
    res.status(500).json({ message: "Error al actualizar" });
  }
});

Router.post("/registrar-jefe", async (req, res) => {
  const {
    nombreFamilia,
    vivienda,
    cedula,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    sexo,
    telefono,
    nacionalidad,
    mercado,
    esManzanero,
    esJefeCalle,
    carnetCodigo,
    carnetSerial,
    email,
    password, // Datos para la tabla 'usuarios'
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertar el Núcleo Familiar
    const [resultNucleo] = await connection.execute(
      `INSERT INTO nucleos_familiares (nombre_familia, vivienda,mercado) VALUES (?, ?,?)`,
      [nombreFamilia, vivienda, mercado || null]
    );
    const idNucleo = resultNucleo.insertId;

    // 2. Insertar los datos civiles en la tabla 'personas'
    const [resultPersona] = await connection.execute(
      `INSERT INTO personas 
      (id_nucleo, rol, cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
      fecha_nacimiento, sexo, telefono, nacionalidad, es_manzanero, es_jefe_calle, codigo_carnet, serial_carnet)
      VALUES (?, 'Jefe', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idNucleo,
        cedula,
        primerNombre,
        segundoNombre || null,
        primerApellido,
        segundoApellido || null,
        fechaNacimiento || null,
        sexo || null,
        telefono || null,
        nacionalidad || null,
        esManzanero ? 1 : 0,
        esJefeCalle ? 1 : 0,
        carnetCodigo || null,
        carnetSerial || null,
      ]
    );
    const idPersona = resultPersona.insertId;

    // 3. SI es Jefe de Calle o Manzanero, registrar en la tabla 'usuarios'
    if (esJefeCalle) {
      if (!email || !password) {
        throw new Error("Email y password requeridos para roles comunitarios");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await connection.execute(
        `INSERT INTO usuarios (id_persona, email, password) VALUES (?, ?, ?)`,
        [idPersona, email, hashedPassword]
      );
    }

    // 4. Actualizar el jefe principal en el núcleo
    await connection.execute(
      `UPDATE nucleos_familiares SET id_jefe_principal = ? WHERE id_nucleo = ?`,
      [idPersona, idNucleo]
    );

    await connection.commit();
    res.status(201).json({ message: "Registro completo", idPersona, idNucleo });
  } catch (err) {
    await connection.rollback();
    console.error("Error en registro:", err);
    res
      .status(500)
      .json({ message: err.message || "Error al procesar el registro" });
  } finally {
    connection.release();
  }
});

Router.get("/nucleos", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        n.id_nucleo, 
        n.nombre_familia, 
        n.vivienda, 
        n.mercado,
        p.id_persona,
        p.primer_nombre,
        p.primer_apellido,
        p.rol,
        (SELECT COUNT(*) FROM personas WHERE id_nucleo = n.id_nucleo) AS totalMiembros
      FROM nucleos_familiares n
      LEFT JOIN personas p ON n.id_nucleo = p.id_nucleo
      ORDER BY n.id_nucleo ASC;
    `);

    // 🧠 Agrupar en estructura correcta
    const familiasMap = {};

    rows.forEach(row => {
      if (!familiasMap[row.id_nucleo]) {
        familiasMap[row.id_nucleo] = {
          id: row.id_nucleo,
          nombre_familia: row.nombre_familia,
          vivienda: row.vivienda,
          mercado: row.mercado,
          totalMiembros: row.totalMiembros,
          members: []
        };
      }

      if (row.id_persona) {
        familiasMap[row.id_nucleo].members.push({
          id: row.id_persona,
          primer_nombre: row.primer_nombre,
          primer_apellido: row.primer_apellido,
          rol: row.rol === "Jefe" ? "Jefe de Familia" : "Miembro",
          status: "Activo",
          isHead: row.rol === "Jefe" || row.rol === "Jefe de Familia"
        });
      }
    });

    const resultado = Object.values(familiasMap);
    res.json(resultado);

  } catch (err) {
    console.error("Error GET /api/nucleos:", err);
    res.status(500).json({ message: "Error al obtener los núcleos familiares" });
  }
});


Router.post("/agregar-miembro", async (req, res) => {
  const {
    idNucleo,
    cedula,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    sexo,
    telefono,
    nacionalidad,
    carnetCodigo,
    carnetSerial,
  } = req.body;

  if (!idNucleo || !primerNombre || !cedula) {
    return res
      .status(400)
      .json({ message: "idNucleo, primerNombre y cedula son requeridos" });
  }

  try {
    const query = `INSERT INTO personas 
      (id_nucleo, rol, cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
      fecha_nacimiento, sexo, telefono, nacionalidad, codigo_carnet, serial_carnet)
      VALUES (?, 'Miembro', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.execute(query, [
      idNucleo,
      cedula,
      primerNombre,
      segundoNombre || null,
      primerApellido,
      segundoApellido || null,
      fechaNacimiento || null,
      sexo || null,
      telefono || null,
      nacionalidad || null,
      carnetCodigo || null,
      carnetSerial || null,
    ]);

    res.status(201).json({ message: "Miembro agregado", id: result.insertId });
  } catch (err) {
    console.error("Error POST /api/agregar-miembro:", err);
    res.status(500).json({ message: "Error al agregar miembro al núcleo" });
  }
});

Router.put("/editar-miembro/:id", async (req, res) => {
  const { id } = req.params;
  const {
    cedula,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    sexo,
    telefono,
    nacionalidad,
    carnetCodigo,
    carnetSerial
  } = req.body;

  try {
    const query = `UPDATE personas SET 
      cedula = ?, primer_nombre = ?, segundo_nombre = ?, 
      primer_apellido = ?, segundo_apellido = ?, fecha_nacimiento = ?, 
      sexo = ?, telefono = ?, nacionalidad = ?, 
      codigo_carnet = ?, serial_carnet = ?
      WHERE id_persona = ?`;

    await pool.execute(query, [
      cedula, primerNombre, segundoNombre || null,
      primerApellido, segundoApellido || null, fechaNacimiento,
      sexo, telefono || null, nacionalidad,
      carnetCodigo || null, carnetSerial || null, id
    ]);

    res.json({ message: "Miembro actualizado correctamente" });
  } catch (err) {
    console.error("Error PUT /api/editar-miembro:", err);
    res.status(500).json({ message: "Error al actualizar el miembro" });
  }
});

Router.get("/personas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        p.*,
        nf.nombre_familia,
        nf.vivienda,
        nf.mercado,

        CASE 
          WHEN p.es_jefe_calle = 1 THEN u.email
          ELSE NULL
        END AS email,

        CASE 
          WHEN p.es_jefe_calle = 1 THEN u.password
          ELSE NULL
        END AS password,

        (
          SELECT COUNT(*) 
          FROM personas p2 
          WHERE p2.id_nucleo = p.id_nucleo
        ) AS totalMiembros

      FROM personas p
      LEFT JOIN nucleos_familiares nf 
        ON nf.id_nucleo = p.id_nucleo

      LEFT JOIN usuarios u 
        ON u.id_persona = p.id_persona

      WHERE p.id_persona = ?
      LIMIT 1
    `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Persona no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo ficha:", error);
    res.status(500).json({ message: "Error al obtener la ficha" });
  }
});

Router.put("/editar-jefe/:idPersona", async (req, res) => {
  const {
    nombreFamilia,
    vivienda,
    mercado,
    cedula,
    primerNombre,
    segundoNombre,
    primerApellido,
    segundoApellido,
    fechaNacimiento,
    sexo,
    telefono,
    nacionalidad,
    esManzanero,
    esJefeCalle,
    carnetCodigo,
    carnetSerial,
    email,
    password,
  } = req.body;

  const { idPersona } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Obtener el núcleo actual del jefe
    const [[persona]] = await connection.execute(
      "SELECT id_nucleo FROM personas WHERE id_persona = ?",
      [idPersona]
    );

    if (!persona) throw new Error("Persona no encontrada");

    const idNucleo = persona.id_nucleo;

    // 2️⃣ Actualizar núcleo familiar
    await connection.execute(
      `UPDATE nucleos_familiares 
       SET nombre_familia = ?, vivienda = ?, mercado = ?
       WHERE id_nucleo = ?`,
      [nombreFamilia, vivienda || null, mercado || null, idNucleo]
    );

    // 3️⃣ Actualizar datos de persona
    await connection.execute(
      `UPDATE personas SET
        cedula = ?, primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
        fecha_nacimiento = ?, sexo = ?, telefono = ?, nacionalidad = ?,
        es_manzanero = ?, es_jefe_calle = ?, codigo_carnet = ?, serial_carnet = ?
      WHERE id_persona = ?`,
      [
        cedula,
        primerNombre,
        segundoNombre || null,
        primerApellido,
        segundoApellido || null,
        fechaNacimiento || null,
        sexo || null,
        telefono || null,
        nacionalidad || null,
        esManzanero ? 1 : 0,
        esJefeCalle ? 1 : 0,
        carnetCodigo || null,
        carnetSerial || null,
        idPersona,
      ]
    );

    // 4️⃣ Manejo de usuario comunitario
    if (esJefeCalle) {
      const [[user]] = await connection.execute(
        "SELECT id FROM usuarios WHERE id_persona = ?",
        [idPersona]
      );

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await connection.execute(
          "INSERT INTO usuarios (id_persona, email, password) VALUES (?, ?, ?)",
          [idPersona, email, hashed]
        );
      } else if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await connection.execute(
          "UPDATE usuarios SET email = ?, password = ? WHERE id_persona = ?",
          [email, hashed, idPersona]
        );
      }
    } else {
      await connection.execute("DELETE FROM usuarios WHERE id_persona = ?", [
        idPersona,
      ]);
    }

    await connection.commit();
    res.json({ message: "Jefe actualizado correctamente" });
  } catch (err) {
    await connection.rollback();
    console.error("Error PUT editar jefe:", err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

export default Router;
