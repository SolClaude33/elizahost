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
      // Variables específicas de XAI/Grok (prioritarias)
      'XAI_API_KEY',
      'XAI_MODEL',
      // Variables genéricas de OpenAI (para compatibilidad)
      'OPENAI_API_KEY',
      'OPENAI_API_BASE_URL',
      'OPENAI_BASE_URL', // Variable alternativa que algunos plugins pueden usar
      'OPENAI_MODEL',
      // Variables EVM / BNB Chain
      'BNB_RPC_URL',
      'BNB_WALLET_ADDRESS',
      'BNB_PRIVATE_KEY',
      'DEXSCREENER_API_KEY',
      // Variables de Solana
      'SOLANA_RPC_URL',
      'SOLANA_PUBLIC_KEY',
      'SOLANA_PRIVATE_KEY',
      'SOLANA_WALLET_PRIVATE_KEY', // Alternativa soportada por ElizaOS
      'HELIUS_API_KEY',
      'SOL_ADDRESS', // Requerido por @elizaos/plugin-solana
      'SLIPPAGE', // Requerido por @elizaos/plugin-solana
      'BIRDEYE_API_KEY', // Recomendado por @elizaos/plugin-solana
      'ELEVENLABS_API_KEY', // Solo si usas @elizaos/plugin-elevenlabs
      // Variables de Twitter
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
  
  // Detectar y mapear variables específicas de XAI a OpenAI para compatibilidad
  function setupXAIEnvVars() {
    // Si XAI_API_KEY está configurada, tiene prioridad sobre OPENAI_API_KEY
    if (process.env.XAI_API_KEY) {
      console.log("🎯 Detectadas variables específicas de XAI/Grok - Usándolas con prioridad\n");
      
      // Mapear XAI_API_KEY a OPENAI_API_KEY para compatibilidad
      process.env.OPENAI_API_KEY = process.env.XAI_API_KEY;
      console.log("   ✅ XAI_API_KEY → OPENAI_API_KEY (mapeada para compatibilidad)");
      
      // Configurar la base URL de Grok si no está configurada
      if (!process.env.OPENAI_API_BASE_URL) {
        process.env.OPENAI_API_BASE_URL = 'https://api.x.ai/v1';
        process.env.OPENAI_BASE_URL = 'https://api.x.ai/v1';
        console.log("   ✅ Configurada OPENAI_API_BASE_URL=https://api.x.ai/v1 automáticamente");
      }
      
      // Si XAI_MODEL está configurada, mapearla a OPENAI_MODEL
      if (process.env.XAI_MODEL) {
        process.env.OPENAI_MODEL = process.env.XAI_MODEL;
        console.log(`   ✅ XAI_MODEL=${process.env.XAI_MODEL} → OPENAI_MODEL (mapeada)`);
      } else {
        // Si no hay XAI_MODEL, usar grok-beta por defecto
        process.env.OPENAI_MODEL = 'grok-beta';
        process.env.XAI_MODEL = 'grok-beta';
        console.log("   ✅ Configurado modelo por defecto: grok-beta (ya que XAI_MODEL no está configurada)");
      }
      
      console.log("");
      return true; // Indica que se usaron variables de XAI
    }
    return false; // No hay variables específicas de XAI
  }
  
  // Limpiar variables al inicio ANTES de cualquier validación
  cleanAllEnvVars();
  
  // Configurar variables específicas de XAI si están disponibles
  const usingXAI = setupXAIEnvVars();
  
console.log("\n🔍 Verificando variables de entorno de Railway...\n");

// Detectar personaje seleccionado y plugins, para requerir SOLO las variables necesarias
// Valores típicos: 'niya-agent', 'amica-agent', etc. (sin extensión) o con '.json'
let selectedCharacterNameRaw = process.env.ELIZA_CHARACTER_NAME || 'niya-agent';
const selectedCharacterName = selectedCharacterNameRaw.endsWith('.json')
  ? selectedCharacterNameRaw.slice(0, -5)
  : selectedCharacterNameRaw;
// Compatibilidad: si aún usas 'nyako-agent', mapear a 'niya-agent'
const normalizedSelectedCharacterName = selectedCharacterName === 'nyako-agent'
  ? 'niya-agent'
  : selectedCharacterName;
const selectedCharacterPath = `./characters/${normalizedSelectedCharacterName}.json`;

let selectedPlugins = [];
try {
  const fsModule = await import('fs');
  const selectedCharacterConfig = JSON.parse(fsModule.readFileSync(selectedCharacterPath, 'utf-8'));
  if (Array.isArray(selectedCharacterConfig?.plugins)) {
    selectedPlugins = selectedCharacterConfig.plugins;
  }
} catch (e) {
  console.log(`⚠️ No se pudo leer '${selectedCharacterPath}' para detectar plugins (continuando igual).`);
}

const usesSolana = selectedPlugins.includes('@elizaos/plugin-solana');
const usesEvm = selectedPlugins.includes('@elizaos/plugin-evm');

const requiredVars = [
  // Verificar XAI_API_KEY primero, luego OPENAI_API_KEY como fallback
  ...(process.env.XAI_API_KEY ? ['XAI_API_KEY'] : ['OPENAI_API_KEY']),
  'OPENAI_API_BASE_URL',
  ...(usesSolana ? [
    'SOLANA_RPC_URL',
    'SOLANA_PUBLIC_KEY',
    'SOLANA_PRIVATE_KEY',
    'SOL_ADDRESS', // Requerido por @elizaos/plugin-solana
    'SLIPPAGE', // Requerido por @elizaos/plugin-solana
    'HELIUS_API_KEY' // Requerido por @elizaos/plugin-solana
  ] : []),
  ...(usesEvm ? [
    'BNB_RPC_URL',
    'BNB_WALLET_ADDRESS',
    'BNB_PRIVATE_KEY'
  ] : [])
];

