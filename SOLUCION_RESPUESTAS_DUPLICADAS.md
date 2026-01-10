# Solución: Agente Responde Dos Veces

## 🔍 Problema Identificado

El agente está respondiendo dos veces al mismo mensaje. En la imagen se ve claramente que el agente envió dos respuestas casi idénticas sobre la dirección de la wallet de Solana.

## 📊 Análisis de los Logs

Revisando los logs del despliegue, veo estos patrones:

### 1. Múltiples Conexiones Socket.IO

```
[SocketIO Auth] Socket WLLNIxdfXL7XcqnbAAAB authenticated for entity 92550082...
[SocketIO Auth] Socket pLZvsKoha815RXuHAAAD authenticated for entity 92550082...
```

**Problema:** Hay **múltiples conexiones Socket.IO** desde el mismo cliente (entityId: `92550082-1c31-4796-96c9-2c6b28f07241`).

### 2. Múltiples Procesamientos del Mismo Mensaje

```
[SERVICE:MESSAGE-BUS] Received message from central bus (messageId=55674019-9a8f-4b09-b5b6-a84fae0ef07e)
[AMICA Agent] [SERVICE:MESSAGE] Message received (entityId=92550082..., roomId=2baac727-f859-0949-8ddc-63e3d4eab940)
[SERVICE:MESSAGE-BUS] Agent generated response, sending to bus
[SERVICE:MESSAGE-BUS] Received message from central bus (messageId=fd36c1bc-7bac-4d8a-b25c-62a3f35bc424)
[AMICA Agent] [SERVICE:MESSAGE] Message received (entityId=92550082..., roomId=2baac727-f859-0949-8ddc-63e3d4eab940)
[SERVICE:MESSAGE-BUS] Agent generated response, sending to bus
```

**Problema:** El mismo mensaje se está procesando **múltiples veces**, generando múltiples respuestas.

## 🔎 Causas Posibles

### Causa 1: Múltiples Conexiones desde el Frontend (Más Probable)

**Síntoma:** Múltiples sockets conectados con el mismo `entityId`.

**Causa:**
- El frontend (AMICA/Replit) está creando múltiples conexiones Socket.IO sin cerrar las anteriores
- Hay múltiples instancias del componente de conexión montándose
- El efecto de React se está ejecutando múltiples veces (modo desarrollo)

**Solución:**
1. **Verificar código del frontend** - Asegúrate de que solo haya **una conexión Socket.IO activa**
2. **Cerrar conexiones anteriores** - Antes de crear una nueva conexión, cierra la anterior
3. **Usar useEffect con cleanup** - En React, asegúrate de limpiar la conexión cuando el componente se desmonte

**Ejemplo de código correcto (React/Next.js):**
```javascript
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function ChatComponent() {
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Solo crear conexión si no existe
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_ELIZAOS_URL, {
        auth: {
          entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
        },
        transports: ['websocket', 'polling']
      });
      
      socketRef.current.on('connect', () => {
        console.log('✅ Conectado:', socketRef.current.id);
      });
      
      socketRef.current.on('message', (data) => {
        // Procesar mensaje
      });
    }
    
    // Cleanup: cerrar conexión al desmontar
    return () => {
      if (socketRef.current) {
        console.log('🔌 Cerrando conexión Socket.IO...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Array vacío = solo ejecutar una vez
  
  // ...
}
```

### Causa 2: Múltiples Instancias del Agente

**Síntoma:** El mismo agente se está iniciando múltiples veces.

**Causa:**
- Hay múltiples procesos de Node.js ejecutándose
- El script de inicio se está llamando varias veces
- Railway está creando múltiples réplicas del servicio

**Verificación:**
```bash
# En Railway, verifica en los logs cuántas veces se ve:
"[AGENT] Started agents (count=1)"
```

Si ves esto más de una vez, hay múltiples instancias del agente.

**Solución:**
- Verifica que solo haya **una instancia** del servicio en Railway
- Asegúrate de que el script de inicio (`npm start`) solo se ejecute una vez

### Causa 3: Plugin Bootstrap Sincronizando Múltiples Veces

**Síntoma:** Múltiples logs de `syncSingleUser` para el mismo usuario.

**Logs relevantes:**
```
[PLUGIN:BOOTSTRAP] syncSingleUser (type=DM, isDM=true...)
[PLUGIN:BOOTSTRAP] syncSingleUser (type=DM, isDM=true...)
```

**Causa:**
- El plugin bootstrap está procesando el mismo usuario múltiples veces
- Hay múltiples eventos disparando la sincronización

**Solución:**
- Esto es generalmente un comportamiento del plugin, pero si causa problemas, puede ser necesario ajustar la configuración
- Verifica si hay múltiples eventos de conexión/desconexión

### Causa 4: Mensaje Enviado Múltiples Veces desde el Frontend

**Síntoma:** El mismo mensaje se envía varias veces.

