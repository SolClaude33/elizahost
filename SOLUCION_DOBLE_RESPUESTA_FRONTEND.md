# Solución: Doble Respuesta de Nyako (Frontend)

## 🔍 Problema Identificado

El agente Nyako está respondiendo **dos veces** al mismo mensaje. En los logs del frontend, veo que se reciben múltiples eventos para el mismo mensaje:

```javascript
Info [useSocketChat] Received raw messageBroadcast data: (source=client) {"text":"Executing action: REPLY"...}
Info [useSocketChat] Received raw messageBroadcast data: (source=client) {"text":"Generated reply: ¡No tengo..."...}
Info [useSocketChat] Received raw messageBroadcast data: (source=client) {"text":"¡No tengo el precio..."...}
```

**Problema:** El frontend está renderizando **todos** los eventos, incluyendo los eventos intermedios (`agent_action`) y la respuesta final (`agent_response`).

---

## ✅ Solución: Filtrar Eventos Intermedios

El sistema ElizaOS envía **tres tipos de eventos** para cada respuesta:

1. **`agent_action`** - Cuando el agente comienza a procesar (ejecutando acción)
2. **`agent_action`** (updated) - Cuando la acción se completa
3. **`agent_response`** - La respuesta final del agente

### El Problema

El frontend está mostrando **todos** estos eventos, resultando en:
- Primera respuesta: "Executing action: REPLY" o mensaje intermedio
- Segunda respuesta: "Generated reply: ..." o mensaje intermedio
- Tercera respuesta: La respuesta final real

### La Solución

**Filtrar** los eventos `agent_action` y solo mostrar `agent_response` o mensajes del tipo `client_chat`.

---

## 🔧 Implementación en el Frontend

### Opción 1: Filtrar por Tipo de Source (Recomendado)

En tu código del frontend (Replit/AMICA), agrega este filtro:

```javascript
socket.on('messageBroadcast', (data) => {
  // FILTRAR: Solo mostrar respuestas finales, no acciones intermedias
  if (data.source === 'agent_action') {
    // Ignorar eventos de acción (son intermediarios)
    console.log('⚠️ Ignorando evento intermedio:', data.source);
    return;
  }
  
  // Mostrar solo respuestas finales del agente o mensajes del usuario
  if (data.source === 'agent_response' || data.source === 'client_chat') {
    // Procesar mensaje normalmente
    handleMessage(data);
  }
});
```

### Opción 2: Filtrar por Contenido del Texto

```javascript
socket.on('messageBroadcast', (data) => {
  // FILTRAR: Ignorar mensajes que empiezan con "Executing action" o "Generated reply"
  if (data.text && (
    data.text.startsWith('Executing action:') || 
    data.text.startsWith('Generated reply:')
  )) {
    console.log('⚠️ Ignorando mensaje intermedio:', data.text.substring(0, 50));
    return;
  }
  
  // Procesar solo mensajes finales
  handleMessage(data);
});
```

### Opción 3: Usar Solo agent_response (Más Estricto)

```javascript
socket.on('messageBroadcast', (data) => {
  // SOLO mostrar respuestas finales del agente
  if (data.source === 'agent_response') {
    handleMessage(data);
  }
  // También mostrar mensajes del usuario
  else if (data.source === 'client_chat' && data.senderName === 'user') {
    handleMessage(data);
  }
  // Ignorar todo lo demás (agent_action, etc.)
});
```

---

## 📊 Tipos de Eventos en ElizaOS

| Tipo | Descripción | ¿Mostrar? |
|------|-------------|-----------|
| `client_chat` | Mensaje del usuario | ✅ Sí |
| `agent_action` | Acción intermedia del agente | ❌ No (intermedio) |
| `agent_response` | Respuesta final del agente | ✅ Sí |

---

## 🔍 Verificación en los Logs

Para verificar qué eventos estás recibiendo, agrega este log:

```javascript
socket.on('messageBroadcast', (data) => {
  console.log('📨 Evento recibido:', {
    source: data.source,
    sender: data.senderName,
    text: data.text?.substring(0, 50),
    type: data.type
  });
  
  // Tu lógica de filtrado aquí...
});
```

