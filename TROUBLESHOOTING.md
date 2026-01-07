# Guía de Solución de Problemas - ElizaOS Railway Deployment

## Error de Importaciones de TypeScript

Si ves errores como:
```
Module '@elizaos/core' has no exported member 'Client'
Module '@elizaos/core' has no exported member 'start'
```

### Solución 1: Verificar la API de ElizaOS

La API de ElizaOS puede variar según la versión. Para encontrar la API correcta:

1. **Revisar el módulo instalado:**
   ```bash
   npm list @elizaos/core
   ```

2. **Inspeccionar las exportaciones:**
   ```bash
   node -e "const m = require('@elizaos/core'); console.log(Object.keys(m))"
   ```

3. **Revisar la documentación oficial:**
   - https://github.com/elizaos/elizaos
   - https://docs.elizaos.ai

### Solución 2: Usar importaciones dinámicas

El código actual usa importaciones dinámicas que deberían funcionar incluso si los tipos no están disponibles en tiempo de compilación.

### Solución 3: Verificar versiones

Asegúrate de usar versiones compatibles:

```json
{
  "dependencies": {
    "@elizaos/core": "^0.1.0",  // Usa versión específica en lugar de "latest"
    "@elizaos/plugin-twitter": "^0.1.0",
    "@elizaos/plugin-solana": "^0.1.0",
    "@elizaos/plugin-openai": "^0.1.0"
  }
}
```

### Solución 4: Usar el archivo alternativo

Si TypeScript causa problemas, puedes usar `index-alternative.js`:

1. Cambia en `package.json`:
   ```json
   {
     "main": "index-alternative.js",
     "scripts": {
       "start": "node index-alternative.js"
     }
   }
   ```

2. Actualiza `railway.json`:
   ```json
   {
     "build": {
       "buildCommand": "npm install"
     },
     "deploy": {
       "startCommand": "node index-alternative.js"
     }
   }
   ```

## Error de Build en Railway

Si el build falla durante `npm run build`:

1. **Hacer el build opcional:**
   Cambia `railway.json`:
   ```json
   {
     "build": {
       "buildCommand": "npm install"
     }
   }
   ```

2. **O usar JavaScript directamente:**
   - Convierte `index.ts` a `index.js`
   - Usa `index-alternative.js` como base
   - Actualiza `package.json` para usar `.js` directamente

## Error: No se encuentra el módulo

Si ves `Cannot find module '@elizaos/core'`:

1. Verifica que las dependencias estén en `package.json`
2. Asegúrate de que `npm install` se ejecute correctamente
3. Verifica los logs de Railway para ver si la instalación falló

## Variables de Entorno

Asegúrate de configurar estas variables en Railway:

### Obligatorias:
- `DAEMON_PROCESS=true`
- `OPENAI_API_KEY`
- `OPENAI_API_BASE_URL=https://api.x.ai/v1`
- `OPENAI_MODEL=grok-3-latest`

### Opcionales:
- `PORT` (Railway lo asigna automáticamente)
- Variables de Twitter/X (si usas Twitter)
- Variables de Solana (si usas Solana)

## Contacto y Recursos

- **Documentación ElizaOS:** https://github.com/elizaos/elizaos
- **Railway Docs:** https://docs.railway.app
- **Issues de ElizaOS:** https://github.com/elizaos/elizaos/issues

## Debug en Railway

Para ver logs detallados en Railway:

1. Ve a tu proyecto en Railway
2. Click en "Deployments"
3. Selecciona el deployment
4. Revisa los logs de build y runtime

Si el servicio inicia pero luego falla:

1. Ve a la pestaña "Logs"
2. Revisa los mensajes de error
3. Verifica que las variables de entorno estén configuradas

