// Firebase Initialization desde CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Configuración del proyecto lucho-web-cms
const firebaseConfig = {
  apiKey: "AIzaSyAA-cqXn0EPGa5fnoFcHrGt1oNz2ev4Xo0",
  authDomain: "lucho-web-cms.firebaseapp.com",
  databaseURL: "https://lucho-web-cms-default-rtdb.firebaseio.com",
  projectId: "lucho-web-cms",
  storageBucket: "lucho-web-cms.firebasestorage.app",
  messagingSenderId: "622374714670",
  appId: "1:622374714670:web:fcf7045d13b0aa42458ebf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Exportar todo para uso en otros módulos
window.firebaseSDK = {
  // App
  app,
  
  // Services
  database,
  auth,
  storage,
  functions,
  
  // Auth functions
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  
  // Database functions
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue
};

// También exportar como módulo ES6
export {
  app,
  database,
  auth,
  storage,
  functions,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue
};
