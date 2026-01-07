// Script para verificar variables de entorno antes de iniciar
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

// Validar OpenAI API Key
const openAIKey = (process.env.OPENAI_API_KEY || '').trim();
if (openAIKey) {
  if (openAIKey.startsWith('"') || openAIKey.endsWith('"')) {
    console.log("   ⚠️ OPENAI_API_KEY: Tiene comillas alrededor - PROBLEMA DETECTADO");
  } else if (!openAIKey.startsWith('xai-')) {
    console.log("   ⚠️ OPENAI_API_KEY: No empieza con 'xai-' - Puede ser inválida");
  } else {
    console.log("   ✅ OPENAI_API_KEY: Formato parece correcto (empieza con 'xai-')");
  }
  // Verificar caracteres invisibles
  if (openAIKey !== openAIKey.trim()) {
    console.log("   ⚠️ OPENAI_API_KEY: Tiene espacios en blanco al inicio/final");
  }
}

// Validar Solana Private Key
const solanaKey = (process.env.SOLANA_PRIVATE_KEY || '').trim();
if (solanaKey) {
  if (solanaKey.startsWith('"') || solanaKey.endsWith('"')) {
    console.log("   ⚠️ SOLANA_PRIVATE_KEY: Tiene comillas alrededor - PROBLEMA DETECTADO");
  }
  
  // Validar base58
  const cleanKey = solanaKey.replace(/"/g, '');
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
  }
  
  // Validar longitud
  const keyLength = cleanKey.length;
  // Una clave privada de Solana en base58 puede ser:
  // - 32 bytes (64 caracteres hex) = ~44 caracteres base58 (solo privada)
  // - 64 bytes (128 caracteres hex) = ~88 caracteres base58 (privada + pública)
  // Pero también puede variar por padding
  if (keyLength < 40 || keyLength > 100) {
    console.log(`   ⚠️ SOLANA_PRIVATE_KEY: Longitud inusual (${keyLength} chars). Esperado: 40-100 chars`);
  } else {
    console.log(`   ✅ SOLANA_PRIVATE_KEY: Longitud parece correcta (${keyLength} chars)`);
  }
}

// Validar Solana Public Key
const solanaPubKey = (process.env.SOLANA_PUBLIC_KEY || '').trim();
if (solanaPubKey) {
  const cleanPubKey = solanaPubKey.replace(/"/g, '');
  if (!isValidBase58(cleanPubKey)) {
    console.log("   ❌ SOLANA_PUBLIC_KEY: Contiene caracteres inválidos para base58");
  } else if (cleanPubKey.length !== 44) {
    console.log(`   ⚠️ SOLANA_PUBLIC_KEY: Longitud inusual (${cleanPubKey.length} chars). Esperado: 44 chars`);
  } else {
    console.log("   ✅ SOLANA_PUBLIC_KEY: Formato y longitud correctos");
  }
}

console.log("\n");

