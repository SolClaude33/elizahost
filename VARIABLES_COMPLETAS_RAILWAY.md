# ✅ Lista Completa de Variables para Railway

## 🚨 Variables Críticas (OBLIGATORIAS)

Estas variables **DEBEN** estar configuradas en Railway para que el agente funcione:

### 1. Configuración Base
```env
DAEMON_PROCESS=true
TRUST_PROXY=true
PORT=3000
```

### 2. API de Grok/XAI
```env
# OPCIÓN A: Variables específicas de XAI (RECOMENDADO)
XAI_API_KEY=xai-tu_clave_api_grok_aqui
XAI_MODEL=grok-3-latest

# OPCIÓN B: Variables genéricas (compatibilidad)
OPENAI_API_KEY=xai-tu_clave_api_grok_aqui
OPENAI_API_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-3-latest
```

**Nota:** El script `check-env.js` mapea automáticamente `XAI_API_KEY` a `OPENAI_API_KEY` si usas la opción A.

### 3. Solana/Blockchain
```env
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_HELIUS_API_KEY
SOLANA_PUBLIC_KEY=tu_wallet_publica_44_caracteres
SOLANA_PRIVATE_KEY=tu_wallet_privada_base58
HELIUS_API_KEY=tu_helius_api_key

# REQUERIDAS por @elizaos/plugin-solana
SOL_ADDRESS=So11111111111111111111111111111111111111112
SLIPPAGE=100
```

**Nota:** Si `SOL_ADDRESS` y `SLIPPAGE` no están configuradas, el script las configura automáticamente con valores por defecto, pero es mejor configurarlas manualmente.

---

## ⚠️ Variables Recomendadas (Opcionales pero Importantes)

### Birdeye API (Para datos de mercado)
```env
BIRDEYE_API_KEY=tu_birdeye_api_key
```
- **Dónde obtener:** https://birdeye.so/
- **Sin esto:** El plugin funcionará pero con funcionalidad limitada (sin datos de mercado en tiempo real)

---

## 🎤 Variables Opcionales (Solo si las necesitas)

### Twitter/X Integration
```env
TWITTER_API_KEY=tu_api_key
TWITTER_API_SECRET_KEY=tu_api_secret
TWITTER_ACCESS_TOKEN=tu_access_token
TWITTER_ACCESS_TOKEN_SECRET=tu_access_secret
TWITTER_BEARER_TOKEN=tu_bearer_token
```
**Sin esto:** El plugin de Twitter no funcionará (no crítico para chat básico)

### ElevenLabs (Voz)
```env
ELEVENLABS_API_KEY=tu_elevenlabs_api_key
```
**Nota:** Solo necesario si tienes `@elizaos/plugin-elevenlabs` en tus plugins. Tu personaje Nyako NO lo tiene configurado, así que probablemente no lo necesites.

### Selección de Personaje
```env
ELIZA_CHARACTER_NAME=nyako-agent
```
**Valores posibles:**
- `amica-agent` (por defecto)
- `nyako-agent`

---

## 📋 Checklist de Configuración en Railway

### ✅ Variables Críticas (Agregar/A-Verificar)

- [ ] `XAI_API_KEY` o `OPENAI_API_KEY` (debe empezar con `xai-`)
- [ ] `OPENAI_API_BASE_URL` (debe ser `https://api.x.ai/v1` para Grok)
- [ ] `XAI_MODEL` o `OPENAI_MODEL` (recomendado: `grok-3-latest`)
- [ ] `SOLANA_RPC_URL` (con tu `HELIUS_API_KEY` incluida)
- [ ] `SOLANA_PUBLIC_KEY` (44 caracteres, formato base58)
- [ ] `SOLANA_PRIVATE_KEY` (formato base58, sin comillas)
- [ ] `HELIUS_API_KEY`
- [ ] `SOL_ADDRESS` (valor: `So11111111111111111111111111111111111111112`)
- [ ] `SLIPPAGE` (valor: `100`)

### ⚠️ Variables Recomendadas

- [ ] `BIRDEYE_API_KEY` (obtener en https://birdeye.so/)

### ❓ Variables Opcionales

- [ ] `TWITTER_API_KEY` y compañeras (solo si necesitas Twitter)
- [ ] `ELIZA_CHARACTER_NAME` (solo si quieres cambiar el personaje)

---

## 🚀 Configuración Rápida

### Paso 1: Variables Básicas (Ya deberías tenerlas)
```env
XAI_API_KEY=xai-tu_clave
OPENAI_API_BASE_URL=https://api.x.ai/v1
XAI_MODEL=grok-3-latest
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_KEY
SOLANA_PUBLIC_KEY=tu_wallet_publica
SOLANA_PRIVATE_KEY=tu_wallet_privada
HELIUS_API_KEY=tu_helius_key
```

### Paso 2: Variables del Plugin Solana (AGREGAR AHORA)
```env
SOL_ADDRESS=So11111111111111111111111111111111111111112
SLIPPAGE=100
```

### Paso 3: Variable Recomendada (Opcional)
```env
BIRDEYE_API_KEY=tu_birdeye_key
```

---

## ✅ Verificación Después de Configurar

Después de agregar las variables en Railway y hacer redeploy, verifica los logs. Deberías ver:

```
✅ SOL_ADDRESS: Configurada correctamente (So111111111111111111...)
✅ SLIPPAGE: Configurada correctamente (100 basis points = 1%)
✅ BIRDEYE_API_KEY: Configurada (...)
```

Si no las configuraste, el script las configurará automáticamente con valores por defecto, pero es mejor configurarlas manualmente.

---

## 🎯 Resumen: Qué Hacer AHORA

1. **Ir a Railway > Settings > Variables**
2. **Agregar estas dos variables:**
   - `SOL_ADDRESS=So11111111111111111111111111111111111111112`
   - `SLIPPAGE=100`
3. **Verificar que tengas:**
   - `OPENAI_API_KEY` (empieza con `xai-`)
   - `HELIUS_API_KEY`
4. **Hacer Redeploy** en Railway
5. **Verificar logs** para confirmar que todo está bien

¡Listo! Tu agente debería funcionar sin errores de variables faltantes.