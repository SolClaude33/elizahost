# Guía para Registrar/Conectar el Agente

## ✅ Estado Actual

Tu agente ya está funcionando en Railway y escuchando en el puerto 3000. Ahora necesitas hacerlo accesible públicamente y configurarlo para que pueda conectarse con AMICA o cualquier frontend.

---

## 📋 Pasos para Registrar/Conectar el Agente

### 1. Obtener la URL Pública de Railway

1. Ve a tu proyecto en Railway: https://railway.app
2. Selecciona tu servicio (el que tiene el agente)
3. Ve a la pestaña **"Settings"**
4. En la sección **"Networking"**, busca **"Generate Domain"** o **"Public URL"**
5. Railway generará una URL pública como: `https://tu-agente-production.up.railway.app`
6. **Copia esta URL** - la necesitarás para conectar AMICA

---

### 2. Configurar Variables de Entorno Adicionales (en Railway)

Ve a **Settings > Variables** en Railway y agrega/verifica estas variables:

#### Para Conectar con AMICA Frontend:

```env
# URL pública de tu agente (la que obtuviste en el paso 1)
ELIZA_PUBLIC_URL=https://tu-agente-production.up.railway.app

# CORS - Permitir conexiones desde AMICA (cambia * por el dominio específico de AMICA si lo conoces)
CORS_ORIGIN=*

# O si AMICA está en un dominio específico:
# CORS_ORIGIN=https://amica.app,https://replit.app

# Habilitar UI web de ElizaOS (opcional)
ELIZA_UI_ENABLE=true

# Token de autenticación (opcional pero recomendado para producción)
ELIZA_SERVER_AUTH_TOKEN=tu_token_secreto_largo_y_aleatorio

# Salt para seguridad (opcional pero recomendado)
SECRET_SALT=una_cadena_aleatoria_larga_y_segura
```

#### Para Conectar con ElizaCloud (si usas la plataforma SaaS):

```env
# Si usas ElizaCloud, necesitarás estas variables:
ELIZA_CLOUD_ENABLED=true
ELIZA_AGENT_ID=tu_agent_id_de_elizacloud
ELIZA_CLOUD_API_KEY=tu_api_key_de_elizacloud
```

---

### 3. Verificar que el Agente está Accesible

#### Opción A: Verificar con cURL

```bash
# Verificar que el servidor responde
curl https://tu-agente-production.up.railway.app/health

# O verificar el endpoint de health check
curl https://tu-agente-production.up.railway.app/healthz
```

Deberías obtener una respuesta como:
```json
{"status":"ok"}
```

#### Opción B: Abrir en el Navegador

1. Abre la URL pública en tu navegador: `https://tu-agente-production.up.railway.app`
2. Deberías ver la UI web de ElizaOS (si `ELIZA_UI_ENABLE=true`)
3. O deberías ver un mensaje de "Agent Server running"

---

### 4. Conectar con AMICA Frontend

Si estás usando AMICA como frontend:

1. **Obtén la URL pública de tu agente** (paso 1)
2. **En AMICA/Replit**, configura la URL del agente:
   - Busca la configuración de "Backend URL" o "Agent URL"
   - Ingresa: `https://tu-agente-production.up.railway.app`
   - Si usas WebSocket, usa: `wss://tu-agente-production.up.railway.app`

3. **Configura CORS en Railway** (ya lo hiciste con `CORS_ORIGIN=*`)

4. **Si AMICA requiere autenticación**, agrega el token:
   - `ELIZA_SERVER_AUTH_TOKEN=tu_token`
   - En AMICA, usa este token en los headers de las peticiones:
     ```
     Authorization: Bearer tu_token
     ```

---

### 5. Endpoints Disponibles del Agente

Una vez configurado, tu agente expone estos endpoints:

- **Health Check**: `GET /health` o `GET /healthz`
- **WebSocket**: `ws://tu-agente-production.up.railway.app` (para mensajería en tiempo real)
- **API REST**: `POST /api/messages` (para enviar mensajes)
- **UI Web**: `GET /` (si `ELIZA_UI_ENABLE=true`)

---

### 6. Verificar Conexión WebSocket

Para probar la conexión WebSocket:

```javascript
// En la consola del navegador o en un script de prueba
const ws = new WebSocket('wss://tu-agente-production.up.railway.app');

ws.onopen = () => {
  console.log('✅ Conectado al agente');
};

ws.onmessage = (event) => {
  console.log('📨 Mensaje recibido:', event.data);
};

ws.onerror = (error) => {
  console.error('❌ Error:', error);
};
```

---

## 🔐 Seguridad Adicional

### Para Producción (Recomendado):

1. **Cambia `CORS_ORIGIN`** de `*` a dominios específicos:
   ```env
   CORS_ORIGIN=https://amica.app,https://tu-dominio.com
   ```

2. **Configura `ELIZA_SERVER_AUTH_TOKEN`**:
   ```env
   ELIZA_SERVER_AUTH_TOKEN=genera_un_token_aleatorio_largo_y_seguro
   ```

3. **Configura `SECRET_SALT`**:
   ```env
   SECRET_SALT=otra_cadena_aleatoria_larga_y_segura
   ```

---

## 📝 Resumen de URLs y Endpoints

Una vez configurado, tendrás:

- **URL Base**: `https://tu-agente-production.up.railway.app`
- **Health Check**: `https://tu-agente-production.up.railway.app/health`
- **WebSocket**: `wss://tu-agente-production.up.railway.app`
- **UI Web**: `https://tu-agente-production.up.railway.app/` (opcional)

---

## 🐛 Troubleshooting

### El agente no es accesible públicamente

1. Verifica que Railway esté ejecutándose correctamente
2. Revisa los logs en Railway para ver errores
3. Asegúrate de que `PORT=3000` esté configurado
4. Verifica que Railway haya generado un dominio público

### Error de CORS al conectar desde AMICA

1. Verifica que `CORS_ORIGIN` incluya el dominio de AMICA
2. Si AMICA está en `https://replit.app`, agrega: `CORS_ORIGIN=https://replit.app`
3. Reinicia el servicio en Railway después de cambiar `CORS_ORIGIN`

### WebSocket no conecta

1. Verifica que uses `wss://` (WebSocket seguro) en lugar de `ws://`
2. Verifica que Railway soporte WebSocket (debería hacerlo automáticamente)
3. Revisa los logs en Railway para errores de conexión

---

## ✅ Checklist Final

- [ ] Agente funcionando en Railway (puerto 3000)
- [ ] URL pública generada en Railway
- [ ] Variables de entorno configuradas (`CORS_ORIGIN`, etc.)
- [ ] Health check responde correctamente
- [ ] WebSocket conecta (si lo necesitas)
- [ ] AMICA/otro frontend configurado con la URL del agente
- [ ] Seguridad configurada (`ELIZA_SERVER_AUTH_TOKEN`, `SECRET_SALT`)

---

## 📚 Recursos Adicionales

- [Documentación de ElizaOS](https://docs.elizaos.ai/)
- [Railway Networking](https://docs.railway.app/deploy/networking)
- [AMICA Documentation](https://github.com/amica-ai/amica)

