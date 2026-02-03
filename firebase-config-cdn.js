// Firebase Configuration usando CDN
// Re-exporta desde firebase-init.js

export {
  database,
  auth,
  storage,
  functions,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  app as default
} from './firebase-init.js';
