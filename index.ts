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
      
      // Usar AgentRuntime o ServiceBuilder para iniciar el agente
      const AgentRuntime = (elizaCore as any).AgentRuntime;
      const ServiceBuilder = (elizaCore as any).ServiceBuilder;
      const createService = (elizaCore as any).createService;
      
      if (!AgentRuntime && !ServiceBuilder && !createService) {
        throw new Error("No se encontraron AgentRuntime, ServiceBuilder o createService en @elizaos/core. Exportaciones disponibles: " + Object.keys(elizaCore).join(", "));
      }
      
      console.log("✅ Módulos de ElizaOS encontrados, iniciando servidor...");
      
      // Intentar usar AgentRuntime (método más común)
      if (AgentRuntime) {
        console.log("📦 Usando AgentRuntime...");
        const runtime = new AgentRuntime({
          character: characterConfig,
          token: process.env.OPENAI_API_KEY || "",
          serverUrl: `http://0.0.0.0:${port}`,
        });
        
        await runtime.start();
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
      } else if (ServiceBuilder) {
        console.log("📦 Usando ServiceBuilder...");
        const service = ServiceBuilder.create({
          character: characterConfig,
          port: parseInt(port),
        });
        
        await service.start();
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
      } else if (createService) {
        console.log("📦 Usando createService...");
        const service = await createService({
          character: characterConfig,
          port: parseInt(port),
        });
        
        await service.start();
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
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
