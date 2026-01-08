# Investigación: Error "bad secret key size" en Solana

## Problema
El error `Error decoding private key: (e=bad secret key size)` persiste a pesar de que:
- La clave tiene 64 bytes (formato correcto)
- La clave funciona correctamente con `Keypair.fromSecretKey()` 
- El script la convierte automáticamente a 32 bytes

## Posibles Causas

### 1. Orden de lectura de variables de entorno
El plugin de Solana podría estar leyendo `SOLANA_PRIVATE_KEY` directamente desde las variables de entorno de Railway **antes** de que nuestro script la modifique.

**Solución**: Ya estamos actualizando `process.env` y pasándolo al proceso hijo, pero necesitamos asegurarnos de que el archivo de personaje también tenga el valor correcto.

### 2. Formato esperado por el plugin
El plugin podría estar usando `Keypair.fromSeed()` (espera 32 bytes) cuando debería usar `Keypair.fromSecretKey()` (espera 64 bytes), o viceversa.

**Solución**: 
- Probar con la clave de 64 bytes directamente (sin convertir)
- Si falla, probar con la versión de 32 bytes (seed)

### 3. Lectura desde `settings.secrets`
El plugin podría estar leyendo desde `settings.secrets.SOLANA_PRIVATE_KEY` en el archivo de personaje en lugar de las variables de entorno.

**Solución**: Ya estamos actualizando el archivo de personaje con los valores reales, pero necesitamos verificar que se guarde antes de que ElizaOS lo lea.

## Estrategias de Solución

### Estrategia 1: Usar clave de 64 bytes directamente (ACTUAL)
- La clave de 64 bytes funciona con `Keypair.fromSecretKey()`
- Mantener la clave tal como está
- Si falla, el script proporciona la versión de 32 bytes como alternativa

### Estrategia 2: Usar clave de 32 bytes (seed)
- Convertir automáticamente a 32 bytes
- Usar `Keypair.fromSeed()` si es necesario

### Estrategia 3: Verificar orden de inicialización
- Asegurar que el archivo de personaje se actualice ANTES de que ElizaOS lo lea
- Verificar que las variables de entorno se pasen correctamente al proceso hijo

## Próximos Pasos

1. ✅ Actualizado para usar clave de 64 bytes directamente
2. ⏳ Verificar si el error persiste después del próximo despliegue
3. ⏳ Si persiste, probar con la versión de 32 bytes
4. ⏳ Revisar logs para ver desde dónde se lee la clave (env vars vs character file)

## Formato de Clave Correcto

### Clave de 64 bytes (formato completo)
- Primeros 32 bytes: clave privada/seed
- Últimos 32 bytes: clave pública
- Se usa con: `Keypair.fromSecretKey(decoded)`
- Longitud base58: ~88 caracteres

### Clave de 32 bytes (solo seed)
- Solo los primeros 32 bytes de la clave privada
- Se usa con: `Keypair.fromSeed(decoded)`
- Longitud base58: ~44 caracteres

## Código de Verificación

El script actual verifica:
1. ✅ Formato base58 válido
2. ✅ Longitud correcta (32 o 64 bytes después de decodificar)
3. ✅ Clave pública derivada coincide con `SOLANA_PUBLIC_KEY`
4. ✅ Actualiza `process.env` y el archivo de personaje

