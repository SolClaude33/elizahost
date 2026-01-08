# Solución para el Error "bad secret key size" de Solana

## Problema

El plugin de Solana de ElizaOS está reportando el error:
```
Error decoding private key: (e=bad secret key size)
```

Esto ocurre porque el plugin de Solana puede esperar diferentes formatos de clave privada:
- **32 bytes (seed)**: Solo la clave privada
- **64 bytes**: Clave privada (32 bytes) + clave pública (32 bytes) concatenadas

## Solución Automática

El script `check-env.js` ahora automáticamente:
1. Detecta si tu clave tiene 64 bytes
2. La convierte a 32 bytes (seed) por defecto
3. Actualiza el archivo `amica-agent.json` con la clave convertida

## Si el Error Persiste

Si el error "bad secret key size" persiste después de la conversión automática, prueba cambiar entre los formatos:

### Opción 1: Usar formato de 64 bytes

En Railway, agrega esta variable de entorno:
```
SOLANA_USE_64_BYTES=true
```

Esto hará que el script use la clave completa de 64 bytes en lugar de convertirla a 32 bytes.

### Opción 2: Verificar el formato actual

Revisa los logs del script `check-env.js` para ver:
- Qué formato se está usando actualmente (32 o 64 bytes)
- Si la conversión fue exitosa
- Qué valor exacto se está guardando en el archivo JSON

## Verificación

El script ahora incluye diagnóstico detallado que muestra:
1. ✅ Si la clave de 64 bytes funciona con `Keypair.fromSecretKey()`
2. ✅ Si la clave de 32 bytes funciona con `Keypair.fromSeed()`
3. ✅ Qué valor exacto se está guardando en `settings.secrets.SOLANA_PRIVATE_KEY`

## Formato de la Clave

La clave privada debe estar en formato **base58**, que es el formato estándar exportado por wallets como Phantom o Solflare.

Ejemplos de formatos válidos:
- ✅ `5x5TwWHVMm...` (base58, 88 caracteres = 64 bytes)
- ✅ `HfPTfrSjPN...` (base58, 44 caracteres = 32 bytes)

## Notas Técnicas

Según la documentación oficial de ElizaOS, el plugin de Solana puede leer la clave desde:
1. `process.env.SOLANA_PRIVATE_KEY` (variable de entorno) ✅ **MÉTODO PRINCIPAL**
2. `process.env.SOLANA_WALLET_PRIVATE_KEY` (variable de entorno alternativa) ✅ **ALTERNATIVA**
3. `settings.secrets.SOLANA_PRIVATE_KEY` (archivo JSON del personaje)
4. `settings.secrets.SOLANA_WALLET_PRIVATE_KEY` (archivo JSON del personaje, alternativa)

El script actualiza **todos estos lugares** para asegurar máxima compatibilidad:
- ✅ `process.env.SOLANA_PRIVATE_KEY` (principal)
- ✅ `process.env.SOLANA_WALLET_PRIVATE_KEY` (alternativa)
- ✅ `settings.secrets.SOLANA_PRIVATE_KEY` (en JSON)
- ✅ `settings.secrets.SOLANA_WALLET_PRIVATE_KEY` (en JSON, alternativa)

## Logs de Diagnóstico

Los logs ahora incluyen:
```
🔍 DIAGNÓSTICO: Probando diferentes métodos de decodificación:
   ✅ 64 bytes con Keypair.fromSecretKey(): OK
   ✅ 32 bytes (seed) con Keypair.fromSeed(): OK
   💡 VALOR ACTUAL configurado: 32 bytes (seed)
```

Esto te ayuda a entender qué formato está usando el script y cuál debería funcionar.

## Próximos Pasos

1. **Revisa los logs** después de desplegar para ver el diagnóstico
2. **Si el error persiste con 32 bytes**, configura `SOLANA_USE_64_BYTES=true` en Railway
3. **Si el error persiste con 64 bytes**, verifica que la clave pública coincida con la derivada de la privada

## Solución Inmediata: Probar con 64 Bytes

Según los logs, el script está usando **32 bytes (seed)** por defecto, pero el error persiste. 

**ACCIÓN REQUERIDA**: En Railway, agrega esta variable de entorno:
```
SOLANA_USE_64_BYTES=true
```

Esto hará que el script use el formato de **64 bytes** (formato completo) que es el que viene directamente de tu wallet. Los logs muestran que este formato funciona correctamente con `Keypair.fromSecretKey()`.

