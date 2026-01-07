// ElizaOS Agent Entry Point
// Compatible con Railway deployment

import * as fs from "fs";
import * as path from "path";
import * as url from "url";

// Obtener __dirname equivalente en ESM
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función principal
async function main() {
  try {
    console.log("🚀 Iniciando AMICA Agent...");
    
    const port = process.env.PORT || "3000";
    const characterPath = path.join(__dirname, "characters", "amica-agent.json");
    
    // Verificar que el archivo de personaje existe
    try {
      const characterContent = fs.readFileSync(characterPath, "utf-8");
      console.log(`✅ Archivo de personaje encontrado: ${characterPath}`);
    } catch (error: any) {
      console.error(`❌ No se pudo leer el archivo de personaje: ${characterPath}`);
      throw error;
    }

    // Configurar variables de entorno para ElizaOS
    process.env.ELIZA_CHARACTER_PATH = characterPath;
    process.env.ELIZA_PORT = port;
    
    console.log(`📡 Puerto: ${port}`);
    console.log(`🤖 Personaje: ${characterPath}`);
    
    // Intentar importar y usar ElizaOS
    try {
      console.log("📦 Cargando módulos de ElizaOS...");
      
      // Importación dinámica para evitar errores de compilación
      const elizaCore = await import("@elizaos/core");
      
      // Cargar configuración del personaje
      const characterConfig = JSON.parse(
        fs.readFileSync(characterPath, "utf-8")
      );
      
      // Buscar función de inicio (puede variar según versión)
      const startFunction = (elizaCore as any).start || 
                           (elizaCore as any).startServer || 
                           (elizaCore as any).default?.start ||
                           (elizaCore as any).default?.startServer ||
                           (elizaCore as any).default;
      
      if (typeof startFunction === "function") {
        console.log("✅ Función de inicio encontrada, iniciando servidor...");
        
        // Configurar opciones de inicio
        const startOptions: any = {
          character: characterConfig,
        };
        
        // Agregar puerto si la función lo acepta
        if ((elizaCore as any).startServer || startFunction.length > 1) {
          startOptions.port = parseInt(port);
        } else {
          process.env.PORT = port;
        }
        
        await startFunction(startOptions);
        console.log("✅ AMICA Agent iniciado correctamente en puerto", port);
      } else {
        throw new Error("No se encontró función de inicio en @elizaos/core. Versiones disponibles: " + Object.keys(elizaCore).join(", "));
      }
    } catch (importError: any) {
      console.error("❌ Error al cargar ElizaOS:", importError.message);
      console.error("\n📝 Información de depuración:");
      console.error("   Error:", importError);
      console.error("\n💡 Soluciones sugeridas:");
      console.error("   1. Verifica que @elizaos/core esté instalado: npm list @elizaos/core");
      console.error("   2. Verifica que las dependencias estén correctas en package.json");
      console.error("   3. Intenta reinstalar: npm install");
      throw importError;
    }
  } catch (error: any) {
    console.error("❌ Error fatal al iniciar el agente:");
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
