# Configuración Rápida de Variables en Railway

## 🚨 Variables Faltantes Detectadas

Basado en los logs, estas son las variables que necesitas configurar en Railway:

### ✅ Variables Críticas (OBLIGATORIAS)

Agrega estas en **Railway > Tu Proyecto > Settings > Variables**:

```env
# 1. API Key de Grok/XAI (ya deberías tenerla, pero verifica)
OPENAI_API_KEY=xai-tu_clave_api_grok_aqui

# 2. Dirección del token SOL nativo (valor fijo)
SOL_ADDRESS=So11111111111111111111111111111111111111112

# 3. Slippage para swaps (1% recomendado)
SLIPPAGE=100

# 4. API Key de Helius (ya deberías tenerla, pero verifica)
HELIUS_API_KEY=tu_helius_api_key_aqui

# 5. API Key de Birdeye (opcional pero recomendado)
BIRDEYE_API_KEY=tu_birdeye_api_key_aqui
```

---

## 📋 Pasos para Configurar en Railway

### Paso 1: Abre Railway
1. Ve a https://railway.app
2. Selecciona tu proyecto (elizahost-production o similar)
3. Haz clic en **Settings** (ajustes)
4. Haz clic en **Variables** (variables de entorno)

### Paso 2: Agrega las Variables

Haz clic en **+ New Variable** para cada una:

#### 1. SOL_ADDRESS
- **Nombre:** `SOL_ADDRESS`
- **Valor:** `So11111111111111111111111111111111111111112`
- **✅ Crítica - Copiar EXACTO este valor**

#### 2. SLIPPAGE
- **Nombre:** `SLIPPAGE`
- **Valor:** `100`
- **✅ Crítica**

#### 3. BIRDEYE_API_KEY (si quieres datos de mercado)
- **Nombre:** `BIRDEYE_API_KEY`
- **Valor:** Tu API key de Birdeye
- **⚠️ Opcional pero recomendado**

#### 4. Verifica las que ya tienes:
- `OPENAI_API_KEY` - Debe empezar con `xai-`
- `HELIUS_API_KEY` - Tu clave de Helius

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
| `OPENAI_API_KEY` | ✅ Sí | `xai-...` | Verificar que exista |
| `SOL_ADDRESS` | ✅ Sí | `So11111111111111111111111111111111111111112` | **Agregar** |
| `SLIPPAGE` | ✅ Sí | `100` | **Agregar** |
| `HELIUS_API_KEY` | ✅ Sí | `tu_key` | Verificar que exista |
| `BIRDEYE_API_KEY` | ⚠️ Recomendado | `tu_key` | **Agregar** (opcional) |

---

## ⚡ Acción Inmediata

**Agrega estas dos variables ahora mismo:**

1. `SOL_ADDRESS=So11111111111111111111111111111111111111112`
2. `SLIPPAGE=100`

Después de agregarlas, haz **Redeploy** en Railway y verifica que no haya más errores en los logs.