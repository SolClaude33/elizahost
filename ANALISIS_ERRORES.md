# Análisis de Errores en los Logs

## Resumen de Errores Encontrados

### ✅ Errores NO Críticos (Se pueden ignorar)

1. **Twitter API credentials missing** ⚠️
   - **Error:** `Twitter API credentials are required`
   - **Causa:** No tienes configuradas las credenciales de Twitter
   - **Impacto:** El plugin de Twitter no funcionará, pero el resto del agente funciona normalmente
   - **Solución:** Si no necesitas Twitter, ignóralo. Si lo necesitas, agrega las credenciales en Railway.

2. **Embeddings 404 (Grok)** ⚠️
   - **Error:** `OpenAI API error: 404 - Not Found` al generar embeddings
   - **Causa:** Grok/xAI no tiene endpoint de embeddings como OpenAI
   - **Impacto:** No afecta las respuestas del agente, solo la búsqueda en memoria a largo plazo
   - **Solución:** Normal con Grok, se puede ignorar

3. **SECRET_SALT warning** ⚠️
   - **Error:** `SECRET_SALT is not set or using default value`
   - **Causa:** Variable opcional no configurada
   - **Impacto:** Mínimo, solo afecta la seguridad de algunos tokens internos
   - **Solución:** Agrega `SECRET_SALT=un_valor_secreto_aleatorio` en Railway si quieres mayor seguridad

---

### 🔴 Errores CRÍTICOS (Deben solucionarse)

#### 1. Express Trust Proxy Error ❌ **CRÍTICO**

