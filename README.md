# ElizaOS en Railway - Guia Paso a Paso

## Requisitos Previos

Antes de empezar, necesitas:
1. **Cuenta de Railway** - https://railway.com (gratis $5 creditos de prueba)
2. **Cuenta de GitHub** - Para conectar el repositorio
3. **API Keys**:
   - Grok/xAI API Key (https://console.x.ai)
   - Helius API Key (ya la tienes: para Solana RPC)
   - Twitter/X API Keys (si quieres tweets automaticos)
   - Wallet de Solana (clave publica y privada)

---

## Paso 1: Crear Proyecto ElizaOS

### Opcion A: Usar Template de Railway (Mas Facil)

1. Ir a: https://railway.com/new/template/aW47_j
2. Click en "Deploy Now"
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Railway creara automaticamente el proyecto

### Opcion B: Crear desde CLI (Mas Control)

```bash
# Instalar CLI de ElizaOS
bun install -g @elizaos/cli

# Crear nuevo proyecto
elizaos create amica-agent --type project

# Entrar al proyecto
cd amica-agent
```

---

## Paso 2: Configurar Variables de Entorno en Railway

En el dashboard de Railway, ve a tu proyecto > Settings > Variables y agrega:

> **Nota**: Puedes usar el archivo `env.example.txt` como referencia para todas las variables necesarias.

### Variables Obligatorias

```env
# CRITICO - Necesario para Railway
DAEMON_PROCESS=true

# Grok/xAI como LLM (compatible con API de OpenAI)
OPENAI_API_KEY=tu_grok_api_key
OPENAI_API_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-3-latest

# Solana/Blockchain
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=TU_HELIUS_API_KEY
SOLANA_PUBLIC_KEY=tu_wallet_publica
SOLANA_PRIVATE_KEY=tu_wallet_privada
HELIUS_API_KEY=tu_helius_api_key
```

### Variables Opcionales (Twitter - OAuth Tokens Only)

**IMPORTANTE**: Nunca uses username/password directamente. Usa OAuth tokens exclusivamente.

```env
# Twitter/X Integration (OAuth Tokens - Metodo Seguro)
X_API_KEY=tu_api_key
X_API_SECRET=tu_api_secret
X_ACCESS_TOKEN=tu_access_token
X_ACCESS_SECRET=tu_access_secret
X_BEARER_TOKEN=tu_bearer_token
```

> **Nota de Seguridad**: ElizaOS soporta autenticacion via username/password pero esto es un riesgo de seguridad. Siempre usa OAuth tokens obtenidos desde el Twitter Developer Portal (https://developer.twitter.com).

### Variables para Conexion con AMICA

```env
# Puerto para WebSocket (Railway lo asigna automaticamente)
PORT=3000

# Habilitar UI web de ElizaOS (opcional)
ELIZA_UI_ENABLE=true

# Endpoint para AMICA
CORS_ORIGIN=*
```

---

## Paso 3: Configurar Plugins

Edita el archivo `package.json` para incluir los plugins necesarios:

```json
{
  "dependencies": {
    "@elizaos/core": "latest",
    "@elizaos/plugin-bootstrap": "latest",
    "@elizaos/plugin-solana": "latest",
    "@elizaos/plugin-twitter": "latest",
    "@elizaos/plugin-openai": "latest"
  }
}
```

---

## Paso 4: Crear Character File

Crea un archivo `characters/amica-agent.json`:

```json
{
  "name": "AMICA Agent",
  "description": "AI companion with Solana trading capabilities",
  "modelProvider": "openai",
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-solana",
    "@elizaos/plugin-twitter"
  ],
  "clients": ["direct"],
  "bio": [
    "An intelligent AI companion powered by Grok",
    "Expert in Solana blockchain and DeFi trading",
    "Communicates through a 3D/2D avatar interface",
    "Can execute token swaps via Jupiter aggregator",
    "Monitors market trends and provides insights"
  ],
  "lore": [
    "Created to bridge the gap between AI avatars and blockchain autonomy",
    "Powered by ElizaOS framework for autonomous decision making",
    "Connected to AMICA frontend for visual representation"
  ],
  "style": {
    "all": [
      "Professional yet approachable",
      "Clear and concise communication",
      "Data-driven insights",
      "Proactive about market opportunities"
    ],
    "chat": [
      "Friendly conversational tone",
      "Explains complex crypto concepts simply",
      "Provides actionable trading insights"
    ],
    "post": [
      "Engaging social media presence",
      "Market analysis with personality",
      "Witty but informative"
    ]
  },
  "topics": [
    "solana",
    "cryptocurrency",
    "defi",
    "trading",
    "blockchain",
    "web3",
    "nft",
    "market analysis"
  ],
  "adjectives": [
    "intelligent",
    "helpful",
    "analytical",
    "proactive",
    "trustworthy"
  ],
  "settings": {
    "model": "grok-3-latest",
    "temperature": 0.7,
    "maxTokens": 4096,
    "secrets": {
      "SOLANA_PUBLIC_KEY": "{{SOLANA_PUBLIC_KEY}}",
      "SOLANA_PRIVATE_KEY": "{{SOLANA_PRIVATE_KEY}}"
    }
  }
}
```

---

## Paso 5: Desplegar en Railway

### Desde GitHub:

1. Push tu codigo a GitHub:
```bash
git init
git add .
git commit -m "Initial ElizaOS setup"
git remote add origin https://github.com/tu-usuario/amica-elizaos.git
git push -u origin main
```

2. En Railway:
   - Click "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio
   - Railway detectara automaticamente y comenzara el build

### Verificar Despliegue:

1. Ve a la pestana "Deployments" en Railway
2. Espera a que el build termine (2-5 minutos)
3. Verifica los logs para confirmar que inicio correctamente

---

## Paso 6: Verificar Funcionamiento

Una vez desplegado, puedes verificar que todo funciona:

1. Revisa los logs en Railway para asegurarte de que no hay errores
2. El agente deberia estar corriendo en el puerto asignado por Railway
3. Si habilitaste `ELIZA_UI_ENABLE=true`, deberias poder acceder a la UI web

---

## Solucion de Problemas

### Error: DAEMON_PROCESS no configurado
- Asegurate de agregar `DAEMON_PROCESS=true` en las variables de entorno de Railway

### Error: API Key invalida
- Verifica que las API keys esten correctamente configuradas
- Asegurate de que no hay espacios extras al copiar las keys

### Error: Puerto no disponible
- Railway asigna el puerto automaticamente via la variable `PORT`
- No necesitas configurar manualmente el puerto

### El build falla en Railway
- Verifica que `package.json` tiene todas las dependencias necesarias
- Revisa los logs de build para ver el error especifico

---

## Recursos Adicionales

- [Documentacion de ElizaOS](https://elizaos.github.io)
- [Railway Documentation](https://docs.railway.app)
- [Twitter Developer Portal](https://developer.twitter.com)
- [Helius Documentation](https://docs.helius.dev)
