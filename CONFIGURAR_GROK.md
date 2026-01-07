# Cómo Configurar Grok en Railway

## Pasos para Cambiar de ChatGPT a Grok

### 1. Obtener API Key de Grok

1. Ve a https://console.x.ai
2. Inicia sesión con tu cuenta de X (Twitter)
3. Ve a la sección "API Keys"
4. Crea una nueva API key
5. **Copia la clave** - debería empezar con `xai-`

### 2. Actualizar Variables en Railway

Ve a Railway Dashboard > Tu Proyecto > Variables y actualiza:

#### ✅ Variables que DEBEN estar así para Grok:

```env
OPENAI_API_KEY=xai-tu-clave-de-grok-aqui
OPENAI_API_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-3-latest
```

#### ⚠️ Importante:

- `OPENAI_API_KEY` debe empezar con `xai-` (no `sk-` que es para OpenAI)
- `OPENAI_API_BASE_URL` debe ser exactamente `https://api.x.ai/v1`
- `OPENAI_MODEL` debe ser `grok-3-latest` (o `grok-beta` si está disponible)

### 3. Verificar Configuración

Después de actualizar las variables, el script `check-env.js` validará automáticamente:

- ✅ Verificará que la clave empiece con `xai-`
- ✅ Verificará que `OPENAI_API_BASE_URL` esté correcto
- ✅ Mostrará un mensaje de confirmación

### 4. Reiniciar el Servicio

Después de cambiar las variables:

1. Railway debería reiniciar automáticamente
2. O puedes hacerlo manualmente desde Railway Dashboard > Deployments > Redeploy

### 5. Verificar en Logs

En los logs de Railway deberías ver:

```
✅ OPENAI_API_KEY: Formato correcto para Grok (empieza con 'xai-')
```

## Resumen de Variables para Grok

| Variable | Valor Requerido | Descripción |
|----------|----------------|-------------|
| `OPENAI_API_KEY` | `xai-...` | Tu API key de Grok (obtener en console.x.ai) |
| `OPENAI_API_BASE_URL` | `https://api.x.ai/v1` | URL base de la API de Grok |
| `OPENAI_MODEL` | `grok-3-latest` | Modelo de Grok a usar |

## Troubleshooting

### Error: "No empieza con 'xai-'"

**Problema**: Estás usando una clave de OpenAI en lugar de Grok.

**Solución**: 
1. Obtén una nueva API key de https://console.x.ai
2. Asegúrate de que empiece con `xai-`
3. Actualiza `OPENAI_API_KEY` en Railway

### Error: "Unauthorized" o "Invalid API Key"

**Problema**: La clave de Grok no es válida o no tiene permisos.

**Solución**:
1. Verifica que copiaste la clave completa (sin espacios)
2. Asegúrate de que la cuenta de Grok tenga créditos/quota disponible
3. Genera una nueva clave si es necesario

### El agente sigue usando ChatGPT

**Problema**: Las variables no se actualizaron correctamente.

**Solución**:
1. Verifica que guardaste las variables en Railway
2. Reinicia el servicio manualmente
3. Revisa los logs para confirmar que está usando Grok

## Verificación Final

Para confirmar que está usando Grok, revisa los logs y busca:

- ✅ "OPENAI_API_KEY: Formato correcto para Grok"
- ✅ El modelo debería ser "grok-3-latest"
- ✅ Las respuestas deberían ser características de Grok (más directas, con humor)

