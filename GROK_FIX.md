# Solución para Error "Incorrect API key provided" con Grok

## Problema Identificado

Aunque tienes configurado:
- ✅ `OPENAI_API_KEY=xai-...` (correcto)
- ✅ `OPENAI_API_BASE_URL=https://api.x.ai/v1` (correcto)

ElizaOS está intentando usar `https://api.openai.com/v1/responses` en lugar de `https://api.x.ai/v1`.

## Solución

### Opción 1: Verificar Variables en Railway (MÁS PROBABLE)

El problema más común es que `OPENAI_API_BASE_URL` no está configurada correctamente en Railway.

**Pasos:**
1. Ve a Railway Dashboard > Tu Proyecto > Variables
2. **Verifica** que `OPENAI_API_BASE_URL` esté exactamente así:
   ```
   OPENAI_API_BASE_URL=https://api.x.ai/v1
   ```
3. **IMPORTANTE**: Asegúrate de que NO tenga comillas alrededor
4. **IMPORTANTE**: Asegúrate de que NO tenga espacios al inicio o final
5. Guarda y reinicia el servicio

### Opción 2: Verificar que la Variable se Esté Pasando

El script `check-env.js` ahora valida `OPENAI_API_BASE_URL`. En los logs deberías ver:

```
✅ OPENAI_API_BASE_URL: Configurada correctamente para Grok (https://api.x.ai/v1)
```

Si NO ves este mensaje, significa que la variable no está configurada en Railway.

### Opción 3: Verificar el Character File

He actualizado `characters/amica-agent.json` para incluir explícitamente:
- `apiKey` y `apiBaseUrl` en `settings`
- `OPENAI_API_KEY` y `OPENAI_API_BASE_URL` en `secrets`

Esto asegura que ElizaOS use las variables correctas.

## Verificación

Después de hacer los cambios, en los logs deberías ver:

1. ✅ `OPENAI_API_KEY: Formato correcto para Grok (empieza con 'xai-')`
2. ✅ `OPENAI_API_BASE_URL: Configurada correctamente para Grok (https://api.x.ai/v1)`
3. ❌ NO deberías ver errores de "Incorrect API key provided"
4. ❌ NO deberías ver `url: "https://api.openai.com/v1/responses"`

## Si el Problema Persiste

Si después de verificar todo sigue fallando:

1. **Verifica que la clave de Grok sea válida:**
   - Ve a https://console.x.ai
   - Verifica que la clave esté activa
   - Verifica que tengas créditos/quota disponible

2. **Verifica el formato exacto en Railway:**
   - Copia y pega exactamente: `https://api.x.ai/v1`
   - Sin comillas, sin espacios

3. **Reinicia completamente el servicio:**
   - Railway Dashboard > Deployments > Redeploy

4. **Revisa los logs completos** para ver si hay algún otro error antes del error de API key.

