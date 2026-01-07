// Script simple para asegurar que los assets estén disponibles
// Ya no necesitamos copiar a dist porque usamos tsx directamente

import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const characterPath = join(rootDir, "characters");

try {
  if (existsSync(characterPath)) {
    console.log("✅ Directorio de personajes encontrado:", characterPath);
  } else {
    console.warn("⚠️ Directorio de personajes no encontrado:", characterPath);
  }
  console.log("✅ Build completado (usando tsx para ejecución directa)");
} catch (error) {
  console.error("❌ Error en build:", error);
  // No salir con error, solo advertir
  console.warn("⚠️ Continuando de todas formas...");
}
