// Script para verificar variables de entorno antes de iniciar
// Función principal async para permitir imports dinámicos
async function main() {
  // FUNCIÓN CRÍTICA: Limpiar comillas de todas las variables de entorno al inicio
  // Railway a veces incluye comillas alrededor de los valores
  function cleanEnvVar(value) {
    if (!value) return value;
    let cleaned = value.trim();
    // Remover comillas simples o dobles al inicio y final
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned;
  }
  
  function cleanAllEnvVars() {
    const varsToClean = [
      'OPENAI_API_KEY',
      'OPENAI_API_BASE_URL',
      'OPENAI_BASE_URL', // Variable alternativa que algunos plugins pueden usar
      'OPENAI_MODEL',
      'SOLANA_RPC_URL',
      'SOLANA_PUBLIC_KEY',
      'SOLANA_PRIVATE_KEY',
      'HELIUS_API_KEY',
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET_KEY',
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_TOKEN_SECRET',
      'TWITTER_BEARER_TOKEN',
      'X_API_KEY',
      'X_API_SECRET',
      'X_ACCESS_TOKEN',
      'X_ACCESS_SECRET',
      'X_BEARER_TOKEN'
    ];
    
    const cleanedVars = [];
    varsToClean.forEach(varName => {
      if (process.env[varName]) {
        const original = process.env[varName];
        const cleaned = cleanEnvVar(original);
        if (original !== cleaned) {
          process.env[varName] = cleaned;
          cleanedVars.push(varName);
        }
      }
    });
    
    if (cleanedVars.length > 0) {
      console.log("🔧 Limpiando comillas de variables de entorno:");
      cleanedVars.forEach(v => console.log(`   - ${v}`));
      console.log("");
    }
  }
  
  // Limpiar variables al inicio ANTES de cualquier validación
  cleanAllEnvVars();
  
console.log("\n🔍 Verificando variables de entorno de Railway...\n");

const requiredVars = [
  'OPENAI_API_KEY',
  'OPENAI_API_BASE_URL',
  'SOLANA_RPC_URL',
  'SOLANA_PUBLIC_KEY',
  'SOLANA_PRIVATE_KEY'
];

const optionalVars = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET_KEY',
  'HELIUS_API_KEY'
];

