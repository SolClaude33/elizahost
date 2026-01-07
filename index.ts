import { Client, start } from "@elizaos/core";
import { TwitterClient } from "@elizaos/plugin-twitter";
import { SolanaProvider } from "@elizaos/plugin-solana";
import { OpenAIProvider } from "@elizaos/plugin-openai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Obtener __dirname equivalente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar configuración del personaje
const characterConfig = JSON.parse(
  readFileSync(join(__dirname, "characters/amica-agent.json"), "utf-8")
);

// Obtener variables de entorno
const port = process.env.PORT || 3000;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiApiBaseUrl = process.env.OPENAI_API_BASE_URL || "https://api.x.ai/v1";
const openaiModel = process.env.OPENAI_MODEL || "grok-3-latest";

// Configurar provider de OpenAI/Grok
const provider = new OpenAIProvider({
  apiKey: openaiApiKey!,
  baseURL: openaiApiBaseUrl,
  model: openaiModel,
});

// Configurar cliente de Twitter (si está disponible)
let twitterClient: TwitterClient | null = null;
if (
  process.env.X_API_KEY &&
  process.env.X_API_SECRET &&
  process.env.X_ACCESS_TOKEN &&
  process.env.X_ACCESS_SECRET
) {
  twitterClient = new TwitterClient({
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
    bearerToken: process.env.X_BEARER_TOKEN,
  });
}

// Configurar provider de Solana (si está disponible)
let solanaProvider: SolanaProvider | null = null;
if (
  process.env.SOLANA_RPC_URL &&
  process.env.SOLANA_PUBLIC_KEY &&
  process.env.SOLANA_PRIVATE_KEY
) {
  solanaProvider = new SolanaProvider({
    rpcUrl: process.env.SOLANA_RPC_URL,
    publicKey: process.env.SOLANA_PUBLIC_KEY,
    privateKey: process.env.SOLANA_PRIVATE_KEY,
  });
}

// Crear cliente con configuración
const clients: Client[] = [];
if (twitterClient) {
  clients.push(twitterClient);
}

// Iniciar el agente
async function main() {
  console.log("🚀 Iniciando AMICA Agent...");
  console.log(`📡 Puerto: ${port}`);
  console.log(`🤖 Modelo: ${openaiModel}`);
  console.log(`🔗 Base URL: ${openaiApiBaseUrl}`);
  
  await start({
    character: characterConfig,
    provider,
    clients,
    databaseAdapter: undefined, // Puedes agregar un adaptador de base de datos si es necesario
    serverPort: parseInt(port.toString()),
  });

  console.log("✅ AMICA Agent iniciado correctamente!");
}

main().catch((error) => {
  console.error("❌ Error al iniciar el agente:", error);
  process.exit(1);
});