const optionalVars = [
  'XAI_MODEL', // Modelo específico de XAI/Grok
  'OPENAI_MODEL', // Modelo genérico (puede ser usado como fallback)
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET_KEY',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET',
  'TWITTER_BEARER_TOKEN',
  ...(usesSolana ? ['BIRDEYE_API_KEY'] : []), // Recomendado por @elizaos/plugin-solana
  ...(usesEvm ? ['DEXSCREENER_API_KEY'] : []), // Opcional para consultas de mercado
  'ELEVENLABS_API_KEY' // Solo si usas @elizaos/plugin-elevenlabs
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

// Validaciones específicas por plugin (según el personaje seleccionado)
if (usesEvm) {
  console.log("\n🔍 Validación EVM / BNB:");

  const bnbRpcUrl = cleanEnvVar(process.env.BNB_RPC_URL || '');
  if (!bnbRpcUrl) {
    console.log("   ❌ BNB_RPC_URL: NO CONFIGURADA");
  } else if (!/^https?:\/\//i.test(bnbRpcUrl)) {
    console.log(`   ⚠️ BNB_RPC_URL: '${bnbRpcUrl}' no parece una URL http(s) válida`);
  } else {
    process.env.BNB_RPC_URL = bnbRpcUrl;
    console.log(`   ✅ BNB_RPC_URL: Configurada (${bnbRpcUrl.substring(0, 30)}...)`);
  }

  const bnbWallet = cleanEnvVar(process.env.BNB_WALLET_ADDRESS || '');
  if (!bnbWallet) {
    console.log("   ❌ BNB_WALLET_ADDRESS: NO CONFIGURADA");
  } else {
    const normalizedWallet = bnbWallet.trim();
    const isValidWallet = /^0x[a-fA-F0-9]{40}$/.test(normalizedWallet);
    if (!isValidWallet) {
      console.log("   ⚠️ BNB_WALLET_ADDRESS: Formato esperado '0x' + 40 caracteres hex");
    } else {
      console.log("   ✅ BNB_WALLET_ADDRESS: Formato válido");
    }
    process.env.BNB_WALLET_ADDRESS = normalizedWallet;
  }

  const bnbPrivateKeyRaw = cleanEnvVar(process.env.BNB_PRIVATE_KEY || '');
  if (!bnbPrivateKeyRaw) {
    console.log("   ❌ BNB_PRIVATE_KEY: NO CONFIGURADA");
  } else {
    let key = bnbPrivateKeyRaw.replace(/"/g, '').trim();
    if (key.startsWith('0x') || key.startsWith('0X')) {
      key = key.slice(2);
    }
    const isValidKey = /^[a-fA-F0-9]{64}$/.test(key);
    if (!isValidKey) {
      console.log("   ⚠️ BNB_PRIVATE_KEY: Debe ser 32 bytes hex (64 chars), con o sin prefijo 0x");
    } else {
      console.log("   ✅ BNB_PRIVATE_KEY: Formato hex válido (32 bytes)");
    }
    // Normalizar a 0x + minúsculas (muchas libs EVM esperan este formato)
    process.env.BNB_PRIVATE_KEY = `0x${key.toLowerCase()}`;
  }

  const dexscreenerKey = cleanEnvVar(process.env.DEXSCREENER_API_KEY || '');
  if (dexscreenerKey) {
    console.log(`   ✅ DEXSCREENER_API_KEY: Configurada (${dexscreenerKey.substring(0, 8)}...)`);
  } else {
    console.log("   ⚠️ DEXSCREENER_API_KEY: No configurada (opcional)");
  }
}

if (usesSolana) {
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
          
          // NOTA: Según la investigación, el plugin de Solana podría necesitar 32 bytes (seed) o 64 bytes
          // La clave de 64 bytes funciona correctamente con Keypair.fromSecretKey()
          // Pero algunos plugins esperan 32 bytes (seed) para usar con Keypair.fromSeed()
          
          // ESTRATEGIA: Intentar primero con 32 bytes (seed), que es lo más común en plugins de Solana
          // Si esto no funciona, el usuario puede cambiar a 64 bytes manualmente
          console.log("\n   🔄 Estrategia de conversión:");
          console.log("   - La clave de 64 bytes funciona con Keypair.fromSecretKey()");
          console.log("   - Muchos plugins esperan 32 bytes (seed) para Keypair.fromSeed()");
          console.log("   - Convirtiendo a 32 bytes (seed) que es el formato más común");
          
          // Preparar ambas versiones
          const seedOnly = decoded.slice(0, 32);
          const seedBase58 = bs58.encode(seedOnly);
          const key64BytesBase58 = cleanKey; // La clave original de 64 bytes
          
          // PROBAR CON LA CLAVE DE 64 BYTES PRIMERO (ya funciona con Keypair.fromSecretKey)
          // Si el error persiste, entonces intentaremos con 32 bytes
          const oldKey = process.env.SOLANA_PRIVATE_KEY;
          
          // Verificar si el usuario quiere usar 64 bytes explícitamente
          const use64Bytes = process.env.SOLANA_USE_64_BYTES === 'true' || process.env.SOLANA_USE_64_BYTES === '1';
          
          if (use64Bytes) {
            // Usar la clave de 64 bytes directamente
            process.env.SOLANA_PRIVATE_KEY = key64BytesBase58;
            // También configurar SOLANA_WALLET_PRIVATE_KEY por si ElizaOS lo requiere
            process.env.SOLANA_WALLET_PRIVATE_KEY = key64BytesBase58;
            console.log(`   ✅ SOLANA_PRIVATE_KEY configurada para usar formato de 64 bytes (formato completo)`);
            console.log(`   ✅ SOLANA_WALLET_PRIVATE_KEY también configurada (alternativa soportada por ElizaOS)`);
            console.log(`   📋 Longitud: ${key64BytesBase58.length} chars (64 bytes decodificados)`);
          } else {
            // Usar la clave de 32 bytes (seed) - formato más común
            process.env.SOLANA_PRIVATE_KEY = seedBase58;
            // También configurar SOLANA_WALLET_PRIVATE_KEY por si ElizaOS lo requiere
            process.env.SOLANA_WALLET_PRIVATE_KEY = seedBase58;
            console.log(`   ✅ SOLANA_PRIVATE_KEY actualizada a formato de 32 bytes (seed)`);
            console.log(`   ✅ SOLANA_WALLET_PRIVATE_KEY también configurada (alternativa soportada por ElizaOS)`);
            console.log(`   📋 Longitud anterior: ${oldKey.length} chars → Nueva: ${seedBase58.length} chars`);
            
            // Verificar que la conversión funcionó correctamente
            try {
              const testDecoded = bs58.decode(seedBase58);
              if (testDecoded.length === 32) {
                console.log(`   ✅ Verificación: La clave convertida tiene exactamente 32 bytes`);
              } else {
                console.log(`   ⚠️ ADVERTENCIA: La clave convertida tiene ${testDecoded.length} bytes (esperado: 32)`);
              }
              
              // También verificar que podemos derivar el keypair desde el seed
              const { Keypair } = await import('@solana/web3.js');
              const testKeypair = Keypair.fromSeed(testDecoded);
              const testDerivedPubKey = testKeypair.publicKey.toBase58();
              if (testDerivedPubKey === derivedPublicKey) {
                console.log(`   ✅ Verificación: El seed deriva correctamente a la clave pública`);
              } else {
                console.log(`   ⚠️ ADVERTENCIA: El seed no deriva a la clave pública correcta`);
              }
            } catch (verifyError) {
              console.log(`   ⚠️ Error al verificar clave convertida: ${verifyError.message}`);
            }
          }
          
          console.log(`   📋 Clave pública correspondiente: ${derivedPublicKey}`);
          console.log(`   💡 Si el error 'bad secret key size' persiste, prueba configurar SOLANA_USE_64_BYTES=true`);
          
          // Guardar ambas versiones por si acaso
          process.env.SOLANA_PRIVATE_KEY_32BYTES = seedBase58;
          process.env.SOLANA_PRIVATE_KEY_64BYTES = key64BytesBase58;
          
          // DIAGNÓSTICO ADICIONAL: Verificar ambas versiones con diferentes métodos de @solana/web3.js
          console.log("\n   🔍 DIAGNÓSTICO: Probando diferentes métodos de decodificación:");
          try {
            const { Keypair } = await import('@solana/web3.js');
            
            // Probar clave de 64 bytes con Keypair.fromSecretKey
            try {
              const keypair64 = Keypair.fromSecretKey(decoded);
              console.log(`   ✅ 64 bytes con Keypair.fromSecretKey(): OK (public key: ${keypair64.publicKey.toBase58().substring(0, 10)}...)`);
            } catch (e) {
              console.log(`   ❌ 64 bytes con Keypair.fromSecretKey(): FALLA - ${e.message}`);
            }
            
            // Probar clave de 32 bytes (seed) con Keypair.fromSeed
            try {
              const seed32 = decoded.slice(0, 32);
              const keypair32 = Keypair.fromSeed(seed32);
              console.log(`   ✅ 32 bytes (seed) con Keypair.fromSeed(): OK (public key: ${keypair32.publicKey.toBase58().substring(0, 10)}...)`);
            } catch (e) {
              console.log(`   ❌ 32 bytes (seed) con Keypair.fromSeed(): FALLA - ${e.message}`);
            }
            
            // Probar clave de 64 bytes con Keypair.fromSeed (no debería funcionar, pero verificar)
            try {
              const keypair64Seed = Keypair.fromSeed(decoded);
              console.log(`   ⚠️  64 bytes con Keypair.fromSeed(): OK (pero no es el uso esperado)`);
            } catch (e) {
              console.log(`   ✅ 64 bytes con Keypair.fromSeed(): Falla como se espera - ${e.message.substring(0, 50)}...`);
            }
            
            console.log("\n   💡 NOTA: El plugin de Solana puede usar Keypair.fromSecretKey() para 64 bytes o Keypair.fromSeed() para 32 bytes");
            console.log("   💡 Si el error persiste, el problema podría estar en cómo el plugin lee la clave desde settings.secrets");
            console.log(`   💡 VALOR ACTUAL configurado: ${use64Bytes ? '64 bytes (formato completo)' : '32 bytes (seed)'}`);
            console.log(`   💡 Para cambiar, configura SOLANA_USE_64_BYTES=true o SOLANA_USE_64_BYTES=false en Railway`);
          } catch (diagError) {
            console.log(`   ⚠️ Error en diagnóstico: ${diagError.message}`);
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

// Validar SOL_ADDRESS (requerido por @elizaos/plugin-solana)
let solAddress = cleanEnvVar(process.env.SOL_ADDRESS || '');
const defaultSolAddress = 'So11111111111111111111111111111111111111112';
if (!solAddress) {
  console.log("   ⚠️ SOL_ADDRESS: NO CONFIGURADA - Configurando valor por defecto");
  process.env.SOL_ADDRESS = defaultSolAddress;
  solAddress = defaultSolAddress;
  console.log(`   🔧 SOL_ADDRESS configurada automáticamente: ${defaultSolAddress}`);
} else if (solAddress !== defaultSolAddress) {
  console.log(`   ⚠️ SOL_ADDRESS: '${solAddress}' - Valor esperado: '${defaultSolAddress}'`);
  console.log(`   💡 Configurando valor correcto automáticamente...`);
  process.env.SOL_ADDRESS = defaultSolAddress;
  solAddress = defaultSolAddress;
} else {
  console.log(`   ✅ SOL_ADDRESS: Configurada correctamente (${solAddress.substring(0, 20)}...)`);
}

// Validar SLIPPAGE (requerido por @elizaos/plugin-solana)
let slippage = cleanEnvVar(process.env.SLIPPAGE || '');
const defaultSlippage = '100'; // 1% = 100 basis points
if (!slippage) {
  console.log("   ⚠️ SLIPPAGE: NO CONFIGURADA - Configurando valor por defecto (100 = 1%)");
  process.env.SLIPPAGE = defaultSlippage;
  slippage = defaultSlippage;
  console.log(`   🔧 SLIPPAGE configurada automáticamente: ${defaultSlippage} (1%)`);
} else {
  const slippageNum = parseInt(slippage, 10);
  if (isNaN(slippageNum) || slippageNum < 0 || slippageNum > 10000) {
    console.log(`   ⚠️ SLIPPAGE: '${slippage}' es inválido - Debe ser un número entre 0 y 10000 (basis points)`);
    console.log(`   💡 Configurando valor por defecto: ${defaultSlippage}`);
    process.env.SLIPPAGE = defaultSlippage;
    slippage = defaultSlippage;
  } else {
    const percentage = slippageNum / 100;
    console.log(`   ✅ SLIPPAGE: Configurada correctamente (${slippage} basis points = ${percentage}%)`);
  }
}

// Validar BIRDEYE_API_KEY (opcional pero recomendado)
const birdeyeKey = cleanEnvVar(process.env.BIRDEYE_API_KEY || '');
if (!birdeyeKey) {
  console.log("   ⚠️ BIRDEYE_API_KEY: NO CONFIGURADA - Funcionalidad de mercado limitada");
  console.log("   💡 Para datos de mercado en tiempo real, obtén una API key en: https://birdeye.so/");
} else {
  console.log(`   ✅ BIRDEYE_API_KEY: Configurada (${birdeyeKey.substring(0, 8)}...)`);
}

// Validar HELIUS_API_KEY (requerido por @elizaos/plugin-solana)
const heliusKey = cleanEnvVar(process.env.HELIUS_API_KEY || '');
if (!heliusKey) {
  console.log("   ⚠️ HELIUS_API_KEY: NO CONFIGURADA - Necesaria para funcionalidad Solana");
  console.log("   💡 Obtén una API key en: https://www.helius.dev/");
} else {
  console.log(`   ✅ HELIUS_API_KEY: Configurada (${heliusKey.substring(0, 8)}...)`);
}
} // end usesSolana

console.log("\n");
  
  // Después de validar y convertir las variables, actualizar el archivo de personaje si es necesario
  // Esto asegura que ElizaOS use los valores reales en lugar de placeholders
  // Permite elegir el personaje mediante variable de entorno ELIZA_CHARACTER_NAME
  // Valores posibles: 'niya-agent', 'amica-agent' o cualquier otro archivo en ./characters/
  // Normalizar el nombre del personaje: remover .json si está presente
  let characterNameRaw = process.env.ELIZA_CHARACTER_NAME || 'niya-agent';
  // Remover extensión .json si está presente
  const characterName = characterNameRaw.endsWith('.json') 
    ? characterNameRaw.slice(0, -5) 
    : characterNameRaw;
  const normalizedCharacterName = characterName === 'nyako-agent' ? 'niya-agent' : characterName;
  const characterPath = `./characters/${normalizedCharacterName}.json`;
  console.log(`📋 Usando personaje: ${normalizedCharacterName}`);
  try {
    const fs = await import('fs');
    const characterConfig = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
    let needsUpdate = false;

    // Detectar plugins del personaje para evitar mezclar variables (Solana vs EVM)
    const characterPlugins = Array.isArray(characterConfig?.plugins) ? characterConfig.plugins : [];
    const characterUsesSolana = characterPlugins.includes('@elizaos/plugin-solana');
    const characterUsesEvm = characterPlugins.includes('@elizaos/plugin-evm');
    
    // Declarar apiKeyToUse una sola vez al inicio para reutilizarla en todo el scope
    // Priorizar XAI_API_KEY si existe, sino usar OPENAI_API_KEY
    const apiKeyToUse = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
    
        // Actualizar settings.apiKey y settings.apiBaseUrl (CRÍTICO para Grok)
        if (apiKeyToUse) {
          if (characterConfig.settings?.apiKey === '{{OPENAI_API_KEY}}' ||
              characterConfig.settings?.apiKey === '{{XAI_API_KEY}}' ||
              characterConfig.settings?.apiKey !== apiKeyToUse) {
            characterConfig.settings.apiKey = apiKeyToUse;
            needsUpdate = true;
            const keySource = process.env.XAI_API_KEY ? 'XAI_API_KEY' : 'OPENAI_API_KEY';
            console.log(`📝 Actualizando settings.apiKey con valor real de ${keySource}...`);
          }
        }
    
    if (process.env.OPENAI_API_BASE_URL) {
      if (characterConfig.settings?.apiBaseUrl === '{{OPENAI_API_BASE_URL}}' || 
          characterConfig.settings?.apiBaseUrl !== process.env.OPENAI_API_BASE_URL) {
        characterConfig.settings.apiBaseUrl = process.env.OPENAI_API_BASE_URL;
        needsUpdate = true;
        console.log("📝 Actualizando settings.apiBaseUrl con valor real de OPENAI_API_BASE_URL...");
      }
    }
    
    // Actualizar model - CRÍTICO para Grok
    if (characterConfig.settings) {
      // Verificar si se está usando Grok/XAI (priorizar XAI_API_KEY si existe)
      const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
      const isGrok = apiKey && apiKey.startsWith('xai-');
      
      if (isGrok) {
        // Modelos válidos de Grok (según documentación de xAI)
        const validGrokModels = ['grok-beta', 'grok-2-1212', 'grok-2-vision-1212', 'grok-3-latest'];
        const currentModel = characterConfig.settings.model || '';
        const isCurrentModelValidGrok = validGrokModels.includes(currentModel);
        
        // Determinar el modelo objetivo - priorizar XAI_MODEL si existe
        let targetModel = 'grok-beta'; // Modelo por defecto
        
        if (process.env.XAI_MODEL && validGrokModels.includes(process.env.XAI_MODEL)) {
          targetModel = process.env.XAI_MODEL;
          console.log(`📝 Usando XAI_MODEL=${targetModel} (variable específica de XAI)`);
        } else if (process.env.OPENAI_MODEL && validGrokModels.includes(process.env.OPENAI_MODEL)) {
          targetModel = process.env.OPENAI_MODEL;
          console.log(`📝 Usando OPENAI_MODEL=${targetModel} (variable genérica)`);
        }
        
        // SIEMPRE actualizar el modelo si es Grok - asegurar que nunca sea gpt-4o u otro modelo inválido
        // También forzar actualización si el modelo actual es cualquier modelo de OpenAI (gpt-*)
        const isOpenAIModel = currentModel && (currentModel.startsWith('gpt-') || currentModel === 'gpt-4o');
        if (characterConfig.settings.model !== targetModel || isOpenAIModel || (!isCurrentModelValidGrok && currentModel)) {
          characterConfig.settings.model = targetModel;
          needsUpdate = true;
          console.log(`📝 ⚠️ FORZANDO actualización de modelo para Grok: '${currentModel || '(no configurado)'}' → '${targetModel}'`);
          console.log(`   💡 Esto asegura que ElizaOS use un modelo válido de Grok en lugar de ${currentModel || 'gpt-4o'}`);
        } else {
          console.log(`   ✅ Modelo '${currentModel}' ya es válido para Grok`);
        }
        
        // IMPORTANTE: También actualizar OPENAI_MODEL en process.env para que ElizaOS lo use
        // Esto es crítico porque ElizaOS puede leer el modelo desde process.env en lugar del archivo JSON
        // FORZAR el modelo en process.env para asegurar que ElizaOS lo use
        process.env.OPENAI_MODEL = targetModel;
        process.env.XAI_MODEL = targetModel;
        // CRÍTICO: ElizaOS puede usar OPENAI_LARGE_MODEL y OPENAI_SMALL_MODEL que tienen valores por defecto de gpt-4o
        // Establecer ambos para Grok para evitar que ElizaOS use gpt-4o por defecto
        process.env.OPENAI_LARGE_MODEL = targetModel;
        process.env.OPENAI_SMALL_MODEL = targetModel;
        console.log(`📝 ⚠️ FORZANDO OPENAI_MODEL=${targetModel} en process.env (esto es CRÍTICO para que ElizaOS use el modelo correcto)`);
        console.log(`📝 Configurando XAI_MODEL=${targetModel} y OPENAI_MODEL=${targetModel} para máxima compatibilidad`);
        console.log(`📝 ⚠️ FORZANDO OPENAI_LARGE_MODEL=${targetModel} y OPENAI_SMALL_MODEL=${targetModel} (ElizaOS puede leer desde estas variables)`);
      } 
      // Si no es Grok pero hay modelo configurado, usarlo
      else if (process.env.XAI_MODEL || process.env.OPENAI_MODEL) {
        const targetModel = process.env.XAI_MODEL || process.env.OPENAI_MODEL;
        if (characterConfig.settings.model !== targetModel) {
          characterConfig.settings.model = targetModel;
          needsUpdate = true;
          console.log(`📝 Actualizando settings.model a '${targetModel}'...`);
        }
      }
    }
    
    if (characterUsesSolana) {
      // Actualizar SOLANA_PRIVATE_KEY en settings.secrets si está presente
      // Según la documentación de ElizaOS, puede usar SOLANA_PRIVATE_KEY o SOLANA_WALLET_PRIVATE_KEY
      if (process.env.SOLANA_PRIVATE_KEY) {
        const newValue = process.env.SOLANA_PRIVATE_KEY;
        
        // Asegurar que settings.secrets existe
        if (!characterConfig.settings.secrets) {
          characterConfig.settings.secrets = {};
        }
        
        // Actualizar SOLANA_PRIVATE_KEY
        const currentValue = characterConfig.settings.secrets.SOLANA_PRIVATE_KEY;
        if (currentValue === '{{SOLANA_PRIVATE_KEY}}' || currentValue !== newValue) {
          characterConfig.settings.secrets.SOLANA_PRIVATE_KEY = newValue;
          needsUpdate = true;
          console.log("📝 Actualizando archivo de personaje con SOLANA_PRIVATE_KEY convertida...");
          
          // Logging detallado para debugging
          try {
            const bs58Module = await import('bs58');
            const bs58 = bs58Module.default || bs58Module;
            const decoded = bs58.decode(newValue);
            console.log(`   📋 Valor guardado en JSON: ${newValue.substring(0, 10)}...${newValue.substring(newValue.length - 5)} (${newValue.length} chars, ${decoded.length} bytes decodificados)`);
            console.log(`   📋 Esto es lo que el plugin de Solana leerá desde settings.secrets.SOLANA_PRIVATE_KEY`);
          } catch (decodeError) {
            console.log(`   ⚠️ No se pudo decodificar para verificar (esto es solo para logging)`);
          }
        } else {
          console.log("   ✅ SOLANA_PRIVATE_KEY en JSON ya está actualizada");
        }
        
        // También actualizar SOLANA_WALLET_PRIVATE_KEY como alternativa (según docs de ElizaOS)
        const currentWalletKey = characterConfig.settings.secrets.SOLANA_WALLET_PRIVATE_KEY;
        if (!currentWalletKey || currentWalletKey === '{{SOLANA_WALLET_PRIVATE_KEY}}' || currentWalletKey !== newValue) {
          characterConfig.settings.secrets.SOLANA_WALLET_PRIVATE_KEY = newValue;
          needsUpdate = true;
          console.log("📝 Actualizando SOLANA_WALLET_PRIVATE_KEY en settings.secrets (alternativa soportada por ElizaOS)...");
        }
      }
      
      // Actualizar SOLANA_PUBLIC_KEY en settings.secrets si está presente
      if (characterConfig.settings?.secrets?.SOLANA_PUBLIC_KEY && process.env.SOLANA_PUBLIC_KEY) {
        const currentValue = characterConfig.settings.secrets.SOLANA_PUBLIC_KEY;
        if (currentValue === '{{SOLANA_PUBLIC_KEY}}' || currentValue !== process.env.SOLANA_PUBLIC_KEY) {
          characterConfig.settings.secrets.SOLANA_PUBLIC_KEY = process.env.SOLANA_PUBLIC_KEY;
          needsUpdate = true;
          console.log("📝 Actualizando archivo de personaje con SOLANA_PUBLIC_KEY...");
        }
      }
      
      // CRÍTICO: Agregar la dirección de wallet al bio para que el agente sepa cuál es su wallet
      if (process.env.SOLANA_PUBLIC_KEY) {
        const walletAddress = process.env.SOLANA_PUBLIC_KEY.trim();
        const walletInfoLine = `My Solana wallet address is: ${walletAddress}`;
        
        // Asegurar que bio existe y es un array
        if (!characterConfig.bio || !Array.isArray(characterConfig.bio)) {
          characterConfig.bio = [];
        }
        
        // Buscar si ya existe una línea con la dirección de wallet
        const walletInfoIndex = characterConfig.bio.findIndex(line => 
          line.includes('My Solana wallet address is:') || 
          line.includes('wallet address is:')
        );
        
        if (walletInfoIndex >= 0) {
          // Actualizar la línea existente si es diferente
          if (characterConfig.bio[walletInfoIndex] !== walletInfoLine) {
            characterConfig.bio[walletInfoIndex] = walletInfoLine;
            needsUpdate = true;
            console.log("📝 Actualizando dirección de wallet en bio del personaje...");
          }
        } else {
          // Agregar nueva línea al bio
          characterConfig.bio.push(walletInfoLine);
          needsUpdate = true;
          console.log("📝 Agregando dirección de wallet al bio del personaje para que el agente pueda responder preguntas sobre su wallet...");
        }
      }
    }
    
    // Actualizar otros secrets si están presentes
    // Actualizar OPENAI_API_KEY en settings.secrets (priorizar XAI_API_KEY si existe)
    // Reutilizar apiKeyToUse ya declarada arriba
    if (apiKeyToUse && characterConfig.settings?.secrets?.OPENAI_API_KEY) {
      const currentValue = characterConfig.settings.secrets.OPENAI_API_KEY;
      if (currentValue === '{{OPENAI_API_KEY}}' ||
          currentValue === '{{XAI_API_KEY}}' ||
          (currentValue !== apiKeyToUse)) {
        characterConfig.settings.secrets.OPENAI_API_KEY = apiKeyToUse;
        needsUpdate = true;
        const keySource = process.env.XAI_API_KEY ? 'XAI_API_KEY' : 'OPENAI_API_KEY';
        console.log(`📝 Actualizando secrets.OPENAI_API_KEY desde ${keySource}...`);
      }
    }
    
    if (process.env.OPENAI_API_BASE_URL && characterConfig.settings?.secrets?.OPENAI_API_BASE_URL) {
      if (characterConfig.settings.secrets.OPENAI_API_BASE_URL === '{{OPENAI_API_BASE_URL}}' || 
          characterConfig.settings.secrets.OPENAI_API_BASE_URL !== process.env.OPENAI_API_BASE_URL) {
        characterConfig.settings.secrets.OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;
        needsUpdate = true;
        console.log("📝 Actualizando secrets.OPENAI_API_BASE_URL...");
      }
    }
    
    if (characterUsesEvm) {
      if (!characterConfig.settings.secrets) {
        characterConfig.settings.secrets = {};
      }

      const bnbRpcUrl = cleanEnvVar(process.env.BNB_RPC_URL || '');
      if (bnbRpcUrl) {
        const current = characterConfig.settings.secrets.BNB_RPC_URL;
        if (!current || current === '{{BNB_RPC_URL}}' || current !== bnbRpcUrl) {
          characterConfig.settings.secrets.BNB_RPC_URL = bnbRpcUrl;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.BNB_RPC_URL...");
        }
      }

      const bnbWalletAddress = cleanEnvVar(process.env.BNB_WALLET_ADDRESS || '');
      if (bnbWalletAddress) {
        const current = characterConfig.settings.secrets.BNB_WALLET_ADDRESS;
        if (!current || current === '{{BNB_WALLET_ADDRESS}}' || current !== bnbWalletAddress) {
          characterConfig.settings.secrets.BNB_WALLET_ADDRESS = bnbWalletAddress;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.BNB_WALLET_ADDRESS...");
        }

        // Agregar/actualizar línea de wallet en el bio (BNB)
        const walletInfoLine = `My BNB wallet address is: ${bnbWalletAddress.trim()}`;
        if (!characterConfig.bio || !Array.isArray(characterConfig.bio)) {
          characterConfig.bio = [];
        }
        const walletInfoIndex = characterConfig.bio.findIndex(line =>
          typeof line === 'string' && line.includes('My BNB wallet address is:')
        );
        if (walletInfoIndex >= 0) {
          if (characterConfig.bio[walletInfoIndex] !== walletInfoLine) {
            characterConfig.bio[walletInfoIndex] = walletInfoLine;
            needsUpdate = true;
            console.log("📝 Actualizando dirección de wallet (BNB) en bio del personaje...");
          }
        } else {
          characterConfig.bio.push(walletInfoLine);
          needsUpdate = true;
          console.log("📝 Agregando dirección de wallet (BNB) al bio del personaje...");
        }
      }

      const bnbPrivateKey = cleanEnvVar(process.env.BNB_PRIVATE_KEY || '');
      if (bnbPrivateKey) {
        const current = characterConfig.settings.secrets.BNB_PRIVATE_KEY;
        if (!current || current === '{{BNB_PRIVATE_KEY}}' || current !== bnbPrivateKey) {
          characterConfig.settings.secrets.BNB_PRIVATE_KEY = bnbPrivateKey;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.BNB_PRIVATE_KEY...");
        }
      }

      const dexscreenerKey = cleanEnvVar(process.env.DEXSCREENER_API_KEY || '');
      if (dexscreenerKey) {
        const current = characterConfig.settings.secrets.DEXSCREENER_API_KEY;
        if (!current || current === '{{DEXSCREENER_API_KEY}}' || current !== dexscreenerKey) {
          characterConfig.settings.secrets.DEXSCREENER_API_KEY = dexscreenerKey;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.DEXSCREENER_API_KEY...");
        }
      }
    }

    if (characterUsesSolana) {
      const birdeyeKey = cleanEnvVar(process.env.BIRDEYE_API_KEY || '');
      const heliusKey = cleanEnvVar(process.env.HELIUS_API_KEY || '');

      // SOL_ADDRESS (requerido por @elizaos/plugin-solana) - asegurar valor por defecto correcto
      let solAddress = cleanEnvVar(process.env.SOL_ADDRESS || '');
      const defaultSolAddress = 'So11111111111111111111111111111111111111112';
      if (!solAddress) {
        process.env.SOL_ADDRESS = defaultSolAddress;
        solAddress = defaultSolAddress;
      } else if (solAddress !== defaultSolAddress) {
        process.env.SOL_ADDRESS = defaultSolAddress;
        solAddress = defaultSolAddress;
      }

      // SLIPPAGE (requerido por @elizaos/plugin-solana)
      let slippage = cleanEnvVar(process.env.SLIPPAGE || '');
      const defaultSlippage = '100';
      if (!slippage) {
        process.env.SLIPPAGE = defaultSlippage;
        slippage = defaultSlippage;
      }

      // Actualizar BIRDEYE_API_KEY en settings.secrets (recomendado por @elizaos/plugin-solana)
      if (birdeyeKey) {
        const currentBirdeyeKey = characterConfig.settings.secrets.BIRDEYE_API_KEY;
        if (!currentBirdeyeKey ||
            currentBirdeyeKey === '{{BIRDEYE_API_KEY}}' ||
            currentBirdeyeKey !== birdeyeKey) {
          characterConfig.settings.secrets.BIRDEYE_API_KEY = birdeyeKey;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.BIRDEYE_API_KEY (plugin Solana)...");
        }
      } else {
        console.log("⚠️ BIRDEYE_API_KEY no configurada - El plugin Solana tendrá funcionalidad limitada sin datos de mercado");
      }

      // Actualizar HELIUS_API_KEY en settings.secrets si está presente
      if (heliusKey) {
        const currentHeliusKey = characterConfig.settings.secrets.HELIUS_API_KEY;
        if (!currentHeliusKey ||
            currentHeliusKey === '{{HELIUS_API_KEY}}' ||
            currentHeliusKey !== heliusKey) {
          characterConfig.settings.secrets.HELIUS_API_KEY = heliusKey;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.HELIUS_API_KEY...");
        }
      }

      // Actualizar SOL_ADDRESS en settings.secrets
      if (solAddress) {
        const currentSolAddress = characterConfig.settings.secrets.SOL_ADDRESS;
        if (!currentSolAddress ||
            currentSolAddress === '{{SOL_ADDRESS}}' ||
            currentSolAddress !== solAddress) {
          characterConfig.settings.secrets.SOL_ADDRESS = solAddress;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.SOL_ADDRESS (plugin Solana)...");
        }
      }

      // Actualizar SLIPPAGE en settings.secrets
      if (slippage) {
        const currentSlippage = characterConfig.settings.secrets.SLIPPAGE;
        if (!currentSlippage ||
            currentSlippage === '{{SLIPPAGE}}' ||
            currentSlippage !== slippage) {
          characterConfig.settings.secrets.SLIPPAGE = slippage;
          needsUpdate = true;
          console.log("📝 Actualizando secrets.SLIPPAGE (plugin Solana)...");
        }
      }
    }
    
    if (needsUpdate) {
      fs.writeFileSync(characterPath, JSON.stringify(characterConfig, null, 2), 'utf-8');
      console.log("✅ Archivo de personaje actualizado correctamente con valores reales");
      console.log(`   📋 Modelo final en archivo: ${characterConfig.settings?.model || 'NO CONFIGURADO'}`);
      console.log(`   📋 apiKey en archivo: ${characterConfig.settings?.apiKey ? characterConfig.settings.apiKey.substring(0, 10) + '...' : 'NO CONFIGURADO'}`);
      console.log(`   📋 apiBaseUrl en archivo: ${characterConfig.settings?.apiBaseUrl || 'NO CONFIGURADO'}\n`);
    } else {
      console.log("ℹ️ Archivo de personaje ya tiene los valores correctos");
      console.log(`   📋 Modelo actual en archivo: ${characterConfig.settings?.model || 'NO CONFIGURADO'}\n`);
    }
  } catch (charUpdateError) {
    console.log(`⚠️ No se pudo actualizar el archivo de personaje: ${charUpdateError.message}`);
    console.log("   Continuando con variables de entorno solamente...\n");
  }
  
  // VERIFICACIÓN FINAL: Asegurar que el archivo JSON tiene el valor correcto
  try {
    const fs = await import('fs');
    // Normalizar el nombre del personaje: remover .json si está presente
    let verifyCharacterNameRaw = process.env.ELIZA_CHARACTER_NAME || 'niya-agent';
    const verifyCharacterName = verifyCharacterNameRaw.endsWith('.json') 
      ? verifyCharacterNameRaw.slice(0, -5) 
      : verifyCharacterNameRaw;
    const normalizedVerifyCharacterName = verifyCharacterName === 'nyako-agent' ? 'niya-agent' : verifyCharacterName;
    const characterFilePath = `./characters/${normalizedVerifyCharacterName}.json`;
    const characterConfig = JSON.parse(fs.readFileSync(characterFilePath, 'utf-8'));

    const plugins = Array.isArray(characterConfig?.plugins) ? characterConfig.plugins : [];
    const verifySolana = plugins.includes('@elizaos/plugin-solana');
    const verifyEvm = plugins.includes('@elizaos/plugin-evm');

    if (verifySolana) {
      const jsonKey = characterConfig.settings?.secrets?.SOLANA_PRIVATE_KEY;
      if (jsonKey && process.env.SOLANA_PRIVATE_KEY) {
        if (jsonKey === process.env.SOLANA_PRIVATE_KEY) {
          console.log("✅ VERIFICACIÓN FINAL: (Solana) El archivo JSON tiene la misma clave que process.env");
          try {
            const bs58Module = await import('bs58');
            const bs58 = bs58Module.default || bs58Module;
            const decoded = bs58.decode(jsonKey);
            console.log(`   📋 Valor en JSON: ${decoded.length} bytes decodificados (${jsonKey.length} chars en base58)`);
            console.log(`   📋 Esto es exactamente lo que el plugin de Solana leerá desde settings.secrets.SOLANA_PRIVATE_KEY`);
          } catch (e) {
            // Ignorar error de decodificación para logging
          }
        } else {
          console.log("⚠️ ADVERTENCIA: (Solana) El archivo JSON tiene una clave diferente a process.env");
          console.log(`   📋 JSON: ${jsonKey.substring(0, 10)}... (${jsonKey.length} chars)`);
          console.log(`   📋 ENV:  ${process.env.SOLANA_PRIVATE_KEY.substring(0, 10)}... (${process.env.SOLANA_PRIVATE_KEY.length} chars)`);
        }
      }
    }

    if (verifyEvm) {
      const jsonWallet = characterConfig.settings?.secrets?.BNB_WALLET_ADDRESS;
      const jsonPriv = characterConfig.settings?.secrets?.BNB_PRIVATE_KEY;

      if (jsonWallet && process.env.BNB_WALLET_ADDRESS) {
        if (jsonWallet === process.env.BNB_WALLET_ADDRESS) {
          console.log("✅ VERIFICACIÓN FINAL: (EVM/BNB) BNB_WALLET_ADDRESS en JSON coincide con process.env");
        } else {
          console.log("⚠️ ADVERTENCIA: (EVM/BNB) BNB_WALLET_ADDRESS en JSON no coincide con process.env");
        }
      }

      if (jsonPriv && process.env.BNB_PRIVATE_KEY) {
        if (jsonPriv === process.env.BNB_PRIVATE_KEY) {
          console.log("✅ VERIFICACIÓN FINAL: (EVM/BNB) BNB_PRIVATE_KEY en JSON coincide con process.env");
        } else {
          console.log("⚠️ ADVERTENCIA: (EVM/BNB) BNB_PRIVATE_KEY en JSON no coincide con process.env");
        }
      }
    }
  } catch (verifyError) {
    // Ignorar errores de verificación
  }
  
  // CRÍTICO: Asegurar que OPENAI_MODEL esté configurado correctamente antes de iniciar ElizaOS
  // Esto es especialmente importante para Grok, ya que ElizaOS puede usar un valor por defecto de gpt-4o
  if (process.env.XAI_API_KEY || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('xai-'))) {
    // Es Grok, asegurar que OPENAI_MODEL sea un modelo válido de Grok
    const validGrokModels = ['grok-beta', 'grok-2-1212', 'grok-2-vision-1212', 'grok-3-latest'];
    const currentModel = process.env.OPENAI_MODEL || process.env.XAI_MODEL;
    
    // Si OPENAI_MODEL no está configurado o no es un modelo válido de Grok, forzar grok-beta
    if (!currentModel || !validGrokModels.includes(currentModel)) {
      const defaultGrokModel = process.env.XAI_MODEL && validGrokModels.includes(process.env.XAI_MODEL) 
        ? process.env.XAI_MODEL 
        : 'grok-beta';
      
      process.env.OPENAI_MODEL = defaultGrokModel;
      if (!process.env.XAI_MODEL) {
        process.env.XAI_MODEL = defaultGrokModel;
      }
      // CRÍTICO: También establecer OPENAI_LARGE_MODEL y OPENAI_SMALL_MODEL para Grok
      process.env.OPENAI_LARGE_MODEL = defaultGrokModel;
      process.env.OPENAI_SMALL_MODEL = defaultGrokModel;
      console.log(`⚠️  FORZANDO OPENAI_MODEL=${defaultGrokModel} para Grok (para evitar que ElizaOS use gpt-4o por defecto)`);
      console.log(`⚠️  FORZANDO OPENAI_LARGE_MODEL=${defaultGrokModel} y OPENAI_SMALL_MODEL=${defaultGrokModel} para Grok`);
    } else {
      // Asegurar que tanto XAI_MODEL como OPENAI_MODEL estén configurados
      process.env.OPENAI_MODEL = currentModel;
      if (process.env.XAI_MODEL && process.env.XAI_MODEL !== currentModel) {
        process.env.XAI_MODEL = currentModel;
      }
      // CRÍTICO: También establecer OPENAI_LARGE_MODEL y OPENAI_SMALL_MODEL para Grok
      process.env.OPENAI_LARGE_MODEL = currentModel;
      process.env.OPENAI_SMALL_MODEL = currentModel;
      console.log(`📝 ⚠️ FORZANDO OPENAI_LARGE_MODEL=${currentModel} y OPENAI_SMALL_MODEL=${currentModel} para Grok`);
    }
  }
  
  // CRÍTICO: Configurar trust proxy para Railway (necesario para rate limiting)
  // Railway está detrás de un proxy, Express necesita confiar en los headers X-Forwarded-For
  if (!process.env.TRUST_PROXY) {
    process.env.TRUST_PROXY = 'true';
    console.log("🔧 Configurando TRUST_PROXY=true para Railway (necesario para evitar errores de rate limiting)");
  } else {
    console.log(`✅ TRUST_PROXY ya configurado: ${process.env.TRUST_PROXY}`);
  }
  
  // Después de validar y convertir las variables, ejecutar elizaos start
  console.log("🚀 Iniciando ElizaOS con variables de entorno validadas...\n");
  
  // Log final de variables críticas para debugging
  console.log("📋 Variables finales que se pasarán a ElizaOS:");
  if (process.env.XAI_API_KEY) {
    console.log(`   XAI_API_KEY: ${process.env.XAI_API_KEY.substring(0, 10)}... (variables específicas de XAI detectadas)`);
    console.log(`   XAI_MODEL: ${process.env.XAI_MODEL || 'NO CONFIGURADA'}`);
    console.log(`   → Mapeadas a OPENAI_API_KEY y OPENAI_MODEL para compatibilidad`);
  }
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NO CONFIGURADA'}`);
  console.log(`   OPENAI_API_BASE_URL: ${process.env.OPENAI_API_BASE_URL || 'NO CONFIGURADA'}`);
  console.log(`   OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || 'NO CONFIGURADA'}`);
  console.log(`   OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'NO CONFIGURADA'} ⚠️ ESTE DEBE SER EL MODELO QUE ELIZAOS USARÁ`);
  console.log(`   OPENAI_LARGE_MODEL: ${process.env.OPENAI_LARGE_MODEL || 'NO CONFIGURADA'} ⚠️ ElizaOS puede leer desde aquí`);
  console.log(`   OPENAI_SMALL_MODEL: ${process.env.OPENAI_SMALL_MODEL || 'NO CONFIGURADA'} ⚠️ ElizaOS puede leer desde aquí`);
  console.log(`   BNB_RPC_URL: ${process.env.BNB_RPC_URL || 'NO CONFIGURADA'}`);
  console.log(`   BNB_WALLET_ADDRESS: ${process.env.BNB_WALLET_ADDRESS || 'NO CONFIGURADA'}`);
  console.log(`   BNB_PRIVATE_KEY: ${process.env.BNB_PRIVATE_KEY ? process.env.BNB_PRIVATE_KEY.substring(0, 10) + '...' + ` (${process.env.BNB_PRIVATE_KEY.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`   DEXSCREENER_API_KEY: ${process.env.DEXSCREENER_API_KEY ? process.env.DEXSCREENER_API_KEY.substring(0, 8) + '...' : 'NO CONFIGURADA'}`);
  console.log(`   SOLANA_PRIVATE_KEY: ${process.env.SOLANA_PRIVATE_KEY ? process.env.SOLANA_PRIVATE_KEY.substring(0, 10) + '...' + ` (${process.env.SOLANA_PRIVATE_KEY.length} chars)` : 'NO CONFIGURADA'}`);
  console.log(`   SOLANA_WALLET_PRIVATE_KEY: ${process.env.SOLANA_WALLET_PRIVATE_KEY ? process.env.SOLANA_WALLET_PRIVATE_KEY.substring(0, 10) + '...' + ` (${process.env.SOLANA_WALLET_PRIVATE_KEY.length} chars) - Alternativa soportada` : 'NO CONFIGURADA'}`);
  console.log(`   SOLANA_PUBLIC_KEY: ${process.env.SOLANA_PUBLIC_KEY || 'NO CONFIGURADA'}`);
  console.log(`   TRUST_PROXY: ${process.env.TRUST_PROXY || 'NO CONFIGURADA'} ⚠️ Necesario para Railway\n`);
  
  const { spawn } = await import('child_process');
  
  // Ejecutar elizaos start usando npx (que encontrará el ejecutable correcto)
  // Pasar las variables de entorno actualizadas (incluyendo SOLANA_PRIVATE_KEY convertida)
  // Usar el personaje seleccionado mediante variable de entorno
  // Normalizar el nombre del personaje: remover .json si está presente
  let finalCharacterNameRaw = process.env.ELIZA_CHARACTER_NAME || 'niya-agent';
  const finalCharacterName = finalCharacterNameRaw.endsWith('.json') 
    ? finalCharacterNameRaw.slice(0, -5) 
    : finalCharacterNameRaw;
  const normalizedFinalCharacterName = finalCharacterName === 'nyako-agent' ? 'niya-agent' : finalCharacterName;
  const finalCharacterFilePath = `./characters/${normalizedFinalCharacterName}.json`;
  console.log(`🚀 Iniciando ElizaOS con personaje: ${normalizedFinalCharacterName}`);
  const elizaosProcess = spawn('npx', ['-y', 'elizaos', 'start', '--character', finalCharacterFilePath], {
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