**Causa:**
- El botón de envío se está presionando múltiples veces
- Hay múltiples listeners de eventos
- El mensaje se está enviando en cada reconexión

**Solución:**
- Implementar **debouncing** en el botón de envío
- Verificar que el mensaje solo se envíe una vez
- Evitar reenviar mensajes al reconectar

## ✅ Solución Recomendada

### Paso 1: Verificar Conexiones en el Frontend

**En Replit/AMICA, verifica el código de conexión:**

1. Busca dónde se crea la conexión Socket.IO
2. Asegúrate de que solo haya **una instancia** de la conexión
3. Verifica que se cierre correctamente al desmontar el componente

**Ejemplo de verificación:**
```javascript
// Agrega este código para depurar
let connectionCount = 0;

const socket = io(url, {
  auth: { entityId: agentId }
});

socket.on('connect', () => {
  connectionCount++;
  console.log(`🔌 Conexión #${connectionCount} establecida:`, socket.id);
  
  if (connectionCount > 1) {
    console.error('⚠️ ADVERTENCIA: Múltiples conexiones detectadas!');
  }
});
```

### Paso 2: Verificar Logs de Railway

**En Railway, busca estos patrones:**

```bash
# Buscar múltiples inicios del agente
"[AGENT] Started agents"

# Buscar múltiples conexiones del mismo entityId
"[SocketIO Auth] Socket XXX authenticated for entity 92550082..."
```

Si ves múltiples líneas con el mismo `entityId`, hay múltiples conexiones.

### Paso 3: Implementar Deduplicación de Mensajes (Opcional)

Si el problema persiste, puedes implementar deduplicación en el frontend:

```javascript
const processedMessageIds = new Set();

socket.on('message', (data) => {
  const messageId = data.id || data.messageId;
  
  // Ignorar si ya se procesó
  if (processedMessageIds.has(messageId)) {
    console.log('⚠️ Mensaje duplicado ignorado:', messageId);
    return;
  }
  
  processedMessageIds.add(messageId);
  
  // Procesar mensaje normalmente
  handleMessage(data);
  
  // Limpiar IDs antiguos (opcional, para evitar memory leak)
  if (processedMessageIds.size > 100) {
    const oldest = Array.from(processedMessageIds)[0];
    processedMessageIds.delete(oldest);
  }
});
```

## 🔧 Solución Rápida

**Para verificar rápidamente si es un problema del frontend:**

1. Abre la consola del navegador (F12)
2. Busca en los logs cuántas veces se ve `connect` o `authenticated`
3. Si ves múltiples conexiones, el problema está en el frontend

**Para verificar si es un problema del backend:**

1. Revisa los logs de Railway
2. Busca `[AGENT] Started agents (count=1)`
3. Si aparece más de una vez, hay múltiples instancias del agente

## 📝 Código de Ejemplo Corregido

### Frontend (React/Next.js) - Conexión Única

```javascript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useElizaOSConnection() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Solo crear conexión si no existe
    if (socketRef.current?.connected) {
      console.log('✅ Ya hay una conexión activa');
      return;
    }
    
    console.log('🔌 Creando nueva conexión Socket.IO...');
    
    const url = process.env.NEXT_PUBLIC_ELIZAOS_URL;
    const agentId = process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID;
    
    if (!url || !agentId) {
      console.error('❌ Variables de entorno no configuradas');
      return;
    }
    
    socketRef.current = io(url, {
      auth: {
        entityId: agentId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Conectado:', socketRef.current?.id);
      setIsConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('❌ Desconectado');
      setIsConnected(false);
    });
    
    socketRef.current.on('message', (data) => {
      console.log('📨 Mensaje recibido:', data);
      setMessages(prev => [...prev, data]);
    });
    
    socketRef.current.on('error', (error) => {
      console.error('❌ Error Socket.IO:', error);
    });
    
    // Cleanup: cerrar conexión al desmontar
    return () => {
      console.log('🧹 Limpiando conexión Socket.IO...');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, []); // Array vacío = solo ejecutar una vez al montar
  
  const sendMessage = (text: string) => {
    if (!socketRef.current?.connected) {
      console.error('❌ No hay conexión activa');
      return;
    }
    
    socketRef.current.emit('message', {
      text,
      entityId: process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID
    });
  };
  
  return {
    isConnected,
    messages,
    sendMessage
  };
}
```

## 🎯 Acción Inmediata

1. **Revisa el código del frontend en Replit/AMICA** donde se conecta a Socket.IO
2. **Verifica que solo haya una conexión** activa a la vez
3. **Agrega logs** para contar cuántas conexiones se crean
4. **Implementa cleanup** para cerrar conexiones anteriores

## 💡 Nota Importante

El problema más común es que el frontend está creando **múltiples conexiones Socket.IO** sin cerrar las anteriores. Esto causa que cada mensaje se procese una vez por cada conexión activa, resultando en múltiples respuestas.

La solución es asegurarse de que solo haya **una conexión activa** y que se cierre correctamente cuando no se necesite.
