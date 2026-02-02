# Configuración Rápida de Variables en Railway

## 🚨 Variables Faltantes Detectadas

Basado en los logs y la confirmación, estas son las variables que **FALTAN** configurar en Railway:

### ✅ Variables Críticas que FALTAN (OBLIGATORIAS)

Agrega estas **2 variables** en **Railway > Tu Proyecto > Settings > Variables**:

```env
# 1. Dirección del token SOL nativo (valor fijo) - REQUERIDA
SOL_ADDRESS=So11111111111111111111111111111111111111112

# 2. Slippage para swaps (1% recomendado) - REQUERIDA
SLIPPAGE=100
```

### ✅ Variables que YA TIENES Configuradas

Estas variables ya están configuradas correctamente:
- ✅ `OPENAI_API_KEY` (o `XAI_API_KEY`) - Ya configurada
- ✅ `OPENAI_API_BASE_URL` - Ya configurada
- ✅ `HELIUS_API_KEY` - Ya configurada
- ✅ `SOLANA_RPC_URL` - Ya configurada
- ✅ `SOLANA_PUBLIC_KEY` - Ya configurada
- ✅ `SOLANA_PRIVATE_KEY` - Ya configurada

### ⚠️ Variable Opcional (Recomendada pero NO Obligatoria)

```env
# 3. API Key de Birdeye (opcional pero recomendado para datos de mercado)
BIRDEYE_API_KEY=tu_birdeye_api_key_aqui
```

---

## 📋 Pasos para Configurar en Railway

### Paso 1: Abre Railway
1. Ve a https://railway.app
2. Selecciona tu proyecto (elizahost-production o similar)
3. Haz clic en **Settings** (ajustes)
4. Haz clic en **Variables** (variables de entorno)

### Paso 2: Agrega SOLO las Variables Faltantes

Haz clic en **+ New Variable** para estas **2 variables críticas**:

#### 1. SOL_ADDRESS ⚠️ FALTA - AGREGAR
- **Nombre:** `SOL_ADDRESS`
- **Valor:** `So11111111111111111111111111111111111111112`
- **✅ Crítica - Copiar EXACTO este valor**

#### 2. SLIPPAGE ⚠️ FALTA - AGREGAR
- **Nombre:** `SLIPPAGE`
- **Valor:** `100`
- **✅ Crítica**

#### 3. BIRDEYE_API_KEY (Opcional - Recomendado)
- **Nombre:** `BIRDEYE_API_KEY`
- **Valor:** Tu API key de Birdeye (obtener en https://birdeye.so/)
- **⚠️ Opcional pero recomendado para datos de mercado en tiempo real**

### ✅ Variables que YA TIENES (Verificar que estén bien)

Estas variables ya están configuradas, solo verifica que estén correctas:
- ✅ `OPENAI_API_KEY` o `XAI_API_KEY` - Debe empezar con `xai-`
- ✅ `OPENAI_API_BASE_URL` - Debe ser `https://api.x.ai/v1` para Grok
- ✅ `HELIUS_API_KEY` - Ya configurada
- ✅ `SOLANA_RPC_URL` - Ya configurada
- ✅ `SOLANA_PUBLIC_KEY` - Ya configurada
- ✅ `SOLANA_PRIVATE_KEY` - Ya configurada

### Paso 3: Guardar y Redeploy

1. **Guarda** todas las variables
2. Ve a la pestaña **Deployments**
3. Haz clic en **Redeploy** o espera a que Railway detecte los cambios automáticamente

---

## 🔍 Cómo Obtener las API Keys Faltantes

### BIRDEYE_API_KEY (Opcional)

1. Ve a: https://birdeye.so/
2. Crea una cuenta o inicia sesión
3. Ve a la sección de **Developers** o **API**
4. Genera una nueva API key
5. Cópiala y péga la en Railway

**Nota:** Si no la configuras, el plugin funcionará pero con funcionalidad limitada (sin datos de mercado en tiempo real).

---

## ✅ Verificación Después de Configurar

Después de agregar las variables y hacer redeploy, verifica los logs en Railway:

```bash
# Busca estas líneas en los logs:
✅ SOL_ADDRESS: Configurada
✅ SLIPPAGE: Configurada
✅ BIRDEYE_API_KEY: Configurada (si la agregaste)
```

---

## 🎯 Resumen de Variables

| Variable | Requerida | Valor | Estado |
|----------|-----------|-------|--------|
| `OPENAI_API_KEY` / `XAI_API_KEY` | ✅ Sí | `xai-...` | ✅ **Ya configurada** |
| `OPENAI_API_BASE_URL` | ✅ Sí | `https://api.x.ai/v1` | ✅ **Ya configurada** |
| `HELIUS_API_KEY` | ✅ Sí | `tu_key` | ✅ **Ya configurada** |
| `SOLANA_RPC_URL` | ✅ Sí | `https://...` | ✅ **Ya configurada** |
| `SOLANA_PUBLIC_KEY` | ✅ Sí | `tu_key` | ✅ **Ya configurada** |
| `SOLANA_PRIVATE_KEY` | ✅ Sí | `tu_key` | ✅ **Ya configurada** |
| `SOL_ADDRESS` | ✅ Sí | `So11111111111111111111111111111111111111112` | ⚠️ **FALTA - Agregar** |
| `SLIPPAGE` | ✅ Sí | `100` | ⚠️ **FALTA - Agregar** |
| `BIRDEYE_API_KEY` | ⚠️ Opcional | `tu_key` | ⚠️ **Opcional - Agregar si quieres** |

---

## ⚡ Acción Inmediata

**Solo necesitas agregar estas 2 variables:**

1. `SOL_ADDRESS=So11111111111111111111111111111111111111112`
2. `SLIPPAGE=100`

**Las demás variables ya las tienes configuradas correctamente! ✅**

Después de agregarlas, haz **Redeploy** en Railway y verifica que no haya más errores en los logs.