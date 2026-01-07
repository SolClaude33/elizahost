// Script para convertir SOLANA_PRIVATE_KEY de formato array a base58
import bs58 from 'bs58';

const keyArray = [247,144,116,252,29,133,34,7,175,208,249,42,148,14,66,177,184,51,234,237,234,3,156,152,206,39,156,212,169,84,175,173,151,122,241,6,151,95,43,161,174,50,166,73,85,43,32,153,224,86,71,177,157,170,194,176,143,117,93,216,155,228,109,163];

try {
  // Convertir array a Buffer
  const keyBuffer = Buffer.from(keyArray);
  
  // Convertir a base58
  const base58Key = bs58.encode(keyBuffer);
  
  console.log('\n✅ Clave privada convertida a base58:');
  console.log(base58Key);
  console.log('\n📋 Copia esta línea completa para Railway:');
  console.log(`SOLANA_PRIVATE_KEY=${base58Key}`);
  console.log('\n⚠️ IMPORTANTE: No compartas esta clave privada públicamente\n');
} catch (error) {
  console.error('❌ Error al convertir:', error.message);
}

