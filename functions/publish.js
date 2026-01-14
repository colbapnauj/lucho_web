/**
 * Cloud Function para publicar el sitio estático
 * 
 * Esta función:
 * 1. Verifica autenticación y permisos de admin
 * 2. Hace un commit vacío a GitHub para disparar GitHub Actions
 * 3. GitHub Actions automáticamente hace build y deploy a Netlify
 * 
 * Trigger: HTTP request desde el admin panel
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.publish = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  try {
    // Verificar autenticación
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Verificar que el usuario sea admin
    const user = await admin.auth().getUser(decodedToken.uid);
    const customClaims = user.customClaims || {};
    
    if (!customClaims.admin && customClaims.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden publicar' });
    }
    
    console.log(`🚀 Iniciando proceso de publicación por usuario: ${user.email}`);
    
    // Obtener configuración de GitHub desde Firebase Functions config
    const githubConfig = functions.config().github || {};
    const githubToken = githubConfig.token;
    const githubOwner = githubConfig.owner;
    const githubRepo = githubConfig.repo;
    const githubBranch = githubConfig.branch || 'main';
    
    if (!githubToken || !githubOwner || !githubRepo) {
      console.error('❌ Configuración de GitHub incompleta');
      return res.status(500).json({
        error: 'Configuración de GitHub incompleta',
        message: 'Se requieren github.token, github.owner y github.repo en Firebase Functions config'
      });
    }
    
    
    // Verificar que el repositorio existe y es accesible
    console.log(`🔍 Verificando acceso al repositorio: ${githubOwner}/${githubRepo}`);
    const repoCheckResponse = await makeGitHubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}`,
      'GET',
      githubToken
    );
    
    if (!repoCheckResponse.ok) {
      const errorData = await repoCheckResponse.text();
      console.error(`❌ Error al verificar repositorio: ${repoCheckResponse.status} - ${errorData}`);
      throw new Error(`Repositorio no encontrado o sin acceso: ${githubOwner}/${githubRepo}. Verifica que el repositorio existe y el token tiene permisos.`);
    }
    
    const repoData = await repoCheckResponse.json();
    console.log(`✅ Repositorio verificado: ${repoData.full_name}`);
    
    // Crear un commit vacío usando GitHub API
    // Esto disparará automáticamente GitHub Actions
    const commitMessage = `🚀 Publicación automática desde CMS - ${new Date().toISOString()}`;
    
    // Paso 1: Obtener el SHA del commit actual de la rama
    console.log(`🔍 Obteniendo referencia de la rama: ${githubBranch}`);
    let getRefResponse = await makeGitHubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/refs/heads/${githubBranch}`,
      'GET',
      githubToken
    );
    
    // Si la rama 'main' no existe, intentar con 'master'
    if (!getRefResponse.ok && getRefResponse.status === 404 && githubBranch === 'main') {
      console.log(`⚠️ Rama 'main' no encontrada, intentando con 'master'...`);
      getRefResponse = await makeGitHubRequest(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/refs/heads/master`,
        'GET',
        githubToken
      );
      
      if (getRefResponse.ok) {
        githubBranch = 'master';
      }
    }
    
    if (!getRefResponse.ok) {
      const errorData = await getRefResponse.text();
      console.error(`❌ Error al obtener referencia: ${getRefResponse.status} - ${errorData}`);
      throw new Error(`Error al obtener referencia de la rama '${githubBranch}': ${getRefResponse.status} - ${errorData}`);
    }
    
    const refData = await getRefResponse.json();
    const currentSha = refData.object.sha;
    console.log(`✅ SHA actual obtenido: ${currentSha.substring(0, 7)}`);
    
    // Paso 2: Obtener el árbol del commit actual
    const getCommitResponse = await makeGitHubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/commits/${currentSha}`,
      'GET',
      githubToken
    );
    
    if (!getCommitResponse.ok) {
      throw new Error(`Error al obtener commit: ${getCommitResponse.status}`);
    }
    
    const commitData = await getCommitResponse.json();
    const treeSha = commitData.tree.sha;
    
    // Paso 3: Crear un nuevo commit vacío (usando el mismo árbol)
    // Formato de fecha para GitHub: ISO 8601 con formato específico
    const now = new Date();
    const gitDate = now.toISOString().replace(/\.\d{3}Z$/, 'Z'); // Remover milisegundos si es necesario
    
    const newCommitData = {
      message: commitMessage,
      tree: treeSha,
      parents: [currentSha],
      author: {
        name: 'CMS Bot',
        email: 'cms@lucho-web.com',
        date: gitDate
      },
      committer: {
        name: 'CMS Bot',
        email: 'cms@lucho-web.com',
        date: gitDate
      }
    };
    
    console.log(`🔨 Creando commit vacío...`);
    console.log(`   Tree SHA: ${treeSha.substring(0, 7)}`);
    console.log(`   Parent SHA: ${currentSha.substring(0, 7)}`);
    
    const createCommitResponse = await makeGitHubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/commits`,
      'POST',
      githubToken,
      newCommitData
    );
    
    if (!createCommitResponse.ok) {
      const errorText = await createCommitResponse.text();
      let errorMessage = `Error al crear commit: ${createCommitResponse.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.message || errorText}`;
        if (errorJson.errors) {
          errorMessage += ` (Errores: ${JSON.stringify(errorJson.errors)})`;
        }
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    const newCommit = await createCommitResponse.json();
    const newCommitSha = newCommit.sha;
    
    // Paso 4: Actualizar la referencia de la rama
    const updateRefData = {
      sha: newCommitSha,
      force: false
    };
    
    const updateRefResponse = await makeGitHubRequest(
      `https://api.github.com/repos/${githubOwner}/${githubRepo}/git/refs/heads/${githubBranch}`,
      'PATCH',
      githubToken,
      updateRefData
    );
    
    if (!updateRefResponse.ok) {
      const errorText = await updateRefResponse.text();
      throw new Error(`Error al actualizar referencia: ${updateRefResponse.status} - ${errorText}`);
    }
    
    console.log(`✅ Commit creado exitosamente: ${newCommitSha}`);
    console.log(`✅ GitHub Actions debería iniciarse automáticamente`);
    
    res.json({
      success: true,
      message: 'Publicación iniciada exitosamente',
      commitSha: newCommitSha,
      commitUrl: `https://github.com/${githubOwner}/${githubRepo}/commit/${newCommitSha}`,
      actionsUrl: `https://github.com/${githubOwner}/${githubRepo}/actions`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en publicación:', error);
    res.status(500).json({
      error: 'Error al publicar',
      message: error.message
    });
  }
});

/**
 * Helper function para hacer requests a GitHub API
 * Retorna un objeto Response-like con métodos .ok, .json(), .text()
 */
function makeGitHubRequest(url, method = 'GET', token, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Firebase-Cloud-Function',
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        // Crear un objeto Response-like
        const response = {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          json: () => Promise.resolve(JSON.parse(responseData)),
          text: () => Promise.resolve(responseData)
        };
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}
