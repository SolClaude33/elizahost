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

console.log("\n🔍 Debug - Valores completos (primeros 50 chars):");
console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY?.substring(0, 50) || 'undefined'}...`);
console.log(`   OPENAI_API_BASE_URL: ${process.env.OPENAI_API_BASE_URL || 'undefined'}`);
console.log(`   SOLANA_PRIVATE_KEY length: ${process.env.SOLANA_PRIVATE_KEY?.length || 0}`);
console.log(`   SOLANA_PRIVATE_KEY starts with: ${process.env.SOLANA_PRIVATE_KEY?.substring(0, 10) || 'undefined'}...`);

// Verificar si hay comillas alrededor de los valores
const openAIKey = process.env.OPENAI_API_KEY || '';
if (openAIKey.startsWith('"') || openAIKey.endsWith('"')) {
  console.log("\n⚠️ ADVERTENCIA: OPENAI_API_KEY tiene comillas alrededor!");
  console.log(`   Valor actual: "${openAIKey}"`);
  console.log(`   Debería ser: ${openAIKey.replace(/^"|"$/g, '')}`);
}

const solanaKey = process.env.SOLANA_PRIVATE_KEY || '';
if (solanaKey.startsWith('"') || solanaKey.endsWith('"')) {
  console.log("\n⚠️ ADVERTENCIA: SOLANA_PRIVATE_KEY tiene comillas alrededor!");
  console.log(`   Longitud actual: ${solanaKey.length}`);
}

console.log("\n");

