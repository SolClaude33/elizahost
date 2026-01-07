// Script para extraer solo los primeros 32 bytes de una clave privada de Solana
// Útil cuando tienes una clave de 64 bytes (privada + pública) y necesitas solo la privada

import bs58 from 'bs58';

const privateKeyBase58 = process.env.SOLANA_PRIVATE_KEY;

if (!privateKeyBase58) {
  console.error('❌ SOLANA_PRIVATE_KEY no está configurada');
  process.exit(1);
}

try {
  // Decodificar la clave base58
  const decoded = bs58.decode(privateKeyBase58.trim());
  
  console.log(`📊 Clave original decodificada: ${decoded.length} bytes`);
  
  if (decoded.length === 64) {
    // Extraer solo los primeros 32 bytes (la clave privada)
    const privateKeyBytes = decoded.slice(0, 32);
    
    // Codificar de nuevo a base58
    const privateKeyBase58Only = bs58.encode(privateKeyBytes);
    
    console.log('\n✅ Clave privada extraída (solo 32 bytes):');
    console.log(privateKeyBase58Only);
    console.log('\n📋 Instrucciones:');
    console.log('1. Copia la clave de arriba');
    console.log('2. En Railway, actualiza SOLANA_PRIVATE_KEY con esta nueva clave');
    console.log('3. La nueva clave tiene solo los primeros 32 bytes (clave privada pura)');
    
  } else if (decoded.length === 32) {
    console.log('\n✅ La clave ya tiene solo 32 bytes (solo privada)');
    console.log('No es necesario extraer nada, la clave es correcta');
  } else {
    console.error(`\n❌ Tamaño inesperado: ${decoded.length} bytes`);
    console.error('Esperado: 32 bytes (solo privada) o 64 bytes (privada + pública)');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error al procesar la clave:', error.message);
  process.exit(1);
}

