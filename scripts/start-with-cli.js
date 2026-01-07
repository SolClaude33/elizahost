#!/usr/bin/env node
// Wrapper script: usar directamente el método manual mejorado
// El CLI de ElizaOS puede no estar disponible o tener problemas en Railway

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Iniciando AMICA Agent (método manual mejorado)...");

// Usar directamente el método manual que hemos mejorado
// Este método tiene mejor manejo de errores y múltiples estrategias de inicio
try {
  await import(join(__dirname, "..", "index.ts"));
  // El código en index.ts maneja todo y mantiene el proceso vivo
} catch (error) {
  console.error("❌ Error al iniciar:", error);
  process.exit(1);
}

