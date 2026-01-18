import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = {
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  // Reemplazamos los saltos de línea que a veces se rompen en Vercel
  private_key: process.env.private_key.replace(/\\n/g, '\n'),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.client_x509_cert_url
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();
export default db;