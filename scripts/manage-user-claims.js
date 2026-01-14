#!/usr/bin/env node

/**
 * Script para gestionar claims de usuarios de Firebase Auth
 * 
 * Uso:
 *   node scripts/manage-user-claims.js <comando> [opciones]
 * 
 * Comandos disponibles:
 *   set <email> <claim> <value>    - Asigna un claim a un usuario
 *   remove <email> <claim>         - Remueve un claim de un usuario
 *   get <email>                    - Obtiene los claims de un usuario
 *   list [claim]                   - Lista usuarios con un claim específico
 *   admin <email>                  - Asigna claim admin a un usuario
 *   unadmin <email>                 - Remueve claim admin de un usuario
 * 
 * Ejemplos:
 *   node scripts/manage-user-claims.js set admin@lucho.com role editor
 *   node scripts/manage-user-claims.js remove admin@lucho.com role
 *   node scripts/manage-user-claims.js get admin@lucho.com
 *   node scripts/manage-user-claims.js list admin
 *   node scripts/manage-user-claims.js admin admin@lucho.com
 *   node scripts/manage-user-claims.js unadmin admin@lucho.com
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar service account key
const serviceAccountPath = join(__dirname, '..', 'service-account-key.json');

let serviceAccount;
try {
  const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountFile);
} catch (error) {
  console.error('❌ Error: No se encontró el archivo service-account-key.json');
  console.error('   Por favor, descarga la clave de cuenta de servicio desde Firebase Console:');
  console.error('   https://console.firebase.google.com/project/lucho-web-cms/settings/serviceaccounts/adminsdk');
  console.error('\n   Luego colócalo en la raíz del proyecto como: service-account-key.json');
  process.exit(1);
}

// Inicializar Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'lucho-web-cms'
    });
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error.message);
  process.exit(1);
}

// Obtener argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  showHelp();
  process.exit(1);
}

const command = args[0];

// Ejecutar comando
switch (command) {
  case 'set':
    handleSet(args.slice(1));
    break;
  case 'remove':
    handleRemove(args.slice(1));
    break;
  case 'get':
    handleGet(args.slice(1));
    break;
  case 'list':
    handleList(args.slice(1));
    break;
  case 'admin':
    handleAdmin(args.slice(1), true);
    break;
  case 'unadmin':
    handleAdmin(args.slice(1), false);
    break;
  default:
    console.error(`❌ Comando desconocido: ${command}`);
    showHelp();
    process.exit(1);
}

/**
 * Asigna un claim a un usuario
 */