**Error:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default).
```

**Causa:**
- Railway está detrás de un proxy/load balancer
- Express necesita configurarse para confiar en los headers del proxy (como `X-Forwarded-For`)
- Sin esto, el rate limiting puede fallar y algunas peticiones pueden ser rechazadas

**Impacto:**
- ❌ El rate limiting puede no funcionar correctamente
- ❌ Las peticiones desde Replit pueden ser rechazadas
- ❌ Los logs pueden mostrar errores de validación

**Solución:**
✅ **SOLUCIONADO AUTOMÁTICAMENTE:** El script `check-env.js` ahora configura automáticamente `TRUST_PROXY=true` antes de iniciar ElizaOS. No necesitas hacer nada manualmente.

**Opción Manual (Si quieres configurarlo explícitamente):**
Puedes agregar esta variable en Railway como respaldo:
```env
TRUST_PROXY=true
```
Pero el script ya lo configura automáticamente, así que es opcional.

---

#### 2. SocketIO Auth - Missing EntityId ❌ **CRÍTICO**

**Error:**
```
[SocketIO Auth] Invalid or missing entityId: undefined
```

**Causa:**
- Replit está intentando conectarse pero no está enviando el `entityId` correctamente
- El frontend (Replit/AMICA) necesita enviar el `entityId` del agente al conectarse
- **POSIBLES CAUSAS ESPECÍFICAS:**
  1. Variables `NEXT_PUBLIC_*` no se están leyendo en el cliente (común en Next.js)
  2. Código de Socket.IO no está pasando el `entityId` en `auth`
  3. AMICA está usando su propio `entityId` de usuario en lugar del del agente
  4. Versión antigua de Socket.IO (v2/v3) usando formato de query incorrecto

**Impacto:**
- ❌ Las conexiones WebSocket desde Replit fallan
- ❌ No puedes interactuar con el agente desde el frontend
- ❌ El agente no puede recibir mensajes desde Replit

**Solución:**

1. **Verificar que el entityId sea correcto:**
   - Ejecuta: `node scripts/get-agent-id.js`
   - El entityId debería ser: `b6e1a7e7-ba41-068a-bc54-f4221638a4d8`

2. **Configurar en Replit:**
   ```env
   NEXT_PUBLIC_ELIZAOS_URL=https://elizahost-production.up.railway.app
   NEXT_PUBLIC_ELIZAOS_AGENT_ID=b6e1a7e7-ba41-068a-bc54-f4221638a4d8
   ```
   **⚠️ IMPORTANTE:** Reinicia el servidor de desarrollo después de agregar variables

3. **Verificar código de conexión Socket.IO:**
   
   ✅ **CORRECTO (Socket.IO v4+):**
   ```javascript
   const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL, {
     auth: {
       entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
     }
   });
   ```
   
   ❌ **INCORRECTO:**
   ```javascript
   const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL); // Sin entityId
   ```

4. **Diagnóstico:**
   - Ver archivo `DIAGNOSTICO_REPLIT.md` para diagnóstico paso a paso
   - Verifica que las variables estén disponibles: `console.log(process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID)`
   - Revisa los logs de Railway en tiempo real mientras intentas conectar

---

## Estado Actual del Agente

### ✅ Funcionando Correctamente:
- ✅ Servidor iniciado en puerto 3000
- ✅ Agente registrado y activo
- ✅ Plugin de Solana funcionando (`getTokenAccountsByKeypair`)
- ✅ Plugin de SQL/Bootstrap funcionando
- ✅ Base de datos configurada
- ✅ Grok/LLM configurado y respondiendo
- ✅ Health checks funcionando (`/healthz`, `/health`)
- ✅ API de agentes funcionando (`/api/agents`)

### ⚠️ Advertencias (No críticas):
- ⚠️ Twitter no configurado (esperado)
- ⚠️ Embeddings fallando (normal con Grok)
- ⚠️ SECRET_SALT no configurado (opcional)

### ❌ Problemas Críticos:
- ✅ **Trust proxy** → **SOLUCIONADO:** El script ahora configura `TRUST_PROXY=true` automáticamente
- ❌ **entityId undefined en conexiones** → Replit no está enviando el entityId correctamente (ver `CONFIGURAR_REPLIT.md`)

---

## Solución Paso a Paso

### Paso 1: Trust Proxy (Ya solucionado automáticamente) ✅

El script `check-env.js` ahora configura `TRUST_PROXY=true` automáticamente. No necesitas hacer nada manualmente. El error debería desaparecer después del próximo despliegue.

**Opcional:** Si quieres configurarlo manualmente en Railway, agrega `TRUST_PROXY=true` en las variables de entorno, pero no es necesario ya que el script lo hace automáticamente.

### Paso 2: Verificar EntityId en Replit (10 minutos)

1. Ejecuta localmente:
   ```bash
   node scripts/get-agent-id.js
   ```
   
2. Confirma que obtienes: `b6e1a7e7-ba41-068a-bc54-f4221638a4d8`

3. En Replit, verifica que tengas configurado:
   ```env
   NEXT_PUBLIC_ELIZAOS_URL=https://elizahost-production.up.railway.app
   NEXT_PUBLIC_ELIZAOS_AGENT_ID=b6e1a7e7-ba41-068a-bc54-f4221638a4d8
   ```

4. Revisa el código de Replit para asegurarte de que está enviando el `entityId` en la conexión WebSocket

### Paso 3: Verificar Conexión (5 minutos)

Después de configurar todo:
1. Intenta conectarte desde Replit nuevamente
2. Revisa los logs de Railway
3. Ya no deberías ver `entityId: undefined`
4. Deberías ver conexiones exitosas

---

## Códigos de Error Específicos

### Error 1: Trust Proxy
```
ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```
**Solución:** `TRUST_PROXY=true` en Railway

### Error 2: EntityId Missing
```
Invalid or missing entityId: undefined
```
**Solución:** Configurar `NEXT_PUBLIC_ELIZAOS_AGENT_ID` en Replit y verificar que se envía en la conexión

---

## Verificación Final

Después de aplicar las soluciones, deberías ver en los logs:

✅ **Lo que deberías ver:**
```
[SocketIO Auth] Socket XXX authenticated for entity b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

❌ **Lo que NO deberías ver:**
```
[SocketIO Auth] Invalid or missing entityId: undefined
ValidationError: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```
