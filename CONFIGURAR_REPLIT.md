# Guía para Configurar Replit con tu Agente ElizaOS

## Variables de Entorno Necesarias en Replit

Configura estas variables en Replit (ve a Secrets/Tab .env):

```env
# URL de tu servidor ElizaOS en Railway
NEXT_PUBLIC_ELIZAOS_URL=https://elizahost-production.up.railway.app

# Entity ID de tu agente (obtener con: node scripts/get-agent-id.js)
NEXT_PUBLIC_ELIZAOS_AGENT_ID=b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

## Cómo Obtener el Entity ID

Ejecuta este comando en tu proyecto local o desde Railway:

```bash
node scripts/get-agent-id.js
```

Esto te dará el `entityId` de tu agente. En tu caso es:
```
b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

## Verificar que el Entity ID sea Correcto

Puedes verificar que el entityId sea válido haciendo una petición:

```bash
curl https://elizahost-production.up.railway.app/api/agents
```

Deberías ver tu agente en la respuesta:
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "b6e1a7e7-ba41-068a-bc54-f4221638a4d8",
        "name": "AMICA Agent",
        "status": "active"
      }
    ]
  }
}
```

## Problema: entityId undefined

Si ves este error en los logs:
```
[SocketIO Auth] Invalid or missing entityId: undefined
```

### Causa
Replit no está enviando el `entityId` correctamente al conectarse vía WebSocket.

### Solución

1. **Verifica las variables de entorno en Replit:**
   - Asegúrate de que `NEXT_PUBLIC_ELIZAOS_AGENT_ID` esté configurada
   - Verifica que el valor sea exactamente: `b6e1a7e7-ba41-068a-bc54-f4221638a4d8`

2. **Verifica el código de conexión WebSocket en Replit:**
   
   El código debe pasar el `entityId` al conectarse. Ejemplo:
   
   ```javascript
   // Ejemplo de conexión correcta
   const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL, {
     auth: {
       entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
     }
   });
   ```

   O si usas Socket.IO con query:
   
   ```javascript
   const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL, {
     query: {
       entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
     }
   });
   ```

3. **Verifica que el frontend esté leyendo las variables:**
   - En Next.js, las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el cliente
   - Asegúrate de que no estés usando `process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID` antes de que Next.js las cargue

## Verificación Final

Después de configurar todo correctamente, deberías ver en los logs de Railway:

✅ **Conexión exitosa:**
```
[SocketIO Auth] Socket XXX authenticated for entity b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

❌ **Si aún ves errores:**
```
[SocketIO Auth] Invalid or missing entityId: undefined
```

### Debugging en Replit

1. **Añade logs en tu código de Replit:**
   ```javascript
   console.log('Entity ID:', process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID);
   console.log('URL:', process.env.NEXT_PUBLIC_ELIZAOS_URL);
   ```

2. **Verifica que las variables estén disponibles:**
   - Si usas Next.js, reinicia el servidor de desarrollo después de agregar variables
   - Si usas otro framework, asegúrate de recargar el proceso

3. **Prueba la conexión manualmente:**
   ```javascript
   // En la consola del navegador o en un script de prueba
   fetch('https://elizahost-production.up.railway.app/api/agents')
     .then(r => r.json())
     .then(data => console.log('Agentes:', data));
   ```

## Información del Agente

- **Nombre:** AMICA Agent
- **Entity ID:** `b6e1a7e7-ba41-068a-bc54-f4221638a4d8`
- **URL del Servidor:** `https://elizahost-production.up.railway.app`
- **Estado:** ✅ Active
- **Puerto:** 3000 (interno de Railway)
- **WebSocket:** Disponible en `/socket.io/`

## Recursos Adicionales

- Documentación de AMICA: [https://github.com/significant-gravitas/amica](https://github.com/significant-gravitas/amica)
- Documentación de ElizaOS: [https://elizaos.github.io](https://elizaos.github.io)
- Socket.IO Client Docs: [https://socket.io/docs/v4/client-api/](https://socket.io/docs/v4/client-api/)
