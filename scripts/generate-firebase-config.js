#!/usr/bin/env node

/**
 * Genera firebase-config.generated.js a partir de .env o variables de entorno.
 * Uso: node scripts/generate-firebase-config.js
 * En Netlify/CI, configura las variables de entorno con prefijo VITE_FIREBASE_*
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function loadEnv() {
  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const apiKey = process.env.VITE_FIREBASE_API_KEY;
const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN;
const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.VITE_FIREBASE_APP_ID;

const missing = [];
if (!apiKey) missing.push('VITE_FIREBASE_API_KEY');
if (!authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!databaseURL) missing.push('VITE_FIREBASE_DATABASE_URL');
if (!projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
if (!storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!appId) missing.push('VITE_FIREBASE_APP_ID');

if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno para Firebase:');
  missing.forEach((m) => console.error('   -', m));
  console.error('\n   Copia .env.example a .env y rellena los valores, o configura las variables en Netlify/CI.');
  process.exit(1);
}

const output = `// Generado por scripts/generate-firebase-config.js - no editar a mano
export const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  databaseURL: "${databaseURL}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}"
};
`;

const outPath = join(rootDir, 'firebase-config.generated.js');
writeFileSync(outPath, output, 'utf8');
console.log('✅ firebase-config.generated.js generado correctamente');