async function handleSet(args) {
  if (args.length < 3) {
    console.error('❌ Error: Se requieren email, claim y value');
    console.error('   Uso: set <email> <claim> <value>');
    process.exit(1);
  }

  const [email, claim, value] = args;
  
  // Convertir value a tipo apropiado
  let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(value) && value !== '') parsedValue = Number(value);

  try {
    const user = await admin.auth().getUserByEmail(email);
    const currentClaims = user.customClaims || {};
    
    const newClaims = {
      ...currentClaims,
      [claim]: parsedValue
    };

    await admin.auth().setCustomUserClaims(user.uid, newClaims);
    
    console.log('✅ Claim asignado exitosamente');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Claim: ${claim} = ${JSON.stringify(parsedValue)}`);
    console.log('\n📋 Claims actuales:');
    printClaims(newClaims);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: Usuario con email ${email} no encontrado`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Remueve un claim de un usuario
 */
async function handleRemove(args) {
  if (args.length < 2) {
    console.error('❌ Error: Se requieren email y claim');
    console.error('   Uso: remove <email> <claim>');
    process.exit(1);
  }

  const [email, claim] = args;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const currentClaims = user.customClaims || {};
    
    if (!(claim in currentClaims)) {
      console.log(`⚠️  El claim "${claim}" no existe para este usuario`);
      process.exit(0);
    }

    const newClaims = { ...currentClaims };
    delete newClaims[claim];

    await admin.auth().setCustomUserClaims(user.uid, newClaims);
    
    console.log('✅ Claim removido exitosamente');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Claim removido: ${claim}`);
    console.log('\n📋 Claims actuales:');
    printClaims(newClaims);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: Usuario con email ${email} no encontrado`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Obtiene los claims de un usuario
 */
async function handleGet(args) {
  if (args.length < 1) {
    console.error('❌ Error: Se requiere email');
    console.error('   Uso: get <email>');
    process.exit(1);
  }

  const email = args[0];

  try {
    const user = await admin.auth().getUserByEmail(email);
    
    console.log('📋 Información del usuario:');
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email verificado: ${user.emailVerified}`);
    console.log(`   Creado: ${new Date(user.metadata.creationTime).toLocaleString()}`);
    console.log(`   Último login: ${user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Nunca'}`);
    
    const claims = user.customClaims || {};
    
    if (Object.keys(claims).length === 0) {
      console.log('\n⚠️  Este usuario no tiene claims asignados');
    } else {
      console.log('\n📋 Claims:');
      printClaims(claims);
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: Usuario con email ${email} no encontrado`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Lista usuarios con un claim específico
 */
async function handleList(args) {
  const claimFilter = args[0] || null;
  const claimValue = args[1] || null;

  try {
    console.log('🔄 Obteniendo lista de usuarios...');
    
    let nextPageToken;
    const usersWithClaim = [];
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      for (const user of listUsersResult.users) {
        const claims = user.customClaims || {};
        
        if (claimFilter) {
          // Filtrar por claim específico
          if (claimValue !== null) {
            // Filtrar por claim y valor
            if (claims[claimFilter] === claimValue || 
                (claimValue === 'true' && claims[claimFilter] === true) ||
                (claimValue === 'false' && claims[claimFilter] === false)) {
              usersWithClaim.push({ user, claims });
            }
          } else {
            // Filtrar solo por existencia del claim
            if (claimFilter in claims) {
              usersWithClaim.push({ user, claims });
            }
          }
        } else {
          // Mostrar todos los usuarios con claims
          if (Object.keys(claims).length > 0) {
            usersWithClaim.push({ user, claims });
          }
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    if (usersWithClaim.length === 0) {
      if (claimFilter) {
        console.log(`⚠️  No se encontraron usuarios con el claim "${claimFilter}"`);
      } else {
        console.log('⚠️  No se encontraron usuarios con claims asignados');
      }
    } else {
      console.log(`\n✅ Se encontraron ${usersWithClaim.length} usuario(s):\n`);
      
      usersWithClaim.forEach(({ user, claims }, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Claims:`);
        printClaims(claims, '      ');
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Asigna o remueve el claim admin
 */
async function handleAdmin(args, isAdmin) {
  if (args.length < 1) {
    console.error('❌ Error: Se requiere email');
    console.error(`   Uso: ${isAdmin ? 'admin' : 'unadmin'} <email>`);
    process.exit(1);
  }

  const email = args[0];

  try {
    const user = await admin.auth().getUserByEmail(email);
    const currentClaims = user.customClaims || {};
    
    const newClaims = { ...currentClaims };
    
    if (isAdmin) {
      newClaims.admin = true;
      newClaims.role = 'admin';
      console.log('✅ Claim admin asignado exitosamente');
    } else {
      delete newClaims.admin;
      if (newClaims.role === 'admin') {
        delete newClaims.role;
      }
      console.log('✅ Claim admin removido exitosamente');
    }

    await admin.auth().setCustomUserClaims(user.uid, newClaims);
    
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log('\n📋 Claims actuales:');
    printClaims(newClaims);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: Usuario con email ${email} no encontrado`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Imprime los claims de forma legible
 */
function printClaims(claims, indent = '   ') {
  if (Object.keys(claims).length === 0) {
    console.log(`${indent}(ninguno)`);
    return;
  }
  
  Object.entries(claims).forEach(([key, value]) => {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    console.log(`${indent}${key}: ${valueStr}`);
  });
}

/**
 * Muestra la ayuda
 */
function showHelp() {
  console.log(`
📋 Gestión de Claims de Usuarios - Firebase Auth

Uso:
  node scripts/manage-user-claims.js <comando> [opciones]

Comandos disponibles:

  set <email> <claim> <value>
    Asigna un claim a un usuario
    Ejemplo: set admin@lucho.com role editor
    Ejemplo: set admin@lucho.com permissions '["read","write"]'

  remove <email> <claim>
    Remueve un claim de un usuario
    Ejemplo: remove admin@lucho.com role

  get <email>
    Obtiene los claims de un usuario
    Ejemplo: get admin@lucho.com

  list [claim] [value]
    Lista usuarios con claims
    Ejemplo: list                    (todos los usuarios con claims)
    Ejemplo: list admin               (usuarios con claim admin)
    Ejemplo: list admin true          (usuarios con admin=true)

  admin <email>
    Asigna claim admin a un usuario
    Ejemplo: admin admin@lucho.com

  unadmin <email>
    Remueve claim admin de un usuario
    Ejemplo: unadmin admin@lucho.com

Tipos de valores soportados:
  - Boolean: true, false
  - Number: 123, 45.67
  - String: "texto"
  - Array: '["item1","item2"]' (como string JSON)
  - Object: '{"key":"value"}' (como string JSON)
`);
}
