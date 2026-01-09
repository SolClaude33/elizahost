# Cómo Obtener el Entity ID del Agente

El `entityId` (también llamado `agentId`) es el identificador único de tu agente en el servidor ElizaOS. Necesitas este ID para conectar tu frontend (Replit, AMICA, etc.) con el agente.

## Método 1: Script Automático (Recomendado)

Ejecuta el script que creamos:

```bash
# Desde tu máquina local o desde Railway
node scripts/get-agent-id.js
```

O con URL personalizada:

```bash
ELIZAOS_URL=https://elizahost-production.up.railway.app node scripts/get-agent-id.js
```

El script intentará varios endpoints para encontrar el `entityId`.

## Método 2: Desde los Logs de Railway

1. Ve a tu proyecto en Railway
2. Abre la pestaña **Logs**
3. Busca líneas que contengan:
   - `Agent registered`
   - `entityId`
   - `agentId`
   - `Started agents`

Ejemplo de lo que buscar:
```
[AGENT] Started agents (count=1)
[AGENT] Agent registered with entityId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Método 3: Desde la API del Servidor

ElizaOS expone endpoints para obtener información del agente. Prueba estos endpoints:

### Opción A: Lista de Agentes
```bash
curl https://elizahost-production.up.railway.app/api/agents
```

### Opción B: Health Check (puede incluir info del agente)
```bash
curl https://elizahost-production.up.railway.app/healthz
```

### Opción C: Endpoint de Información
```bash
curl https://elizahost-production.up.railway.app/api/v1/agents
```

## Método 4: Desde el Nombre del Personaje

En algunos casos, el `entityId` puede ser derivado del nombre del personaje. En tu caso:

- Nombre del personaje: `AMICA Agent`
- Posibles entityIds:
  - `AMICA Agent`
  - `amica-agent`
  - `amica_agent`
  - Un UUID generado automáticamente

## Método 5: Desde la Base de Datos (Si tienes acceso)

Si el plugin bootstrap está configurado, el `entityId` se guarda en la base de datos. Puedes consultarlo directamente si tienes acceso a PostgreSQL.

## Configuración en Replit

Una vez que tengas el `entityId`, configura estas variables en Replit:

```env
# URL del servidor ElizaOS
NEXT_PUBLIC_ELIZAOS_URL=https://elizahost-production.up.railway.app

# Entity ID del agente (obtenido con uno de los métodos anteriores)
NEXT_PUBLIC_ELIZAOS_AGENT_ID=tu_entity_id_aqui
```

## Verificación

Para verificar que el `entityId` es correcto, puedes hacer una petición de prueba:

```bash
curl https://elizahost-production.up.railway.app/api/agents/tu_entity_id_aqui
```

Si recibes información del agente, el `entityId` es correcto.

## Notas Importantes

1. **El entityId es único**: Cada agente tiene su propio `entityId`
2. **No cambia**: Una vez generado, el `entityId` no cambia (a menos que recrees el agente)
3. **Formato**: Generalmente es un UUID (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. **Sensible a mayúsculas**: Algunos sistemas son sensibles a mayúsculas/minúsculas

## Solución de Problemas

### Error: "Valid entityId required"
- Verifica que el `entityId` sea correcto
- Asegúrate de que el servidor esté desplegado y funcionando
- Verifica que la URL del servidor sea correcta

### Error: "Agent not found"
- El `entityId` no existe en ese servidor
- Verifica que estés usando el `entityId` correcto
- Asegúrate de que el agente esté registrado en el servidor

### No puedo encontrar el entityId
- Revisa los logs de Railway cuando el agente inicia
- Ejecuta el script `get-agent-id.js`
- Prueba los diferentes endpoints de la API
- Contacta al soporte de ElizaOS si es necesario
