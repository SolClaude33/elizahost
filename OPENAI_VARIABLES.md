# Variables de Entorno para OpenAI

## Variables para usar OpenAI (no Grok/XAI)

Si quieres usar **OpenAI real** en lugar de Grok/XAI, usa estas variables:

### Variables Requeridas

```env
OPENAI_API_KEY=sk-tu_clave_api_openai
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
```

### Variables Opcionales

```env
OPENAI_BASE_URL=https://api.openai.com/v1  # Algunos plugins pueden usar esta variable
```

## Modelos Válidos de OpenAI

Los modelos comunes de OpenAI incluyen:

- `gpt-4o` (recomendado, más reciente y eficiente)
- `gpt-4-turbo`
- `gpt-4`
- `gpt-3.5-turbo`
- `gpt-3.5-turbo-16k`

## Diferencia entre OpenAI y Grok/XAI

### Para OpenAI:
```env
OPENAI_API_KEY=sk-...
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
```

### Para Grok/XAI:
```env
# Opción 1: Variables específicas de XAI (recomendado)
XAI_API_KEY=xai-...
XAI_MODEL=grok-3-latest

# Opción 2: Variables genéricas (compatibilidad)
OPENAI_API_KEY=xai-...
OPENAI_API_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-beta
```

## Importante

- **OPENAI_API_KEY**: Debe empezar con `sk-` para OpenAI real
- **OPENAI_API_KEY**: Debe empezar con `xai-` para Grok/XAI
- **OPENAI_API_BASE_URL**: 
  - `https://api.openai.com/v1` para OpenAI
  - `https://api.x.ai/v1` para Grok/XAI
- El script detecta automáticamente el tipo de clave por el prefijo

## Configuración en Railway

1. Ve a tu proyecto en Railway
2. Settings > Variables
3. Agrega las variables de OpenAI:
   ```
   OPENAI_API_KEY=sk-tu_clave_openai_aqui
   OPENAI_API_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4o
   ```

El script detectará automáticamente que es una clave de OpenAI (por el prefijo `sk-`) y configurará todo correctamente.

