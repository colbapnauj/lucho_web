#!/usr/bin/env node

/**
 * Script para crear un usuario admin usando Firebase Admin SDK
 * 
 * Uso:
 *   node scripts/create-admin-user.js <email> <password>
 * 
 * Ejemplo:
 *   node scripts/create-admin-user.js admin@lucho.com password123
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
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'lucho-web-cms'
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // La app ya está inicializada, continuar
  } else {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    process.exit(1);
  }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Se requieren email y contraseña');
  console.error('\nUso:');
  console.error('  node scripts/create-admin-user.js <email> <password>');
  console.error('\nEjemplo:');
  console.error('  node scripts/create-admin-user.js admin@lucho.com password123');
  process.exit(1);
}

const [email, password] = args;

// Validar email
if (!email.includes('@')) {
  console.error('❌ Error: El email no es válido');
  process.exit(1);
}

// Validar contraseña
if (password.length < 6) {
  console.error('❌ Error: La contraseña debe tener al menos 6 caracteres');
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('🔄 Creando usuario admin...');
    console.log(`   Email: ${email}`);
    
    // Crear usuario
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });
    
    console.log('✅ Usuario creado exitosamente');
    console.log(`   UID: ${userRecord.uid}`);
    
    // Asignar custom claim "admin"
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('✅ Claim "admin" asignado exitosamente');
    console.log('\n📋 Resumen:');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Claims: { admin: true, role: 'admin' }`);
    console.log('\n✅ Usuario admin creado y configurado correctamente');
    console.log('   Ahora puedes iniciar sesión en admin.html con estas credenciales');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  El usuario ya existe. Actualizando claims...');
      
      // Obtener el usuario existente
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Actualizar claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: 'admin'
      });
      
      console.log('✅ Claims actualizados exitosamente');
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Claims: { admin: true, role: 'admin' }`);
      console.log('\n✅ Usuario configurado como admin');
      
      // Opcional: actualizar contraseña si se proporcionó
      if (password) {
        try {
          await admin.auth().updateUser(userRecord.uid, {
            password: password
          });
          console.log('✅ Contraseña actualizada');
        } catch (pwdError) {
          console.warn('⚠️  No se pudo actualizar la contraseña:', pwdError.message);
        }
      }
      
      process.exit(0);
    } else {
      console.error('❌ Error:', error.message);
      console.error('   Código:', error.code);
      process.exit(1);
    }
  }
}

// Ejecutar
createAdminUser();
