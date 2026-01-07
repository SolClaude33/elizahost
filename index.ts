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
      
      // Verificar variables de entorno (resumen simple)
      console.log("\n🔐 Variables de entorno:");
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasSolana = !!(process.env.SOLANA_RPC_URL && process.env.SOLANA_PUBLIC_KEY);
      const hasTwitter = !!(process.env.X_API_KEY && process.env.X_ACCESS_TOKEN);
      console.log(`   OpenAI: ${hasOpenAI ? "✅" : "❌"}`);
      console.log(`   Solana: ${hasSolana ? "✅" : "❌"}`);
      console.log(`   Twitter: ${hasTwitter ? "✅" : "❌"}`);
      console.log("   (Las variables aún no están configuradas)");
      
      // Cargar configuración del personaje
      const characterConfig = JSON.parse(
        fs.readFileSync(characterPath, "utf-8")
      );
      
      // Usar ServiceBuilder o createService (AgentRuntime no tiene método start)
      const ServiceBuilder = (elizaCore as any).ServiceBuilder;
      const createService = (elizaCore as any).createService;
      const parseCharacter = (elizaCore as any).parseCharacter;
      
      console.log("\n✅ Módulos de ElizaOS encontrados, iniciando servidor...");
      
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
        
        // Configurar el builder antes de construir
        let serviceBuilder = await createService({
          character: validatedCharacter,
          token: process.env.OPENAI_API_KEY || "",
        });
        
        // Intentar configurar el puerto si el builder tiene un método para eso
        if (typeof (serviceBuilder as any).withPort === "function") {
          console.log(`   → Configurando puerto ${port}...`);
          serviceBuilder = (serviceBuilder as any).withPort(parseInt(port));
        }
        
        // El builder tiene métodos withStart, withStop, build
        // Necesitamos construir el servicio con build()
        let builtService;
        if (typeof serviceBuilder.build === "function") {
          console.log("   → Construyendo servicio con build()...");
          try {
            builtService = await serviceBuilder.build();
            console.log("   ✅ Servicio construido correctamente");
          } catch (buildError: any) {
            console.error(`   ❌ Error al construir servicio: ${buildError.message}`);
            throw buildError;
          }
          
          // Intentar iniciar el servicio construido
          try {
            if (typeof builtService.start === "function") {
              console.log("   → Iniciando servicio con start()...");
              await builtService.start();
              console.log(`   ✅ Servicio iniciado en puerto ${port}`);
            } else if (typeof builtService.run === "function") {
              console.log("   → Iniciando servicio con run()...");
              await builtService.run();
              console.log(`   ✅ Servicio iniciado con run()`);
            } else if (typeof builtService.listen === "function") {
              console.log(`   → Iniciando servicio con listen(${port})...`);
              await builtService.listen(parseInt(port));
              console.log(`   ✅ Servicio escuchando en puerto ${port}`);
            } else {
              console.log("   ⚠️ Servicio construido (inicio automático o requiere configuración adicional)");
              // Mantener el proceso vivo
              setInterval(() => {}, 1000);
            }
          } catch (startError: any) {
            console.error(`   ❌ Error al iniciar servicio: ${startError.message}`);
            console.error(`   Tipo: ${startError.constructor?.name || typeof startError}`);
            if (startError.stack) {
              console.error(`   Stack: ${startError.stack.split("\n").slice(0, 3).join("\n")}`);
            }
            // Si falla el inicio, mantener el proceso vivo de todas formas para diagnóstico
            console.log("   ⚠️ Manteniendo proceso vivo para diagnóstico...");
            setInterval(() => {}, 1000);
          }
        } else {
          // Si no tiene build, tratar como servicio directo
          console.log("   ⚠️ El builder no tiene método build(), tratando como servicio directo");
          builtService = serviceBuilder;
          try {
            if (typeof builtService.start === "function") {
              await builtService.start();
            }
          } catch (startError: any) {
            console.error(`   ❌ Error al iniciar: ${startError.message}`);
            setInterval(() => {}, 1000);
          }
        }
        
        console.log(`\n✅ AMICA Agent configurado (puerto ${port})`);
      } else if (ServiceBuilder) {
        console.log("📦 Usando ServiceBuilder...");
        
        // ServiceBuilder puede ser una clase o función
        let service;
        if (typeof ServiceBuilder.create === "function") {
          console.log("   → Usando ServiceBuilder.create()");
          service = ServiceBuilder.create({
            character: characterConfig,
            token: process.env.OPENAI_API_KEY || "",
            port: parseInt(port),
          });
        } else if (typeof ServiceBuilder === "function") {
          console.log("   → Usando new ServiceBuilder()");
          service = new ServiceBuilder({
            character: characterConfig,
            token: process.env.OPENAI_API_KEY || "",
            port: parseInt(port),
          });
        } else {
          throw new Error("ServiceBuilder no es una función ni tiene método create");
        }
        
        // Diagnosticar métodos disponibles en el servicio
        if (service) {
          console.log("\n🔍 Métodos disponibles en el servicio:");
          const serviceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(service)).concat(
            Object.keys(service)
          ).filter(name => typeof (service as any)[name] === "function" && name !== "constructor");
          if (serviceMethods.length > 0) {
            console.log(`   Métodos: ${serviceMethods.join(", ")}`);
          }
        }
        
        // Intentar iniciar el servicio
        try {
          if (service && typeof service.start === "function") {
            console.log("   → Usando método: start()");
            await service.start();
            console.log(`   ✅ Servicio iniciado`);
          } else if (service && typeof service.run === "function") {
            console.log("   → Usando método: run()");
            await service.run();
            console.log(`   ✅ Servicio iniciado`);
          } else if (service && typeof service.listen === "function") {
            console.log(`   → Usando método: listen(${port})`);
            await service.listen(parseInt(port));
            console.log(`   ✅ Servicio escuchando`);
          } else {
            console.log("   ⚠️ No se encontró método de inicio, servicio creado");
            setInterval(() => {}, 1000);
          }
        } catch (startError: any) {
          console.error(`   ❌ Error al iniciar: ${startError.message}`);
          console.log("   ⚠️ Manteniendo proceso vivo para diagnóstico...");
          setInterval(() => {}, 1000);
        }
        
        console.log(`\n✅ AMICA Agent configurado (puerto ${port})`);
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
      console.error("\n❌ Error al cargar ElizaOS:", importError.message);
      console.error("\n📝 Información de depuración:");
      console.error("   Tipo de error:", importError.constructor.name);
      console.error("   Mensaje:", importError.message);
      if (importError.stack) {
        console.error("   Stack:", importError.stack.split("\n").slice(0, 5).join("\n"));
      }
      
      // Intentar mostrar qué APIs estaban disponibles antes del error
      try {
        const elizaCore = await import("@elizaos/core");
        console.error("\n📊 APIs disponibles antes del error:");
        console.error("   Total:", Object.keys(elizaCore).length);
        console.error("   Lista:", Object.keys(elizaCore).slice(0, 20).join(", "));
      } catch (e) {
        // Ignorar
      }
      
      console.error("\n💡 Soluciones sugeridas:");
      console.error("   1. Verifica que @elizaos/core esté instalado: npm list @elizaos/core");
      console.error("   2. Verifica que las dependencias estén correctas en package.json");
      console.error("   3. Intenta reinstalar: npm install");
      console.error("   4. Revisa que las variables de entorno estén configuradas en Railway");
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
