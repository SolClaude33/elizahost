# Diagnóstico de Problemas de Conexión Replit → ElizaOS

Si ya tienes configurado Replit pero aún ves errores, sigue estos pasos para identificar el problema:

## 🔍 Diagnóstico Paso a Paso

### Paso 1: Verificar Variables de Entorno en Replit

Abre la consola de Replit y ejecuta:

```javascript
// En la consola del navegador o en un componente React/Next.js
console.log('URL:', process.env.NEXT_PUBLIC_ELIZAOS_URL);
console.log('Agent ID:', process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID);
```

**Debe mostrar:**
```
URL: https://elizahost-production.up.railway.app
Agent ID: b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

**Si muestra `undefined`:**
- Las variables no están configuradas correctamente
- Verifica que empiecen con `NEXT_PUBLIC_` (necesario para Next.js)
- Reinicia el servidor de desarrollo después de agregar variables

---

### Paso 2: Verificar Código de Conexión Socket.IO

Busca en tu código de Replit dónde se conecta a ElizaOS. Debe verse algo así:

#### ✅ Formato CORRECTO (Socket.IO v4+):
```javascript
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL, {
  auth: {
    entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

#### ✅ Formato ALTERNATIVO (query params):
```javascript
const socket = io(`${process.env.NEXT_PUBLIC_ELIZAOS_URL}`, {
  query: {
    entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
  },
  transports: ['websocket', 'polling']
});
```

#### ❌ Formato INCORRECTO (sin entityId):
```javascript
// Esto NO funcionará
const socket = io(process.env.NEXT_PUBLIC_ELIZAOS_URL);
```

---

### Paso 3: Verificar que AMICA Use el EntityId Correcto

Si estás usando AMICA, verifica la configuración. AMICA puede requerir el entityId en diferentes lugares:

#### Opción A: Variables de Entorno
```env
ELIZAOS_AGENT_ID=b6e1a7e7-ba41-068a-bc54-f4221638a4d8
ELIZAOS_URL=https://elizahost-production.up.railway.app
```

#### Opción B: Archivo de Configuración
Busca un archivo `.env.local` o `config.js` en tu proyecto de Replit y verifica que tenga:
```env
NEXT_PUBLIC_ELIZAOS_AGENT_ID=b6e1a7e7-ba41-068a-bc54-f4221638a4d8
NEXT_PUBLIC_ELIZAOS_URL=https://elizahost-production.up.railway.app
```

---

### Paso 4: Probar la Conexión Manualmente

Abre la consola del navegador (F12) en tu app de Replit y ejecuta:

```javascript
// Test 1: Verificar que las variables estén disponibles
console.log('Variables:', {
  url: process.env.NEXT_PUBLIC_ELIZAOS_URL,
  agentId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
});

// Test 2: Verificar que el endpoint de agentes funciona
fetch('https://elizahost-production.up.railway.app/api/agents')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API funcionando:', data);
    const agent = data.data?.agents?.[0];
    if (agent) {
      console.log('✅ Agente encontrado:', agent.id);
      console.log('✅ Nombre:', agent.name);
    }
  })
  .catch(err => console.error('❌ Error API:', err));

// Test 3: Probar conexión Socket.IO manual
import('https://cdn.socket.io/4.5.4/socket.io.min.js')
  .then(() => {
    const { io } = window;
    const socket = io('https://elizahost-production.up.railway.app', {
      auth: {
        entityId: 'b6e1a7e7-ba41-068a-bc54-f4221638a4d8'
      }
    });
    
    socket.on('connect', () => {
      console.log('✅ Socket conectado:', socket.id);
    });
    
    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err);
    });
    
    socket.on('error', (err) => {
      console.error('❌ Error Socket:', err);
    });
  });
```

---

### Paso 5: Revisar Logs de Railway

En Railway, revisa los logs para ver exactamente qué está recibiendo:

**✅ Conexión exitosa debería mostrar:**
```
[SocketIO Auth] Socket abc123 authenticated for entity b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

**❌ Error que verás si falta entityId:**
```
[SocketIO Auth] Invalid or missing entityId: undefined
```

**❌ Error si el entityId es incorrecto:**
```
[SocketIO Auth] Invalid entityId: xxxxx (no existe en el servidor)
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Variables `undefined` en el cliente

**Síntoma:** `console.log(process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID)` muestra `undefined`

**Solución:**
1. Verifica que las variables empiecen con `NEXT_PUBLIC_`
2. Reinicia el servidor de desarrollo: `Ctrl+C` y vuelve a ejecutar
3. Si usas Next.js, verifica que estén en `.env.local` o en el panel de Secrets de Replit
4. Limpia la caché: elimina `.next` y vuelve a ejecutar

---

### Problema 2: EntityId se envía pero aún falla

**Síntoma:** Las variables están correctas pero aún ves `entityId: undefined` en los logs

**Posibles causas:**

#### Causa A: Socket.IO usa versión antigua
```javascript
// Socket.IO v2/v3 (incorrecto para ElizaOS moderno)
const socket = io(url, {
  query: 'entityId=xxx'  // Formato antiguo
});

// Socket.IO v4+ (correcto)
const socket = io(url, {
  auth: { entityId: 'xxx' }  // Formato nuevo
});
```

#### Causa B: AMICA está usando su propio entityId
AMICA puede estar generando su propio entityId de usuario en lugar de usar el del agente. Verifica la documentación de AMICA sobre cómo especificar el agentId.

#### Causa C: El código está usando una variable diferente
Busca en tu código todas las referencias a `entityId`, `agentId`, `ELIZAOS_AGENT_ID` y verifica que todas apunten a la misma variable.

---

### Problema 3: CORS o Conexión Bloqueada

**Síntoma:** Error `CORS policy` o `connection refused`

**Solución:**
1. Verifica que la URL no tenga una `/` al final:
   - ❌ `https://elizahost-production.up.railway.app/`
   - ✅ `https://elizahost-production.up.railway.app`

2. Verifica que Railway tenga CORS configurado (ya debería estar):
   ```env
   CORS_ORIGIN=*
   ```

---

### Problema 4: Replit Eval Proxy

Si Replit usa su nuevo servicio Eval como proxy inverso, puede que necesites ajustar la configuración:

**Solución:**
1. Verifica que tu app escuche en `0.0.0.0` (ElizaOS ya lo hace)
2. Verifica que el proxy de confianza esté configurado (ya solucionado con `TRUST_PROXY=true`)
3. Si usas Replit Eval, puede que necesites ajustar la URL de conexión

---

## 🔧 Script de Diagnóstico Automático

Crea este archivo en tu proyecto de Replit para diagnosticar automáticamente:

```javascript
// diagnose-connection.js (ejecutar en la consola del navegador)
async function diagnoseElizaOSConnection() {
  console.log('🔍 Iniciando diagnóstico...\n');
  
  // Test 1: Variables de entorno
  const url = process.env.NEXT_PUBLIC_ELIZAOS_URL;
  const agentId = process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID;
  
  console.log('1️⃣ Variables de Entorno:');
  console.log('   URL:', url || '❌ NO DEFINIDA');
  console.log('   Agent ID:', agentId || '❌ NO DEFINIDA');
  
  if (!url || !agentId) {
    console.error('\n❌ ERROR: Variables no configuradas. Configúralas en Replit Secrets.');
    return;
  }
  
  // Test 2: API Endpoint
  console.log('\n2️⃣ Probando API Endpoint...');
  try {
    const response = await fetch(`${url}/api/agents`);
    const data = await response.json();
    
    if (data.success && data.data?.agents?.length > 0) {
      const foundAgent = data.data.agents.find(a => a.id === agentId);
      console.log('   ✅ API funciona');
      console.log('   ✅ Agentes encontrados:', data.data.agents.length);
      console.log('   ', foundAgent 
        ? '✅ Tu agente está registrado' 
        : '❌ Tu agente NO está registrado en el servidor');
    } else {
      console.error('   ❌ API no retorna datos válidos');
    }
  } catch (err) {
    console.error('   ❌ Error conectando a API:', err.message);
  }
  
  // Test 3: Health Check
  console.log('\n3️⃣ Probando Health Check...');
  try {
    const response = await fetch(`${url}/healthz`);
    const data = await response.text();
    console.log('   ✅ Servidor está activo:', data);
  } catch (err) {
    console.error('   ❌ Servidor no responde:', err.message);
  }
  
  console.log('\n✅ Diagnóstico completado');
}

// Ejecutar
diagnoseElizaOSConnection();
```

---

## 📋 Checklist Final

Antes de reportar un problema, verifica:

- [ ] Variables de entorno configuradas en Replit (`NEXT_PUBLIC_ELIZAOS_URL`, `NEXT_PUBLIC_ELIZAOS_AGENT_ID`)
- [ ] Variables visibles en el cliente (console.log muestra valores, no `undefined`)
- [ ] Servidor de desarrollo reiniciado después de agregar variables
- [ ] Código de Socket.IO usa `auth: { entityId: ... }` (Socket.IO v4+)
- [ ] URL correcta (sin `/` al final)
- [ ] EntityId correcto: `b6e1a7e7-ba41-068a-bc54-f4221638a4d8`
- [ ] API de agentes funciona (`/api/agents` retorna datos)
- [ ] Health check funciona (`/healthz` retorna OK)
- [ ] Logs de Railway no muestran errores de `TRUST_PROXY` (ya solucionado)
- [ ] No hay errores de CORS en la consola del navegador

---

## 💡 Información Útil

### Entity ID del Agente
```
b6e1a7e7-ba41-068a-bc54-f4221638a4d8
```

### URL del Servidor
```
https://elizahost-production.up.railway.app
```

### Endpoints Útiles
- Health: `https://elizahost-production.up.railway.app/healthz`
- Agentes: `https://elizahost-production.up.railway.app/api/agents`
- WebSocket: `wss://elizahost-production.up.railway.app/socket.io/`

---

## 🆘 Si Nada Funciona

Si después de seguir todos los pasos aún tienes problemas:

1. **Verifica los logs de Railway** en tiempo real mientras intentas conectar
2. **Captura una screenshot** de los errores en la consola del navegador
3. **Comparte el código** de conexión Socket.IO que estás usando en Replit
4. **Verifica la versión** de Socket.IO que estás usando: `npm list socket.io-client`

El problema más común es que las variables `NEXT_PUBLIC_*` no están siendo leídas correctamente por el cliente, o que el código de conexión no está enviando el `entityId` en el formato correcto.
