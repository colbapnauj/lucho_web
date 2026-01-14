import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  auth
} from '../../firebase-config-cdn.js';

/**
 * Servicio de autenticación
 */
export class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }
  
  /**
   * Inicia sesión con email y contraseña
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;
      return { 
        success: true, 
        user: userCredential.user 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  /**
   * Crea un nuevo usuario
   */
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;
      return { 
        success: true, 
        user: userCredential.user 
      };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }
  
  /**
   * Cierra sesión
   */
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    return auth.currentUser;
  }
  
  /**
   * Escucha cambios en el estado de autenticación
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      callback(user);
    });
  }
  
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
  
  /**
   * Verifica si el usuario tiene el claim admin
   */
  async isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    try {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims.admin === true || tokenResult.claims.role === 'admin';
    } catch (error) {
      console.error('Error verificando claims:', error);
      return false;
    }
  }
  
  /**
   * Obtiene los claims del usuario actual
   */
  async getUserClaims() {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    try {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims;
    } catch (error) {
      console.error('Error obteniendo claims:', error);
      return null;
    }
  }
  
  /**
   * Convierte códigos de error de Firebase a mensajes legibles
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está en uso',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión'
    };
    
    return errorMessages[errorCode] || 'Error de autenticación';
  }
}
