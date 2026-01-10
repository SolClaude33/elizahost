# Variables de Entorno Requeridas - Plugins Solana y ElevenLabs

## 📋 Resumen

ElizaOS requiere estas variables adicionales para que los plugins funcionen correctamente:

1. **SOL_ADDRESS** - Requerido por `@elizaos/plugin-solana`
2. **SLIPPAGE** - Requerido por `@elizaos/plugin-solana`
3. **BIRDEYE_API_KEY** - Requerido por `@elizaos/plugin-solana` (para datos de mercado)
4. **ELEVENLABS_API_KEY** - Requerido por `@elizaos/plugin-elevenlabs` (solo si usas voz)

---

## 🔷 Plugin Solana - Variables Requeridas

### 1. SOL_ADDRESS

**Descripción:** La dirección del token nativo SOL usado para representar SOL nativo en swaps y transacciones.

**Valor por defecto (usar este):**
```
SOL_ADDRESS=So11111111111111111111111111111111111111112
```

**Explicación:** Esta es la dirección del token Wrapped SOL (WSOL) en Solana. Es el estándar para representar SOL nativo en contratos y swaps.

**Cómo configurar:**
- **En Railway:** Agrega esta variable de entorno con el valor exacto arriba.

**⚠️ Importante:** Este es un valor constante en Solana, no necesitas cambiarlo.

---

### 2. SLIPPAGE

**Descripción:** Porcentaje máximo de slippage aceptable para swaps de tokens en Solana.

**Valores recomendados:**
- `50` = 0.5% (muy conservador, puede fallar en swaps rápidos)
- `100` = 1% (recomendado para la mayoría de casos)
- `500` = 5% (para swaps de tokens muy volátiles)

**Valor recomendado:**
```
SLIPPAGE=100
```

**Explicación:** El slippage es la diferencia entre el precio esperado y el precio real de ejecución de un swap. Un valor más alto permite más variación pero puede resultar en peores precios.

**Cómo configurar:**
- **En Railway:** Agrega esta variable con el valor recomendado (100).

---

### 3. BIRDEYE_API_KEY

**Descripción:** API key de Birdeye para acceder a datos de mercado de tokens en Solana.

**Opcional pero recomendado:**
- Si NO configuras esto: El plugin de Solana puede funcionar, pero con funcionalidad limitada (sin datos de mercado en tiempo real).
- Si configuras esto: Acceso completo a datos de precios, volumen, y análisis de tokens.

**Cómo obtener:**
1. Ve a: https://birdeye.so/
2. Crea una cuenta (si no tienes)
3. Ve a la sección de desarrolladores/API
4. Genera una nueva API key
5. Copia la key

**Configuración:**
```
BIRDEYE_API_KEY=tu_api_key_de_birdeye
```

**⚠️ Nota:** Esta variable es requerida por el plugin, pero puedes usar el plugin sin ella si no necesitas datos de mercado avanzados.

---

## 🎤 Plugin ElevenLabs - Variable Opcional

### 4. ELEVENLABS_API_KEY

**Descripción:** API key de ElevenLabs para generar voz sintética.

**¿Es necesario?**
- **Sí, si:** Tienes `@elizaos/plugin-elevenlabs` en la lista de plugins Y quieres que el agente hable.
- **No, si:** No usas el plugin de voz o no tienes el plugin en tu configuración.

**Revisa tu `characters/nyako-agent.json`:**
```json
"plugins": [
  "@elizaos/plugin-bootstrap",
  "@elizaos/plugin-openai",
  "@elizaos/plugin-solana",
  "@elizaos/plugin-twitter"
]
```

**⚠️ Nota:** Tu personaje tiene `voice.model: "Yuki"` configurado, pero el plugin `@elizaos/plugin-elevenlabs` **NO está en la lista de plugins**. Esto significa que:
- Probablemente NO necesitas `ELEVENLABS_API_KEY` a menos que agregues el plugin.
- La configuración de voz puede estar para uso futuro o para otro sistema.

**Cómo obtener (si lo necesitas):**
1. Ve a: https://elevenlabs.io/
2. Crea una cuenta
3. Ve a tu perfil > API Keys
4. Genera una nueva API key
5. Copia la key

**Configuración (solo si usas el plugin):**
```
ELEVENLABS_API_KEY=tu_api_key_de_elevenlabs
```

---

## ✅ Configuración Recomendada en Railway

Agrega estas variables en **Railway > Tu Proyecto > Settings > Variables**:

### Variables Críticas (Necesarias):

```env
# Dirección del token SOL nativo (valor fijo)
SOL_ADDRESS=So11111111111111111111111111111111111111112

# Slippage para swaps (1% recomendado)
SLIPPAGE=100
```

### Variables Opcionales (Recomendadas):

```env
# API key de Birdeye para datos de mercado
# Obtener en: https://birdeye.so/
BIRDEYE_API_KEY=tu_birdeye_api_key
```

### Variable Opcional (Solo si usas voz):

```env
# API key de ElevenLabs (solo si tienes @elizaos/plugin-elevenlabs en plugins)
# Obtener en: https://elevenlabs.io/
# ELEVENLABS_API_KEY=tu_elevenlabs_api_key
```

---

## 🔍 Verificación

Después de configurar las variables:

1. **Redeploy el servicio en Railway** para que tome las nuevas variables
2. **Revisa los logs** para verificar que no haya errores relacionados con estas variables
3. **Prueba funcionalidad Solana** (si tienes swaps configurados)

---

## 📝 Resumen Rápido

| Variable | Requerida | Valor por Defecto | Dónde Obtener |
|----------|-----------|-------------------|---------------|
| `SOL_ADDRESS` | ✅ Sí | `So11111111111111111111111111111111111111112` | Constante en Solana |
| `SLIPPAGE` | ✅ Sí | `100` (1%) | Valor recomendado |
| `BIRDEYE_API_KEY` | ⚠️ Recomendado | - | https://birdeye.so/ |
| `ELEVENLABS_API_KEY` | ❌ Opcional* | - | https://elevenlabs.io/ |

*Solo necesario si usas el plugin `@elizaos/plugin-elevenlabs`

---

## 🚀 Próximos Pasos

1. ✅ Configura `SOL_ADDRESS` con el valor proporcionado
2. ✅ Configura `SLIPPAGE` con `100`
3. ⏳ (Opcional) Obtén y configura `BIRDEYE_API_KEY` si necesitas datos de mercado
4. ❓ Solo configura `ELEVENLABS_API_KEY` si agregas el plugin de voz
5. 🔄 Haz redeploy en Railway

¡Listo! Tu agente debería funcionar correctamente con estas variables configuradas.