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
import  cookieParser from "cookie-parser";



dotenv.config();

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,                
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;


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
