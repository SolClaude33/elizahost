# Configuración de Conexión para tu Agente

## 🌐 Tu Dominio Público

**URL Base**: `https://elizahost-production.up.railway.app`

---

## 📋 Pasos para Configurar

### 1. Configurar Variables de Entorno en Railway

Ve a **Railway > Tu Proyecto > Settings > Variables** y agrega/verifica estas variables:

```env
# URL pública de tu agente
ELIZA_PUBLIC_URL=https://elizahost-production.up.railway.app

# CORS - Permitir conexiones desde AMICA o cualquier frontend
CORS_ORIGIN=*

# Si AMICA está en un dominio específico, usa:
# CORS_ORIGIN=https://amica.app,https://replit.app,https://tu-dominio-amica.com

# Habilitar UI web de ElizaOS
ELIZA_UI_ENABLE=true

# Token de autenticación (opcional pero recomendado)
ELIZA_SERVER_AUTH_TOKEN=genera_un_token_aleatorio_aqui

# Salt para seguridad (opcional pero recomendado)
SECRET_SALT=genera_otra_cadena_aleatoria_aqui
```

---

## 🔗 Endpoints Disponibles

Con tu dominio `https://elizahost-production.up.railway.app`, estos son tus endpoints:

### Endpoints REST:
- **Health Check**: `https://elizahost-production.up.railway.app/health`
- **Health Check (alternativo)**: `https://elizahost-production.up.railway.app/healthz`
- **UI Web**: `https://elizahost-production.up.railway.app/`
- **API Messages**: `https://elizahost-production.up.railway.app/api/messages`

### WebSocket:
- **WebSocket (TLS)**: `wss://elizahost-production.up.railway.app`
- **WebSocket SocketIO**: `wss://elizahost-production.up.railway.app/socket.io`

---

## ✅ Verificar que Funciona

### 1. Health Check

Abre en tu navegador:
```
https://elizahost-production.up.railway.app/health
```

Deberías ver:
```json
{"status":"ok"}
```

### 2. UI Web (si está habilitada)

Abre:
```
https://elizahost-production.up.railway.app/
```

Deberías ver la interfaz web de ElizaOS.

---

## 🔌 Conectar con AMICA

### Opción 1: Si AMICA está en Replit o un dominio específico

1. **En Railway**, configura:
   ```env
   CORS_ORIGIN=https://replit.app,https://amica.app,https://tu-dominio.com
   ```

2. **En AMICA/Replit**, configura:
   - **Backend URL**: `https://elizahost-production.up.railway.app`
   - **WebSocket URL**: `wss://elizahost-production.up.railway.app`

### Opción 2: Si AMICA está en localhost (desarrollo)

1. **En Railway**, mantén:
   ```env
   CORS_ORIGIN=*
   ```

2. **En AMICA local**, configura:
   - **Backend URL**: `https://elizahost-production.up.railway.app`
   - **WebSocket URL**: `wss://elizahost-production.up.railway.app`

---

## 🧪 Probar Conexión WebSocket

Abre la consola del navegador (F12) y ejecuta:

```javascript
const ws = new WebSocket('wss://elizahost-production.up.railway.app');

ws.onopen = () => {
  console.log('✅ Conectado al agente');
};

ws.onmessage = (event) => {
  console.log('📨 Mensaje recibido:', event.data);
};

ws.onerror = (error) => {
  console.error('❌ Error:', error);
};

ws.onclose = () => {
  console.log('🔌 Conexión cerrada');
};
```

---

## 🔐 Seguridad (Recomendado para Producción)

Si vas a usar esto en producción, genera tokens seguros:

### Generar Token Seguro:

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y úsalo como `ELIZA_SERVER_AUTH_TOKEN`.

### Luego en Railway:

```env
ELIZA_SERVER_AUTH_TOKEN=tu_token_generado_aqui
SECRET_SALT=otra_cadena_aleatoria_diferente
```

Y en AMICA, cuando hagas peticiones, incluye el header:
```
Authorization: Bearer tu_token_generado_aqui
```

---

## 📱 Configuración en AMICA (Replit)

Si estás usando AMICA en Replit, necesitas configurar:

1. **Variables de entorno en Replit** (si AMICA las requiere):
   ```env
   BACKEND_URL=https://elizahost-production.up.railway.app
   WEBSOCKET_URL=wss://elizahost-production.up.railway.app
   ```

2. **O en la configuración de AMICA**:
   - Busca la sección de "Backend Configuration"
   - Ingresa: `https://elizahost-production.up.railway.app`
   - Guarda y reinicia AMICA

---

## 🐛 Troubleshooting

### El agente no responde en el navegador

1. Verifica que Railway esté ejecutándose (revisa logs)
2. Verifica que el puerto 3000 esté configurado
3. Espera unos segundos después del despliegue (Railway puede tardar)

### Error de CORS

1. Verifica que `CORS_ORIGIN` incluya el dominio de origen
2. Reinicia el servicio en Railway después de cambiar `CORS_ORIGIN`
3. Si usas `*`, verifica que no haya otros problemas

### WebSocket no conecta

1. Usa `wss://` (no `ws://`) para conexiones seguras
2. Verifica que Railway soporte WebSocket (debería hacerlo automáticamente)
3. Revisa la consola del navegador para errores específicos

---

## ✅ Checklist Rápido

- [x] Dominio público: `https://elizahost-production.up.railway.app`
- [ ] Variable `CORS_ORIGIN` configurada en Railway
- [ ] Variable `ELIZA_UI_ENABLE=true` configurada (opcional)
- [ ] Health check responde: `https://elizahost-production.up.railway.app/health`
- [ ] WebSocket conecta: `wss://elizahost-production.up.railway.app`
- [ ] AMICA configurado con la URL del agente
- [ ] Tokens de seguridad configurados (opcional pero recomendado)

---

## 📝 Resumen de URLs

**Tu agente está disponible en:**
- Base: `https://elizahost-production.up.railway.app`
- Health: `https://elizahost-production.up.railway.app/health`
- WebSocket: `wss://elizahost-production.up.railway.app`
- UI Web: `https://elizahost-production.up.railway.app/`

**Úsalo en AMICA así:**
```
Backend URL: https://elizahost-production.up.railway.app
WebSocket URL: wss://elizahost-production.up.railway.app
```

