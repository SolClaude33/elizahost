/**
 * Script para obtener el entityId del agente desde el servidor ElizaOS
 * 
 * Uso:
 *   node scripts/get-agent-id.js
 * 
 * O con URL personalizada:
 *   ELIZAOS_URL=https://elizahost-production.up.railway.app node scripts/get-agent-id.js
 */

import https from 'https';
import http from 'http';

const ELIZAOS_URL = process.env.ELIZAOS_URL || process.env.NEXT_PUBLIC_ELIZAOS_URL || 'https://elizahost-production.up.railway.app';

console.log('🔍 Obteniendo entityId del agente...\n');
console.log(`📡 URL del servidor: ${ELIZAOS_URL}\n`);

// Función para hacer petición HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = res.statusCode >= 200 && res.statusCode < 300 
            ? JSON.parse(data) 
            : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData || data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Intentar diferentes endpoints para obtener el entityId
async function getAgentId() {
  const endpoints = [
    '/api/agents',
    '/api/v1/agents',
    '/agents',
    '/api/agent',
    '/health',
    '/healthz'
  ];

  console.log('🔍 Intentando diferentes endpoints...\n');

  // Primero, verificar que el servidor está activo
  try {
    console.log('1️⃣ Verificando salud del servidor...');
    const healthCheck = await makeRequest(`${ELIZAOS_URL}/healthz`);
    if (healthCheck.statusCode === 200) {
      console.log('   ✅ Servidor está activo\n');
    } else {
      console.log(`   ⚠️  Servidor respondió con código ${healthCheck.statusCode}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error al conectar: ${error.message}\n`);
    console.log('   💡 Asegúrate de que el servidor esté desplegado y accesible\n');
  }

  // Intentar obtener lista de agentes
  for (const endpoint of endpoints) {
    try {
      console.log(`2️⃣ Intentando: ${endpoint}`);
      const response = await makeRequest(`${ELIZAOS_URL}${endpoint}`);
      
      if (response.statusCode === 200 && response.data) {
        console.log(`   ✅ Respuesta recibida (${response.statusCode})`);
        
        // Intentar parsear la respuesta
        if (typeof response.data === 'object') {
          console.log('\n📋 Datos recibidos:');
          console.log(JSON.stringify(response.data, null, 2));
          
          // Buscar entityId en diferentes formatos
          let entityId = null;
          
          // Formato: { success: true, data: { agents: [{ id: ... }] } }
          if (response.data.success && response.data.data && response.data.data.agents) {
            if (Array.isArray(response.data.data.agents) && response.data.data.agents.length > 0) {
              entityId = response.data.data.agents[0].id || 
                        response.data.data.agents[0].entityId || 
                        response.data.data.agents[0].agentId;
            }
          }
          // Formato: { agents: [{ id: ... }] }
          else if (response.data.agents && Array.isArray(response.data.agents)) {
            if (response.data.agents.length > 0) {
              entityId = response.data.agents[0].id || 
                        response.data.agents[0].entityId ||
                        response.data.agents[0].agentId;
            }
          }
          // Formato: Array directo
          else if (Array.isArray(response.data)) {
            if (response.data.length > 0) {
              entityId = response.data[0].id || 
                        response.data[0].entityId || 
                        response.data[0].agentId ||
                        response.data[0]._id;
            }
          }
          // Formato: Objeto directo
          else if (response.data.id) {
            entityId = response.data.id;
          } else if (response.data.entityId) {
            entityId = response.data.entityId;
          } else if (response.data.agentId) {
            entityId = response.data.agentId;
          }
          
          if (entityId) {
            console.log('\n✅ ENTITY ID ENCONTRADO:');
            console.log(`   ${entityId}\n`);
            console.log('📝 Para usar en Replit, agrega esta variable de entorno:');
            console.log(`   NEXT_PUBLIC_ELIZAOS_AGENT_ID=${entityId}\n`);
            return entityId;
          }
        }
      } else {
        console.log(`   ⚠️  Código de respuesta: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Si no encontramos el entityId, dar instrucciones alternativas
  console.log('❌ No se pudo obtener el entityId automáticamente.\n');
  console.log('💡 OPCIONES ALTERNATIVAS:\n');
  console.log('1. Revisa los logs de Railway cuando el agente inicia.');
  console.log('   Busca líneas como: "Agent registered" o "entityId: ..."\n');
  console.log('2. El entityId generalmente es un UUID que se genera cuando el agente se registra.');
  console.log('   Formato típico: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n');
  console.log('3. Si usas el plugin bootstrap, el entityId puede estar en la base de datos.');
  console.log('   Revisa los logs de inicialización del agente.\n');
  console.log('4. Prueba hacer una petición manual:');
  console.log(`   curl ${ELIZAOS_URL}/api/agents\n`);
  console.log('5. Si el agente está funcionando, el entityId puede ser el nombre del personaje.');
  console.log('   En tu caso: "AMICA Agent" o una variación.\n');
  
  return null;
}

// Ejecutar
getAgentId().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
