// Botón de publicación en el admin
// Se puede agregar al admin.html para trigger el build

class PublishController {
  constructor() {
    this.setupPublishButton();
  }
  
  setupPublishButton() {
    // Crear botón de publicación si no existe
    const adminHeader = document.querySelector('.admin-header');
    if (!adminHeader) return;
    
    const publishBtn = document.createElement('button');
    publishBtn.className = 'btn-publish';
    publishBtn.innerHTML = '<i class="fas fa-rocket"></i> Publicar';
    publishBtn.addEventListener('click', () => this.handlePublish());
    
    // Insertar después del título
    const title = adminHeader.querySelector('h1');
    if (title) {
      title.insertAdjacentElement('afterend', publishBtn);
    }
  }
  
  async handlePublish() {
    if (!confirm('¿Estás seguro de publicar los cambios? Esto generará un nuevo build y desplegará el sitio.')) {
      return;
    }
    
    const btn = document.querySelector('.btn-publish');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    }
    
    try {
      // Opción 1: Trigger GitHub Actions (si tienes el repo conectado)
      const response = await fetch('https://api.github.com/repos/USER/REPO/dispatches', {
        method: 'POST',
        headers: {
          'Authorization': `token YOUR_GITHUB_TOKEN`,
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          event_type: 'publish'
        })
      });
      
      if (response.ok) {
        this.showNotification('Publicación iniciada. El build se completará en unos minutos.', 'success');
      } else {
        throw new Error('Error al trigger el build');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Opción 2: Usar Cloud Function
      try {
        const user = window.firebaseSDK?.auth?.currentUser;
        if (!user) {
          throw new Error('No autenticado');
        }
        
        const token = await user.getIdToken();
        const functionResponse = await fetch('https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (functionResponse.ok) {
          this.showNotification('Publicación iniciada exitosamente', 'success');
        } else {
          throw new Error('Error en Cloud Function');
        }
      } catch (functionError) {
        console.error('Error en Cloud Function:', functionError);
        this.showNotification('Error al publicar. Intenta manualmente con: npm run build', 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-rocket"></i> Publicar';
      }
    }
  }
  
  showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.style.display = 'block';
      
      setTimeout(() => {
        notification.style.display = 'none';
      }, 5000);
    }
  }
}

// Inicializar cuando el admin esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.adminController) {
      window.publishController = new PublishController();
    }
  });
} else {
  if (window.adminController) {
    window.publishController = new PublishController();
  }
}
