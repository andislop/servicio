import express from "express";
import pool from "../bd.js";

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

export default Router;
