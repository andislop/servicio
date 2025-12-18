// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;


// Conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "servicio_comunitario",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//configuar de cloudinary, pa traer y enviar las imagenes
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

//api para enviar imagen a cloudinary
app.post('/api/upload', upload.single('imagen'), async (req, res) => {
    const description = req.body.description;
    const title = req.body.title || ""; 
    
    if (!req.file || !description) {
        return res.status(400).json({ message: 'Se requiere un archivo y una descripción.' });
    }
    
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    try {

        const uploadResult = await cloudinary.uploader.upload(
            fileBase64,
            { folder: 'img' }
        );
        
        const optimizedUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: 'auto',
            quality: 'auto'
        });
        
        const sql = `INSERT INTO imagenes (url, descripcion, titulo) VALUES (?, ?, ?)`; 
        const values = [optimizedUrl, description, title]; 

        const [dbResult] = await pool.execute(sql, values);
        
        if (dbResult.affectedRows === 0) {
            throw new Error('Error al insertar en la base de datos.');
        }
        
        res.status(200).json({
            message: 'Ítem subido y guardado exitosamente.',
            url: optimizedUrl,
            description: description,
            title: title,
            public_id_cloudinary: uploadResult.public_id 
        });

    } catch (error) {
        console.error('Error en el proceso de subida:', error);
        res.status(500).json({ 
            message: 'Error en el servidor al procesar la subida.',
            error: error.message 
        });
    }
});

// Api para obtener las imgenes
app.get('/api/items', async (req, res) => {
    try {

        const sql = `SELECT id_imagenes AS id, url, descripcion AS description, titulo AS title FROM imagenes ORDER BY id_imagenes DESC LIMIT 3`; 
        const [rows] = await pool.execute(sql);
        res.json(rows);
    } catch (error) {
        console.error('Error GET /api/items:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la data.' });
    }
});


// Api para obtener jefes de familia
app.get("/api/jefes", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, telefono, estado, nombreFamilia, direccion, fechaNacimiento, ocupacion, notas
       FROM jefes_familia ORDER BY nombreFamilia ASC, nombre ASC`
    );

    const mapped = rows.map((r) => ({
      id: r.id,
      nombre: r.nombre ?? "",
      email: r.email ?? "",
      telefono: r.telefono ?? null,
      estado: r.estado ?? "",
      nombreFamilia: r.nombreFamilia ?? "",
      direccion: r.direccion ?? null,
      fechaNacimiento: r.fechaNacimiento ? new Date(r.fechaNacimiento).toISOString() : null,
      ocupacion: r.ocupacion ?? null,
      notas: r.notas ?? "",
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error("Error GET /api/jefes:", err);
    res.status(500).json({ message: "Error al obtener jefes de familia" });
  }
});

// Api para enviar jefes de familia
app.post("/api/jefes", async (req, res) => {
  const { nombre, fechaNacimiento, ocupacion, email, telefono, estado, nombreFamilia, direccion, notas } = req.body;

  if (!nombre || !nombreFamilia) {
    return res.status(400).json({ message: "nombre y nombreFamilia son requeridos" });
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
app.put("/api/jefes/:id", async (req, res) => {
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


// api para obtener los usuarios
app.get("/api/users", async (req, res) => {
  try{
    const [rows] = await pool.execute(
      'SELECT id_usuario, email, password FROM usuarios ORDER BY email ASC'
    )
    res.status(200).json(rows);

  }catch(err){
    console.error("Error GET /api/users:", err);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
