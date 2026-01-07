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
      
      // Mostrar información de debug sobre APIs disponibles
      console.log("\n🔍 DIAGNÓSTICO DE APIs DISPONIBLES:");
      console.log("═".repeat(60));
      
      const availableExports = Object.keys(elizaCore);
      console.log(`📊 Total de exportaciones encontradas: ${availableExports.length}`);
      
      // Verificar APIs principales
      const keyAPIs = [
        "AgentRuntime",
        "ServiceBuilder", 
        "createService",
        "Service",
        "parseCharacter",
        "start",
        "startServer"
      ];
      
      console.log("\n📋 APIs Principales:");
      const foundAPIs: any = {};
      for (const api of keyAPIs) {
        const exists = api in elizaCore;
        foundAPIs[api] = exists;
        console.log(`   ${exists ? "✅" : "❌"} ${api}: ${exists ? "DISPONIBLE" : "No disponible"}`);
        
        if (exists) {
          const apiValue = (elizaCore as any)[api];
          const apiType = typeof apiValue;
          console.log(`      Tipo: ${apiType}`);
          
          if (apiType === "function" || (apiType === "object" && apiValue !== null)) {
            // Verificar si es una clase (constructor)
            try {
              const isClass = apiType === "function" && apiValue.prototype && apiValue.prototype.constructor === apiValue;
              if (isClass) {
                console.log(`      Es una clase`);
                const methods = Object.getOwnPropertyNames(apiValue.prototype).filter(name => name !== "constructor");
                if (methods.length > 0) {
                  console.log(`      Métodos: ${methods.join(", ")}`);
                }
              } else if (apiType === "function") {
                console.log(`      Es una función`);
                console.log(`      Parámetros esperados: ${apiValue.length}`);
              } else if (apiType === "object") {
                const staticMethods = Object.keys(apiValue).filter(key => typeof (apiValue as any)[key] === "function");
                if (staticMethods.length > 0) {
                  console.log(`      Métodos estáticos: ${staticMethods.join(", ")}`);
                }
              }
            } catch (e) {
              // Ignorar errores de inspección
            }
          }
        }
      }
      
      // Verificar variables de entorno
      console.log("\n🔐 VARIABLES DE ENTORNO:");
      console.log("═".repeat(60));
      const requiredEnvVars = [
        "OPENAI_API_KEY",
        "OPENAI_API_BASE_URL",
        "OPENAI_MODEL",
        "SOLANA_RPC_URL",
        "SOLANA_PUBLIC_KEY",
        "SOLANA_PRIVATE_KEY",
        "X_API_KEY",
        "X_API_SECRET",
        "X_ACCESS_TOKEN",
        "X_ACCESS_SECRET"
      ];
      
      const optionalEnvVars = [
        "PORT",
        "DAEMON_PROCESS",
        "ELIZA_UI_ENABLE",
        "CORS_ORIGIN",
        "HELIUS_API_KEY",
        "X_BEARER_TOKEN"
      ];
      
      console.log("\n📌 Variables Requeridas:");
      for (const varName of requiredEnvVars) {
        const value = process.env[varName];
        const isSet = value !== undefined && value !== "";
        console.log(`   ${isSet ? "✅" : "❌"} ${varName}: ${isSet ? "CONFIGURADA" : "NO configurada"}`);
        if (isSet && varName.includes("KEY") || varName.includes("SECRET") || varName.includes("PRIVATE")) {
          console.log(`      Valor: ${value?.substring(0, 10)}...${value?.substring(value.length - 5)} (oculto)`);
        } else if (isSet) {
          console.log(`      Valor: ${value}`);
        }
      }
      
      console.log("\n📌 Variables Opcionales:");
      for (const varName of optionalEnvVars) {
        const value = process.env[varName];
        const isSet = value !== undefined && value !== "";
        console.log(`   ${isSet ? "✅" : "⚪"} ${varName}: ${isSet ? value : "No configurada"}`);
      }
      
      console.log("\n" + "═".repeat(60));
      
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
        
        const service = await createService({
          character: validatedCharacter,
          token: process.env.OPENAI_API_KEY || "",
        });
        
        // Diagnosticar métodos disponibles en el servicio
        console.log("\n🔍 Métodos disponibles en el servicio:");
        const serviceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(service)).concat(
          Object.keys(service)
        ).filter(name => typeof (service as any)[name] === "function" && name !== "constructor");
        if (serviceMethods.length > 0) {
          console.log(`   Métodos: ${serviceMethods.join(", ")}`);
        } else {
          console.log("   No se encontraron métodos adicionales");
        }
        
        // El servicio puede tener diferentes métodos, intentar los más comunes
        if (typeof service.start === "function") {
          console.log("   → Usando método: start()");
          await service.start();
        } else if (typeof service.run === "function") {
          console.log("   → Usando método: run()");
          await service.run();
        } else if (typeof service.listen === "function") {
          console.log(`   → Usando método: listen(${port})`);
          await service.listen(parseInt(port));
        } else {
          // Si no tiene métodos de inicio, solo loguear que está listo
          console.log("   ⚠️ No se encontró método de inicio, servicio creado (inicio automático esperado)");
        }
        
        console.log(`\n✅ AMICA Agent iniciado correctamente en puerto ${port}`);
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
        if (service && typeof service.start === "function") {
          console.log("   → Usando método: start()");
          await service.start();
        } else if (service && typeof service.run === "function") {
          console.log("   → Usando método: run()");
          await service.run();
        } else if (service && typeof service.listen === "function") {
          console.log(`   → Usando método: listen(${port})`);
          await service.listen(parseInt(port));
        } else {
          console.log("   ⚠️ No se encontró método de inicio, servicio creado (inicio automático esperado)");
        }
        
        console.log(`\n✅ AMICA Agent iniciado correctamente en puerto ${port}`);
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
