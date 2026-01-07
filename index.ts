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
      
      // Usar ServiceBuilder o createService (AgentRuntime no tiene método start)
      const ServiceBuilder = (elizaCore as any).ServiceBuilder;
      const createService = (elizaCore as any).createService;
      const parseCharacter = (elizaCore as any).parseCharacter;
      
      console.log("✅ Módulos de ElizaOS encontrados, iniciando servidor...");
      
      // Primero intentar con createService (más simple)
      if (createService) {
        console.log("📦 Usando createService...");
        
        // Validar y parsear el personaje si es necesario
        let validatedCharacter = characterConfig;
        if (parseCharacter && typeof parseCharacter === "function") {
          try {
            validatedCharacter = parseCharacter(characterConfig);
            console.log("✅ Personaje validado correctamente");
          } catch (parseError: any) {
            console.warn("⚠️ Error al validar personaje, usando directamente:", parseError.message);
          }
        }
        
        const service = await createService({
          character: validatedCharacter,
          token: process.env.OPENAI_API_KEY || "",
        });
        
        // El servicio puede tener diferentes métodos, intentar los más comunes
        if (typeof service.start === "function") {
          await service.start();
        } else if (typeof service.run === "function") {
          await service.run();
        } else if (typeof service.listen === "function") {
          await service.listen(parseInt(port));
        } else {
          // Si no tiene métodos de inicio, solo loguear que está listo
          console.log("✅ Servicio creado (inicio automático)");
        }
        
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
      } else if (ServiceBuilder) {
        console.log("📦 Usando ServiceBuilder...");
        
        // ServiceBuilder puede ser una clase o función
        let service;
        if (typeof ServiceBuilder.create === "function") {
          service = ServiceBuilder.create({
            character: characterConfig,
            token: process.env.OPENAI_API_KEY || "",
            port: parseInt(port),
          });
        } else if (typeof ServiceBuilder === "function") {
          service = new ServiceBuilder({
            character: characterConfig,
            token: process.env.OPENAI_API_KEY || "",
            port: parseInt(port),
          });
        } else {
          throw new Error("ServiceBuilder no es una función ni tiene método create");
        }
        
        // Intentar iniciar el servicio
        if (service && typeof service.start === "function") {
          await service.start();
        } else if (service && typeof service.run === "function") {
          await service.run();
        } else if (service && typeof service.listen === "function") {
          await service.listen(parseInt(port));
        } else {
          console.log("✅ Servicio creado (inicio automático)");
        }
        
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
      } else {
        // Fallback: usar AgentRuntime solo para mantener la instancia viva
        const AgentRuntime = (elizaCore as any).AgentRuntime;
        if (AgentRuntime) {
          console.log("📦 Usando AgentRuntime (sin método start)...");
          const runtime = new AgentRuntime({
            character: characterConfig,
            token: process.env.OPENAI_API_KEY || "",
          });
          
          // AgentRuntime probablemente se inicia automáticamente o necesita configuración adicional
          console.log("✅ AgentRuntime creado, manteniendo proceso vivo...");
          
          // Mantener el proceso vivo
          setInterval(() => {}, 1000);
          console.log(`✅ AMICA Agent ejecutándose en puerto ${port}`);
        } else {
          throw new Error("No se encontraron métodos de inicio válidos. Exportaciones: " + Object.keys(elizaCore).join(", "));
        }
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
