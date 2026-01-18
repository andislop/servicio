import express from "express";
import pool from "../config/bd.js";
import db from '../config/firebase.js'
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

// Ruta: get /items
Router.get("/items1", async (req, res) => {
  try {
    // CAMBIO A FIREBASE: Consultar colección con límite y orden descendente
    const snapshot = await db.collection("imagenes")
      .orderBy("fecha_creacion", "desc") // Ordenamos por fecha
      .limit(3)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    // Mapeamos los documentos para que el frontend reciba el formato que ya conoce
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      url: doc.data().url,
      description: doc.data().descripcion,
      title: doc.data().titulo
    }));

    res.json(items);
  } catch (error) {
    console.error("Error GET /api/items:", error);
    res.status(500).json({ message: "Error en Firebase al obtener la data." });
  }
});

// Ruta: post /upload
Router.post("/upload1", upload.single("imagen"), async (req, res) => {
  const description = req.body.description;
  const title = req.body.title || "";

  if (!req.file || !description) {
    return res.status(400).json({ message: "Se requiere un archivo y una descripción." });
  }

  const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  try {
    // 1. Subida a Cloudinary (se mantiene igual)
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: "img",
    });

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // 2. CAMBIO A FIREBASE: Guardar metadatos en Firestore
    // En lugar de SQL, usamos la referencia a tu nueva colección
    const nuevoItem = {
      url: optimizedUrl,
      descripcion: description, // Usamos los nombres de campos que creaste en la consola
      titulo: title,
      public_id_cloudinary: uploadResult.public_id,
      fecha_creacion: new Date() // Útil para ordenar después
    };

    const docRef = await db.collection("imagenes").add(nuevoItem);

    res.status(200).json({
      message: "Ítem subido y guardado en Firebase exitosamente.",
      id: docRef.id, // ID generado por Firebase
      ...nuevoItem
    });

  } catch (error) {
    console.error("Error en el proceso de subida:", error);
    res.status(500).json({
      message: "Error en el servidor al procesar la subida.",
      error: error.message,
    });
  }
});

Router.get("/items/all", async (req, res) => {
  try {
    const snapshot = await db.collection("imagenes")
      .orderBy("fecha_creacion", "desc") // Ordenamos por fecha
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    // Mapeamos los documentos para que el frontend reciba el formato que ya conoce
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      url: doc.data().url,
      description: doc.data().descripcion,
      title: doc.data().titulo
    }));

    res.json(items);
  } catch (error) {
    console.error("Error GET /api/items:", error);
    res.status(500).json({ message: "Error en Firebase al obtener la data." });
  }
});

export default Router;
