import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: true,        // 👈 acepta dominio de Vercel
  credentials: true
}));
app.use(express.json());

// RUTAS
import rutaUsuarios from "./apis/usuarios.js";
import rutaImagenes from "./apis/imagenes.js";
import rutaJefes from "./apis/jefes.js";
import rutaNucleos from "./apis/nucleos.js";

app.use("/api", rutaUsuarios);
app.use("/api", rutaImagenes);
app.use("/api", rutaJefes);
app.use("/api", rutaNucleos);

// 🚫 NO app.listen()
export default app;
