# Configuración de Variables XAI/Grok

## Variables Específicas de XAI (Recomendado)

Ahora puedes usar variables específicas de XAI/Grok para mayor claridad:

### Variables Requeridas

```env
XAI_API_KEY=xai-tu_clave_api_aqui
XAI_MODEL=grok-3-latest
```

### Cómo Funciona

1. **Prioridad**: Si `XAI_API_KEY` está configurada, tiene prioridad sobre `OPENAI_API_KEY`
2. **Mapeo Automático**: El script mapea automáticamente:
   - `XAI_API_KEY` → `OPENAI_API_KEY` (para compatibilidad)
   - `XAI_MODEL` → `OPENAI_MODEL` (para compatibilidad)
3. **Base URL**: Se configura automáticamente `OPENAI_API_BASE_URL=https://api.x.ai/v1`

### Ventajas

- ✅ **Claridad**: Variables específicas para Grok/XAI
- ✅ **Compatibilidad**: Se mapean a variables genéricas de OpenAI para que ElizaOS las reconozca
- ✅ **Sin conflictos**: No hay confusión con claves de OpenAI reales

### Configuración en Railway

1. Ve a tu proyecto en Railway
2. Settings > Variables
3. Agrega:
   ```
   XAI_API_KEY=xai-tu_clave_aqui
   XAI_MODEL=grok-3-latest
   ```
4. El script detectará automáticamente estas variables y las configurará

### Modelos Válidos de Grok

- `grok-beta` (recomendado, más estable)
- `grok-2-1212`
- `grok-2-vision-1212`
- `grok-3-latest`

### Notas

- Si configuras `XAI_API_KEY`, NO necesitas configurar `OPENAI_API_KEY` también
- El script automáticamente configura `OPENAI_API_BASE_URL` si no está configurada
- Todas las variables se limpian automáticamente de comillas si Railway las añade

