// Alternative entry point using CommonJS (more compatible)
// This file can be used if the TypeScript version has issues

const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('🚀 Iniciando AMICA Agent...');
    
    const port = process.env.PORT || 3000;
    const characterPath = path.join(__dirname, 'characters', 'amica-agent.json');
    
    // Verificar que el archivo de personaje existe
    try {
      const characterContent = fs.readFileSync(characterPath, 'utf-8');
      console.log(`✅ Archivo de personaje encontrado: ${characterPath}`);
    } catch (error) {
      console.error(`❌ No se pudo leer el archivo de personaje: ${characterPath}`);
      throw error;
    }

    // Configurar variables de entorno
    process.env.ELIZA_CHARACTER_PATH = characterPath;
    process.env.ELIZA_PORT = port.toString();
    
    console.log(`📡 Puerto: ${port}`);
    console.log(`🤖 Personaje: ${characterPath}`);
    
    // Intentar importar ElizaOS
    try {
      console.log('📦 Cargando módulos de ElizaOS...');
      
      // Intentar importación dinámica (ESM)
      let elizaCore;
      try {
        elizaCore = await import('@elizaos/core');
      } catch (importError) {
        // Si falla, intentar con require (CommonJS)
        console.log('⚠️ Import ESM falló, intentando require...');
        elizaCore = require('@elizaos/core');
      }
      
      // Cargar configuración del personaje
      const characterConfig = JSON.parse(
        fs.readFileSync(characterPath, 'utf-8')
      );
      
      // Buscar función de inicio
      const startFunction = elizaCore?.start || 
                           elizaCore?.startServer || 
                           elizaCore?.default?.start ||
                           elizaCore?.default?.startServer ||
                           elizaCore?.default;
      
      if (typeof startFunction === 'function') {
        console.log('✅ Función de inicio encontrada, iniciando servidor...');
        
        const startOptions = {
          character: characterConfig,
          port: parseInt(port.toString()),
        };
        
        await startFunction(startOptions);
        console.log(`✅ AMICA Agent iniciado correctamente en puerto ${port}`);
      } else {
        console.error('❌ No se encontró función de inicio');
        console.error('Módulo exportado:', Object.keys(elizaCore || {}));
        throw new Error('No se encontró función de inicio en @elizaos/core');
      }
    } catch (importError) {
      console.error('❌ Error al cargar ElizaOS:', importError.message);
      console.error('\n📝 Soluciones sugeridas:');
      console.error('   1. Verifica que @elizaos/core esté instalado');
      console.error('   2. Verifica la versión en package.json');
      console.error('   3. Revisa la documentación de ElizaOS');
      throw importError;
    }
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

main();
