import express from "express";
import pool from "../bd.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import verificarToken from '../Middleware/autenticación.js';

const Router = express.Router();

Router.get("/usuarios", async (req, res) => {
  try {
    const query = `
      SELECT 
        u.email, 
        u.id_persona,
        p.primer_nombre, 
        n.vivienda, 
        p.rol,
        (SELECT COUNT(*) FROM usuarios WHERE id_persona = p.id_persona) AS totalMiembros
      FROM usuarios u
      LEFT JOIN personas p ON u.id_persona = p.id_persona
      LEFT JOIN nucleos_familiares n ON n.id_jefe_principal = p.id_persona
      ORDER BY u.email ASC`;

    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error GET /api/nucleos:", err);
    res
      .status(500)
      .json({ message: "Error al obtener los núcleos familiares" });
  }
});

Router.get("/manzaneros", async (req, res) => {
  try {
    const query = `
     SELECT 
    p.id_persona,
    p.primer_nombre,
    p.primer_apellido,
    n.vivienda, 
    p.rol,
    (SELECT COUNT(*) 
     FROM personas p2 
     JOIN nucleos_familiares n2 ON p2.id_nucleo = n2.id_nucleo 
     WHERE n2.vivienda = n.vivienda) AS totalMiembrosVivienda
    FROM personas p
    LEFT JOIN usuarios u ON p.id_persona = u.id_persona
    LEFT JOIN nucleos_familiares n ON p.id_nucleo = n.id_nucleo
    WHERE p.es_manzanero = 1
    ORDER BY p.id_persona ASC;`;

    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error GET /api/nucleos:", err);
    res
      .status(500)
      .json({ message: "Error al obtener los núcleos familiares" });
  }
});

// Clave secreta (En producción usa variables de entorno .env)
const JWT_SECRET = "tu_clave_secreta_super_segura";

Router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `
      SELECT u.*, p.rol 
      FROM usuarios u 
      JOIN personas p ON u.id_persona = p.id_persona 
      WHERE u.email = ?`;
    const [rows] = await pool.execute(query, [email]);

    // Usamos un mensaje genérico para seguridad
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuario = rows[0];
    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 1 hora de expiración (3600 segundos)
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: usuario.rol,
        id_persona: usuario.id_persona,
        email: usuario.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("acceso_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000, // 1 hora en milisegundos
    });

    // El console.log debe ir ANTES del return
    console.log(`Sesión iniciada para: ${usuario.email}`);

    return res.status(200).json({
      message: "Login exitoso",
      token: token, // Opcional si ya usas cookies
      user: { email: usuario.email, id_login: usuario.id_persona },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});



Router.get("/me", verificarToken, async (req, res) => {
  try {
    // Usamos el id que el middleware extrajo del token
    const [rows] = await pool.execute(
      `SELECT u.email, p.primer_nombre, p.primer_apellido, p.rol 
       FROM usuarios u 
       JOIN personas p ON u.id_persona = p.id_persona 
       WHERE u.id_usuario = ?`,
      [req.user.id]
    );

    if (rows.length > 0) {
      res.json({ user: rows[0] });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil" });
  }
});


Router.get("/nombre", async (req, res) => {
  try {
    const query =
      "SELECT id_persona,primer_nombre  from personas p WHERE id_persona = '1'";
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener nombre", err);
    res.status(500).json({ message: "Error" });
  }
});


Router.post("/logout", (req, res) => {
  res.clearCookie("acceso_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Sesión cerrada con éxito" });
});

Router.get("/datos-grafica", async (req, res) => {
  try {
    const query = `
      SELECT 
        f.vivienda AS torre, 
        COUNT(p.id_persona) AS total_habitantes
      FROM nucleos_familiares f
      JOIN personas p ON f.id_nucleo = p.id_nucleo
      GROUP BY f.vivienda
      ORDER BY total_habitantes DESC;
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error GET /api/datos-grafica:", err);
    res.status(500).json({ message: "Error al obtener los datos grafica" });
  }
});

Router.get("/datos-grafica-2", async (req, res) => {
  try {
    const query = `
      SELECT 
      CASE 
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) < 12 THEN 'Niños'
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 12 AND 17 THEN 'Adolescentes'
        WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 18 AND 64 THEN 'Adultos'
        ELSE 'Adultos Mayores'
      END AS rango_edad,
      COUNT(*) AS cantidad,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM personas), 2) AS porcentaje
      FROM personas
      GROUP BY rango_edad;
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error GET /api/datos-grafica-2:", err);
    res.status(500).json({ message: "Error al obtener los datos grafica" });
  }
});

Router.get("/datos-personas", verificarToken, async (req, res) => {
  try {
    const { rol, id_persona } = req.user; // Datos extraídos del token

    let query;
    let params = [];

    if (rol === "Administrador") {
      // 1. Estadísticas globales para el Administrador
      query = `
        SELECT 
          COUNT(*) AS total_miembros,
          ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT id_nucleo), 0), 0) AS promedio
        FROM personas;`;
    } else {
      // 2. Estadísticas filtradas por Torre para el Jefe de Calle
      query = `
        SELECT 
          COUNT(p.id_persona) AS total_miembros,
          ROUND(COUNT(p.id_persona) / NULLIF(COUNT(DISTINCT p.id_nucleo), 0), 0) AS promedio
        FROM personas p
        JOIN nucleos_familiares n ON p.id_nucleo = n.id_nucleo
        WHERE n.vivienda = (
          SELECT v.vivienda 
          FROM nucleos_familiares v 
          WHERE v.id_jefe_principal = ?
        );`;
      params = [id_persona];
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error GET /api/datos-personas:", err);
    res.status(500).json({ message: "Error al obtener los datos personas" });
  }
});

export default Router;