Deberías ver algo como:

```
📨 Evento recibido: { source: 'agent_action', sender: 'Nyako', text: 'Executing action: REPLY', ... }
📨 Evento recibido: { source: 'agent_action', sender: 'Nyako', text: 'Generated reply: ¡Jaja...', ... }
📨 Evento recibido: { source: 'agent_response', sender: 'Nyako', text: '¡Jaja, Fartcoin!...', ... }
```

**Solución:** Solo mostrar el último (`agent_response`).

---

## ✅ Solución Rápida (Copiar y Pegar)

Reemplaza tu handler de `messageBroadcast` con este código:

```javascript
// Handler mejorado que filtra mensajes duplicados
socket.on('messageBroadcast', (data) => {
  // Obtener el ID del mensaje para deduplicación
  const messageId = data.id;
  
  // 1. FILTRAR: Ignorar eventos de acción intermedia
  if (data.source === 'agent_action') {
    console.log('⚠️ Ignorando acción intermedia:', messageId);
    return; // No mostrar acciones intermedias
  }
  
  // 2. FILTRAR: Ignorar mensajes que empiezan con "Executing" o "Generated"
  if (data.text && (
    data.text.startsWith('Executing action:') || 
    data.text.startsWith('Generated reply:')
  )) {
    console.log('⚠️ Ignorando mensaje intermedio:', messageId);
    return;
  }
  
  // 3. DEDUPLICACIÓN: Evitar mostrar el mismo mensaje dos veces
  const isDuplicate = processedMessageIds.has(messageId);
  if (isDuplicate) {
    console.log('⚠️ Mensaje duplicado ignorado:', messageId);
    return;
  }
  
  // 4. Agregar a la lista de procesados
  processedMessageIds.add(messageId);
  
  // 5. MOSTRAR: Solo mensajes finales del agente o del usuario
  if (data.source === 'agent_response' || 
      (data.source === 'client_chat' && data.senderName === 'user')) {
    handleMessage(data); // Tu función para mostrar el mensaje
  }
});

// Set para rastrear mensajes procesados
const processedMessageIds = new Set();
```

---

## 🎯 Código Completo de Ejemplo

```javascript
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function ChatComponent() {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const processedIdsRef = useRef(new Set());
  
  useEffect(() => {
    // Crear conexión
    const url = process.env.NEXT_PUBLIC_ELIZAOS_URL;
    const agentId = process.env.NEXT_PUBLIC_ELIZAOS_AGENT_ID;
    
    socketRef.current = io(url, {
      auth: { entityId: agentId },
      transports: ['websocket', 'polling']
    });
    
    // Handler mejorado con filtrado
    socketRef.current.on('messageBroadcast', (data) => {
      const messageId = data.id;
      
      // FILTRAR 1: Ignorar acciones intermedias
      if (data.source === 'agent_action') {
        return;
      }
      
      // FILTRAR 2: Ignorar mensajes intermedios
      if (data.text?.startsWith('Executing action:') || 
          data.text?.startsWith('Generated reply:')) {
        return;
      }
      
      // FILTRAR 3: Deduplicación
      if (processedIdsRef.current.has(messageId)) {
        return;
      }
      processedIdsRef.current.add(messageId);
      
      // MOSTRAR: Solo respuestas finales
      if (data.source === 'agent_response' || 
          (data.source === 'client_chat' && data.senderName === 'user')) {
        setMessages(prev => [...prev, data]);
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.senderName}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Próximos Pasos

1. **Aplica el filtro** en tu código del frontend
2. **Prueba enviando un mensaje** al agente
3. **Verifica en la consola** que solo se muestre una respuesta
4. **Si persiste**, verifica que no haya múltiples instancias del componente montándose

---

## 💡 Nota Importante

El problema **NO está en Railway ni en el agente**. El agente está funcionando correctamente y enviando los eventos esperados. El problema está en el **frontend que está renderizando eventos intermedios** que no deberían mostrarse al usuario.

La solución es **filtrar estos eventos** antes de mostrarlos en la UI.