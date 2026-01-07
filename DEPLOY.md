# Guía de Despliegue Rápido en Railway

## Pasos Rápidos

### 1. Preparar el Repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial ElizaOS setup for Railway"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/tu-usuario/amica-elizaos.git
git branch -M main
git push -u origin main
```

### 2. Desplegar en Railway

#### Opción A: Desde el Dashboard de Railway

1. Ve a https://railway.com y haz login
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Elige tu repositorio `amica-elizaos`
5. Railway detectará automáticamente el proyecto y comenzará el build

#### Opción B: Usando el Template de Railway

1. Ve a: https://railway.com/new/template/aW47_j
2. Click en "Deploy Now"
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Railway creará automáticamente el proyecto

### 3. Configurar Variables de Entorno

En el dashboard de Railway:

1. Ve a tu proyecto
2. Click en la pestaña "Variables"
3. Agrega todas las variables del archivo `env.example.txt`

**Variables Mínimas Requeridas:**

- `DAEMON_PROCESS=true` (CRÍTICO)
- `OPENAI_API_KEY` (tu Grok API key)
- `OPENAI_API_BASE_URL=https://api.x.ai/v1`
- `OPENAI_MODEL=grok-3-latest`
- `SOLANA_RPC_URL` (con tu Helius API key)
- `SOLANA_PUBLIC_KEY`
- `SOLANA_PRIVATE_KEY`

### 4. Verificar el Despliegue

1. Ve a la pestaña "Deployments" en Railway
2. Espera a que el build termine (2-5 minutos)
3. Revisa los logs para confirmar que inició correctamente
4. Si ves "✅ AMICA Agent iniciado correctamente!" en los logs, todo está funcionando

### 5. Obtener la URL

1. Ve a la pestaña "Settings" de tu servicio
2. Busca "Generate Domain"
3. Railway generará una URL pública para tu agente

---

## Solución de Problemas

### El build falla

- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build para ver el error específico
- Asegúrate de que `tsconfig.json` está correctamente configurado

### El agente no inicia

- Verifica que `DAEMON_PROCESS=true` está configurado
- Revisa que todas las API keys son válidas
- Verifica los logs para mensajes de error específicos

### Error de módulos no encontrados

- Asegúrate de que el script `copy-assets.js` se ejecutó correctamente
- Verifica que el directorio `dist/characters` existe después del build

---

## Próximos Pasos

Una vez desplegado exitosamente:

1. Conecta tu frontend AMICA a la URL de Railway
2. Configura el WebSocket para comunicación en tiempo real
3. Prueba las funcionalidades de Solana y Twitter

---

## Monitoreo

Railway proporciona:

- Logs en tiempo real
- Métricas de uso de recursos
- Alertas automáticas si el servicio se cae
