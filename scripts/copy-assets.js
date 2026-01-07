import { cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

try {
  cpSync(
    join(rootDir, "characters"),
    join(rootDir, "dist/characters"),
    { recursive: true, force: true }
  );
  console.log("✅ Assets copiados correctamente");
} catch (error) {
  console.error("❌ Error copiando assets:", error);
  process.exit(1);
}
