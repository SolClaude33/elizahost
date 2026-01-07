// Script para verificar que la clave privada corresponde a la clave pública
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

const privateKeyBase58 = process.env.SOLANA_PRIVATE_KEY?.trim();
const publicKeyBase58 = process.env.SOLANA_PUBLIC_KEY?.trim();

if (!privateKeyBase58 || !publicKeyBase58) {
  console.error('❌ SOLANA_PRIVATE_KEY o SOLANA_PUBLIC_KEY no están configuradas');
  process.exit(1);
}

try {
  // Decodificar la clave privada
  const privateKeyBytes = bs58.decode(privateKeyBase58);
  
  if (privateKeyBytes.length !== 32) {
    console.error(`❌ La clave privada tiene ${privateKeyBytes.length} bytes, esperado 32 bytes`);
    process.exit(1);
  }
  
  // Crear un Keypair desde la clave privada
  const keypair = Keypair.fromSecretKey(privateKeyBytes);
  
  // Obtener la clave pública derivada
  const derivedPublicKey = keypair.publicKey.toBase58();
  
  console.log('\n🔍 Verificación de Claves Solana:\n');
  console.log(`📋 Clave pública configurada:  ${publicKeyBase58}`);
  console.log(`📋 Clave pública derivada:     ${derivedPublicKey}`);
  
  if (derivedPublicKey === publicKeyBase58) {
    console.log('\n✅ ¡PERFECTO! La clave privada corresponde a la clave pública');
    console.log('   Las claves están correctamente configuradas.');
  } else {
    console.log('\n❌ PROBLEMA: La clave privada NO corresponde a la clave pública');
    console.log('\n💡 SOLUCIÓN:');
    console.log('   Actualiza SOLANA_PUBLIC_KEY en Railway con:');
    console.log(`   ${derivedPublicKey}`);
    console.log('\n   Esta es la clave pública correcta que corresponde a tu clave privada.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error al verificar las claves:', error.message);
  if (error.message.includes('Non-base58 character')) {
    console.error('\n💡 La clave privada contiene caracteres inválidos para base58');
    console.error('   Asegúrate de que no tenga espacios, saltos de línea o caracteres especiales');
  }
  process.exit(1);
}

