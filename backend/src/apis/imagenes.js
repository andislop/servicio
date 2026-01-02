import express from "express";
import pool from "../bd.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const Router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

Router.post("/upload", upload.single("imagen"), async (req, res) => {
  const description = req.body.description;
  const title = req.body.title || "";

  if (!req.file || !description) {
    return res
      .status(400)
      .json({ message: "Se requiere un archivo y una descripción." });
  }

  const fileBase64 = `data:${
    req.file.mimetype
  };base64,${req.file.buffer.toString("base64")}`;

  try {
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: "img",
    });

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    const sql = `INSERT INTO imagenes (url, descripcion, titulo) VALUES (?, ?, ?)`;
    const values = [optimizedUrl, description, title];

    const [dbResult] = await pool.execute(sql, values);

    if (dbResult.affectedRows === 0) {
      throw new Error("Error al insertar en la base de datos.");
    }

    res.status(200).json({
      message: "Ítem subido y guardado exitosamente.",
      url: optimizedUrl,
      description: description,
      title: title,
      public_id_cloudinary: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Error en el proceso de subida:", error);
    res.status(500).json({
      message: "Error en el servidor al procesar la subida.",
      error: error.message,
    });
  }
});

// Api para obtener las imgenes
Router.get("/items", async (req, res) => {
  try {
    const sql = `SELECT id_imagenes AS id, url, descripcion AS description, titulo AS title FROM imagenes ORDER BY id_imagenes DESC LIMIT 3`;
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error GET /api/items:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener la data." });
  }
});

export default Router;
