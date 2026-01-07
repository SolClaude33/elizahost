#!/usr/bin/env node
// Wrapper script para usar el CLI de ElizaOS de forma compatible con Railway
// Si el CLI no funciona, hace fallback al método manual

import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// Configurar variables de entorno que el CLI espera
const port = process.env.PORT || "3000";
const characterPath = join(rootDir, "characters", "amica-agent.json");

// Verificar que el character file existe
if (!existsSync(characterPath)) {
  console.error(`❌ Character file no encontrado: ${characterPath}`);
  process.exit(1);
}

// Configurar variables de entorno para el CLI
process.env.ELIZA_CHARACTER_PATH = characterPath;
process.env.ELIZA_PORT = port;
process.env.PORT = port;

console.log("🚀 Iniciando AMICA Agent...");
console.log(`📡 Puerto: ${port}`);
console.log(`🤖 Personaje: ${characterPath}`);

// Intentar usar el CLI de ElizaOS primero
async function tryCLI() {
  try {
    console.log("📦 Intentando usar ElizaOS CLI...");
    // El CLI debería detectar automáticamente el character file desde ELIZA_CHARACTER_PATH
    const { stdout, stderr } = await execAsync("npx -y elizaos start", {
      cwd: rootDir,
      env: process.env,
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error("❌ CLI no disponible o falló:", error.message);
    console.log("⚠️ Usando método manual como fallback...");
    // Fallback al método manual
    throw error;
  }
}

// Función principal
async function main() {
  try {
    await tryCLI();
  } catch (cliError) {
    // Si el CLI falla, usar el método manual
    console.log("📦 Cargando método manual...");
    try {
      const { default: manualStart } = await import("../index.ts");
      // El código en index.ts ya maneja todo
    } catch (manualError) {
      console.error("❌ Ambos métodos fallaron:");
      console.error("   CLI:", cliError.message);
      console.error("   Manual:", manualError.message);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});