console.log("📋 Variables requeridas:");
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mostrar primeros y últimos caracteres para seguridad
    const masked = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` 
      : value.substring(0, 4) + '***';
    console.log(`   ✅ ${varName}: ${masked} (${value.length} chars)`);
  } else {
    console.log(`   ❌ ${varName}: NO CONFIGURADA`);
  }
});

console.log("\n📋 Variables opcionales:");
optionalVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`   ${value ? '✅' : '❌'} ${varName}: ${value ? 'Configurada' : 'No configurada'}`);
});

// Validar formato base58 de Solana
function isValidBase58(str) {
  // Base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  // No incluye: 0 (cero), O (letra O mayúscula), I (letra I mayúscula), l (letra L minúscula)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return base58Regex.test(str);
}

console.log("\n🔍 Validación de formatos:");

// Validar y limpiar OpenAI API Key
let openAIKey = process.env.OPENAI_API_KEY || '';
const originalOpenAIKey = openAIKey;
openAIKey = cleanEnvVar(openAIKey);

if (openAIKey) {
  if (originalOpenAIKey !== openAIKey) {
    console.log("   ⚠️ OPENAI_API_KEY: Se detectaron comillas - limpiando automáticamente");
    process.env.OPENAI_API_KEY = openAIKey; // Actualizar sin comillas
  }
  
  if (!openAIKey.startsWith('xai-') && !openAIKey.startsWith('sk-')) {
    console.log("   ⚠️ OPENAI_API_KEY: No empieza con 'xai-' (Grok) ni 'sk-' (OpenAI) - Puede ser inválida");
  } else if (openAIKey.startsWith('xai-')) {
    console.log("   ✅ OPENAI_API_KEY: Formato correcto para Grok (empieza con 'xai-')");
  } else if (openAIKey.startsWith('sk-')) {
    console.log("   ⚠️ OPENAI_API_KEY: Es una clave de OpenAI (sk-), pero necesitas Grok (xai-)");
    console.log("   💡 Para usar Grok, obtén una API key de https://console.x.ai");
  } else {
    console.log("   ✅ OPENAI_API_KEY: Formato parece correcto");
  }
  // Verificar caracteres invisibles
  if (openAIKey !== openAIKey.trim()) {
    console.log("   ⚠️ OPENAI_API_KEY: Tiene espacios en blanco al inicio/final");
  }
} else {
  console.log("   ❌ OPENAI_API_KEY: NO CONFIGURADA");
}

// Validar y limpiar OPENAI_API_BASE_URL para Grok
// IMPORTANTE: Algunos plugins pueden usar OPENAI_BASE_URL en lugar de OPENAI_API_BASE_URL
let openAIBaseURL = process.env.OPENAI_API_BASE_URL || process.env.OPENAI_BASE_URL || '';
const originalOpenAIBaseURL = openAIBaseURL;
openAIBaseURL = cleanEnvVar(openAIBaseURL);

if (openAIKey && openAIKey.startsWith('xai-')) {
  // Si es una clave de Grok, verificar que la URL base sea correcta
  if (originalOpenAIBaseURL !== openAIBaseURL) {
    console.log("   ⚠️ OPENAI_API_BASE_URL: Se detectaron comillas - limpiando automáticamente");
  }
  
  // Asegurar que ambas variables estén configuradas (algunos plugins usan una u otra)
  const grokBaseURL = 'https://api.x.ai/v1';
  if (!openAIBaseURL) {
    console.log("   ❌ OPENAI_API_BASE_URL: NO CONFIGURADA - CRÍTICO para Grok");
    console.log("   💡 Configura OPENAI_API_BASE_URL=https://api.x.ai/v1 en Railway");
    // Configurar automáticamente para intentar que funcione
    process.env.OPENAI_API_BASE_URL = grokBaseURL;
    process.env.OPENAI_BASE_URL = grokBaseURL; // También configurar la alternativa
    console.log("   🔧 Configurando automáticamente OPENAI_API_BASE_URL y OPENAI_BASE_URL a https://api.x.ai/v1");
  } else if (openAIBaseURL !== grokBaseURL) {
    console.log(`   ⚠️ OPENAI_API_BASE_URL: '${openAIBaseURL}' - Debería ser '${grokBaseURL}' para Grok`);
    console.log("   💡 Actualiza OPENAI_API_BASE_URL a 'https://api.x.ai/v1' en Railway");
  } else {
    console.log(`   ✅ OPENAI_API_BASE_URL: Configurada correctamente para Grok (${grokBaseURL})`);
  }
  
  // Asegurar que ambas variables estén configuradas correctamente
  process.env.OPENAI_API_BASE_URL = grokBaseURL;
  process.env.OPENAI_BASE_URL = grokBaseURL;
  console.log("   ✅ Configuradas ambas variables (OPENAI_API_BASE_URL y OPENAI_BASE_URL) para compatibilidad");
}

// Validar Solana Private Key
const solanaKey = (process.env.SOLANA_PRIVATE_KEY || '').trim();
if (solanaKey) {
  if (solanaKey.startsWith('"') || solanaKey.endsWith('"')) {
    console.log("   ⚠️ SOLANA_PRIVATE_KEY: Tiene comillas alrededor - PROBLEMA DETECTADO");
  }
  
  // Limpiar la clave
  const cleanKey = solanaKey.replace(/"/g, '').trim();
  
  // Verificar caracteres invisibles
  const hasWhitespace = /\s/.test(cleanKey);
  if (hasWhitespace) {
    console.log("   ❌ SOLANA_PRIVATE_KEY: Contiene espacios o saltos de línea");
    const whitespaceChars = cleanKey.match(/\s/g);
    if (whitespaceChars) {
      const unique = [...new Set(whitespaceChars)];
      console.log(`      Caracteres de espacio encontrados: ${unique.map(c => `'${c.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}' (codigo: ${c.charCodeAt(0)})`).join(', ')}`);
    }
  }
  
  // Validar base58
  if (!isValidBase58(cleanKey)) {
    console.log("   ❌ SOLANA_PRIVATE_KEY: Contiene caracteres inválidos para base58");
    // Encontrar caracteres inválidos
    const invalidChars = cleanKey.split('').filter(char => !/[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/.test(char));
    if (invalidChars.length > 0) {
      const uniqueInvalid = [...new Set(invalidChars)];
      console.log(`      Caracteres inválidos encontrados: ${uniqueInvalid.map(c => `'${c}' (codigo: ${c.charCodeAt(0)})`).join(', ')}`);
    }
  } else {
    console.log("   ✅ SOLANA_PRIVATE_KEY: Formato base58 válido");
    
    // Intentar decodificar con bs58 para verificar la longitud de bytes
    try {
      // Intentar cargar bs58 (ESM import dinámico)
      let bs58;
      try {
        // Como el proyecto es ESM, usar import dinámico
        const bs58Module = await import('bs58');
        bs58 = bs58Module.default || bs58Module;
      } catch (importError) {
        // Si import falla, intentar desde @solana/web3.js
        try {
          const solanaWeb3 = await import('@solana/web3.js');
          bs58 = solanaWeb3.bs58 || solanaWeb3.default?.bs58;
          if (!bs58) {
            // Si no está disponible, intentar require como fallback (solo en CommonJS)
            try {
              const { createRequire } = await import('module');
              const require = createRequire(import.meta.url);
              bs58 = require('bs58');
            } catch (requireError) {
              throw new Error('bs58 no disponible');
            }
          }
        } catch (solanaError) {
          throw new Error('bs58 no disponible');
        }
      }
      
      const decoded = bs58.decode(cleanKey);
      const decodedLength = decoded.length;
      
      console.log(`   📊 SOLANA_PRIVATE_KEY decodificada: ${decodedLength} bytes`);
      
      // Una clave privada de Solana puede ser:
      // - 32 bytes: solo la clave privada (seed)
      // - 64 bytes: clave privada (32 bytes) + clave pública (32 bytes) concatenadas
      if (decodedLength === 32) {
        console.log("   ✅ SOLANA_PRIVATE_KEY: Tiene 32 bytes (solo privada/seed)");
        console.log("   ⚠️ ElizaOS probablemente espera 64 bytes (privada + pública concatenadas)");
        console.log("   💡 SOLUCIÓN: Convertir a formato de 64 bytes");
        
        try {
          const { Keypair } = await import('@solana/web3.js');
          // Generar el keypair completo desde el seed de 32 bytes
          const keypair = Keypair.fromSeed(decoded);
          
          // Crear el array de 64 bytes: privada (32) + pública (32)
          const secretKey = new Uint8Array(64);
          secretKey.set(keypair.secretKey.slice(0, 32), 0);  // Privada
          secretKey.set(keypair.publicKey.toBytes(), 32);     // Pública
          
          // Convertir a base58
          const secretKey64Bytes = bs58.encode(secretKey);
          
          console.log("\n   📋 Clave privada en formato 64 bytes (para ElizaOS):");
          console.log(`   ${secretKey64Bytes}`);
          console.log("\n   📋 Clave pública derivada:");
          console.log(`   ${keypair.publicKey.toBase58()}`);
          console.log("\n   📝 INSTRUCCIONES:");
          console.log("   1. Copia la clave de 64 bytes de arriba");
          console.log("   2. En Railway, actualiza SOLANA_PRIVATE_KEY con esta nueva clave");
          console.log("   3. También actualiza SOLANA_PUBLIC_KEY con la clave pública derivada");
          
          // Verificar correspondencia si hay clave pública configurada
          const solanaPubKey = (process.env.SOLANA_PUBLIC_KEY || '').trim();
          if (solanaPubKey) {
            const cleanPubKey = solanaPubKey.replace(/"/g, '').trim();
            const derivedPublicKey = keypair.publicKey.toBase58();
            
            if (derivedPublicKey === cleanPubKey) {
              console.log("   ✅ La clave pública configurada coincide con la derivada");
            } else {
              console.log("\n   ⚠️ ADVERTENCIA: La clave pública configurada NO coincide");
              console.log(`   📋 Clave pública configurada:  ${cleanPubKey}`);
              console.log(`   📋 Clave pública derivada:     ${derivedPublicKey}`);
              console.log("   💡 Actualiza SOLANA_PUBLIC_KEY con la clave pública derivada de arriba");
            }
          }
        } catch (convertError) {
          console.log(`   ⚠️ Error al convertir clave: ${convertError.message}`);
        }
      } else if (decodedLength === 64) {
        console.log("   ✅ SOLANA_PRIVATE_KEY: Tiene 64 bytes (privada + pública concatenadas)");
        console.log("   ✅ Este es el formato que ElizaOS debería aceptar");
        
        try {
          const { Keypair } = await import('@solana/web3.js');
          // Probar que la clave de 64 bytes funciona
          const keypair = Keypair.fromSecretKey(decoded);
          const derivedPublicKey = keypair.publicKey.toBase58();
          
          console.log("   ✅ La clave de 64 bytes es válida y funciona correctamente");
          console.log(`   📋 Clave pública derivada: ${derivedPublicKey}`);
          
          // Verificar correspondencia con clave pública configurada
          const solanaPubKey = (process.env.SOLANA_PUBLIC_KEY || '').trim();
          if (solanaPubKey) {
            const cleanPubKey = solanaPubKey.replace(/"/g, '').trim();
            
            if (derivedPublicKey === cleanPubKey) {
              console.log("   ✅ SOLANA_PRIVATE_KEY corresponde a SOLANA_PUBLIC_KEY");
            } else {
              console.log("\n   ⚠️ ADVERTENCIA: La clave pública configurada NO coincide");
              console.log(`   📋 Clave pública configurada:  ${cleanPubKey}`);
              console.log(`   📋 Clave pública derivada:     ${derivedPublicKey}`);
              console.log("\n   💡 SOLUCIÓN:");
              console.log("   Actualiza SOLANA_PUBLIC_KEY en Railway con:");
              console.log(`   ${derivedPublicKey}`);
            }
          }
          
          // IMPORTANTE: ElizaOS necesita solo los primeros 32 bytes (seed)
          // Convertir automáticamente la clave de 64 bytes a 32 bytes para ElizaOS
          console.log("\n   🔄 Convirtiendo automáticamente clave de 64 bytes a 32 bytes (seed) para ElizaOS...");
          const seedOnly = decoded.slice(0, 32);
          const seedBase58 = bs58.encode(seedOnly);
          
          // Actualizar process.env para que ElizaOS use la versión de 32 bytes
          const oldKey = process.env.SOLANA_PRIVATE_KEY;
          process.env.SOLANA_PRIVATE_KEY = seedBase58;
          
          console.log(`   ✅ SOLANA_PRIVATE_KEY actualizada automáticamente a formato de 32 bytes (seed)`);
          console.log(`   📋 Longitud anterior: ${oldKey.length} chars → Nueva: ${seedBase58.length} chars`);
          console.log(`   📋 Clave pública correspondiente: ${derivedPublicKey}`);
          console.log(`   💡 Ahora ElizaOS usará la clave en el formato correcto que necesita`);
          
          // Verificar que la conversión funcionó correctamente
          try {
            const testDecoded = bs58.decode(seedBase58);
            if (testDecoded.length === 32) {
              console.log(`   ✅ Verificación: La clave convertida tiene exactamente 32 bytes`);
            } else {
              console.log(`   ⚠️ ADVERTENCIA: La clave convertida tiene ${testDecoded.length} bytes (esperado: 32)`);
            }
          } catch (verifyError) {
            console.log(`   ⚠️ Error al verificar clave convertida: ${verifyError.message}`);
          }
          
        } catch (testError) {
          console.log(`   ❌ Error al validar clave de 64 bytes: ${testError.message}`);
          console.log("   💡 Esto explica el error 'bad secret key size' en ElizaOS");
        }
      } else {
        console.log(`   ❌ SOLANA_PRIVATE_KEY: Tamaño incorrecto después de decodificar (${decodedLength} bytes)`);
        console.log(`      Esperado: 32 bytes (solo privada) o 64 bytes (privada + pública)`);
        console.log(`      Esto explica el error "bad secret key size"`);
        console.log(`   💡 SOLUCIÓN: La clave debe tener exactamente 32 o 64 bytes después de decodificar base58`);
        console.log(`      Verifica que la clave exportada desde Phantom/Solflare sea la correcta`);
      }
    } catch (decodeError) {
      if (decodeError.message === 'bs58 no disponible') {
        console.log(`   ⚠️ SOLANA_PRIVATE_KEY: No se pudo cargar bs58 para decodificar (normal si bs58 no está instalado directamente)`);
      } else {
        console.log(`   ❌ SOLANA_PRIVATE_KEY: Error al decodificar con bs58: ${decodeError.message}`);
        console.log(`      Esto puede indicar que la clave tiene caracteres inválidos o formato incorrecto`);
        console.log(`   💡 SOLUCIÓN: Verifica que la clave no tenga espacios, saltos de línea o caracteres especiales`);
      }
    }
  }
  
  // Validar longitud de la cadena base58
  const keyLength = cleanKey.length;
  if (keyLength < 40 || keyLength > 100) {
    console.log(`   ⚠️ SOLANA_PRIVATE_KEY: Longitud inusual (${keyLength} chars). Esperado: 40-100 chars`);
  } else {
    console.log(`   ✅ SOLANA_PRIVATE_KEY: Longitud de cadena parece correcta (${keyLength} chars)`);
  }
}

// Validar Solana Public Key
const solanaPubKey = cleanEnvVar(process.env.SOLANA_PUBLIC_KEY || '');
if (solanaPubKey) {
  if (!isValidBase58(solanaPubKey)) {
    console.log("   ❌ SOLANA_PUBLIC_KEY: Contiene caracteres inválidos para base58");
  } else if (solanaPubKey.length !== 44) {
    console.log(`   ⚠️ SOLANA_PUBLIC_KEY: Longitud inusual (${solanaPubKey.length} chars). Esperado: 44 chars`);
  } else {
    console.log("   ✅ SOLANA_PUBLIC_KEY: Formato y longitud correctos");
  }
  // Asegurar que la variable está limpia
  if (process.env.SOLANA_PUBLIC_KEY !== solanaPubKey) {
    process.env.SOLANA_PUBLIC_KEY = solanaPubKey;
  }
}

console.log("\n");
  
  // Después de validar y convertir las variables, ejecutar elizaos start
  console.log("🚀 Iniciando ElizaOS con variables de entorno validadas...\n");
  
  // Log final de variables críticas para debugging
  console.log("📋 Variables finales que se pasarán a ElizaOS:");
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA'}`);
  console.log(`   OPENAI_API_BASE_URL: ${process.env.OPENAI_API_BASE_URL || 'NO CONFIGURADA'}`);
  console.log(`   OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || 'NO CONFIGURADA'}`);
  console.log(`   SOLANA_PRIVATE_KEY: ${process.env.SOLANA_PRIVATE_KEY ? process.env.SOLANA_PRIVATE_KEY.substring(0, 10) + '...' + ` (${process.env.SOLANA_PRIVATE_KEY.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`   SOLANA_PUBLIC_KEY: ${process.env.SOLANA_PUBLIC_KEY || 'NO CONFIGURADA'}\n`);
  
  const { spawn } = await import('child_process');
  
  // Ejecutar elizaos start usando npx (que encontrará el ejecutable correcto)
  // Pasar las variables de entorno actualizadas (incluyendo SOLANA_PRIVATE_KEY convertida)
  const elizaosProcess = spawn('npx', ['-y', 'elizaos', 'start', '--character', './characters/amica-agent.json'], {
    stdio: 'inherit', // Heredar stdin, stdout, stderr
    env: process.env,  // Pasar todas las variables de entorno (incluyendo SOLANA_PRIVATE_KEY actualizada)
    cwd: process.cwd(),
    shell: true  // Usar shell para que npx funcione correctamente
  });
  
  // Manejar salida del proceso
  elizaosProcess.on('error', (error) => {
    console.error('❌ Error al ejecutar ElizaOS:', error);
    process.exit(1);
  });
  
  elizaosProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ ElizaOS terminó con código de salida ${code}`);
      process.exit(code);
    }
  });
  
  // Manejar señales de terminación
  process.on('SIGINT', () => {
    elizaosProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    elizaosProcess.kill('SIGTERM');
  });
}

// Ejecutar función principal
main().catch(error => {
  console.error("❌ Error en script de verificación:", error);
  process.exit(1);
});

