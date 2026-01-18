import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Exportamos la función para que otros archivos la usen

dotenv.config();
const JWT_SECRET = "tu_clave_secreta_super_segura";

const verificarToken = (req, res, next) => {
  const token = req.cookies.acceso_token; // Lee la cookie

  if (!token) {
    return res.status(401).json({ message: "No autorizado, sesión expirada" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default verificarToken;