# Configuración de Variables para Grok en Railway

## Variables Requeridas

Configura estas variables en Railway Dashboard > Variables **SIN comillas**:

```env
OPENAI_API_KEY=xai-tu-clave-de-grok-aqui
OPENAI_API_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-3-latest
```

## Importante

- Las variables se configuran **SIN comillas** en Railway
- El script automáticamente configura también `OPENAI_BASE_URL` para compatibilidad
- Si `OPENAI_API_BASE_URL` no está configurada, el script la configurará automáticamente

## Verificación en Logs

Deberías ver:
```
✅ OPENAI_API_KEY: Formato correcto para Grok (empieza con 'xai-')
✅ OPENAI_API_BASE_URL: Configurada correctamente para Grok (https://api.x.ai/v1)
✅ Configuradas ambas variables (OPENAI_API_BASE_URL y OPENAI_BASE_URL) para compatibilidad
```

