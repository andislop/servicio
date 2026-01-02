// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./src/bd.js"
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;


//RUTAS
import rutaUsuarios from '././src/apis/usuarios.js';
import rutaImagenes from './src/apis/imagenes.js';
import rutaJefes from './src/apis/jefes.js';


app.use("/api", rutaUsuarios);
app.use("/api", rutaImagenes);
app.use("/api", rutaJefes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
