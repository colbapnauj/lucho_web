// Admin Controller
import { AuthService } from './src/services/AuthService.js';
import { ContentService } from './src/services/ContentService.js';
import { ProjectModel } from './src/models/ProjectModel.js';
import { TestimonialModel } from './src/models/TestimonialModel.js';
import { FAQModel } from './src/models/FAQModel.js';
import { uploadImageToCloudinary } from './src/utils/cloudinary-config.js';

class AdminController {
  constructor() {
    this.authService = new AuthService();
    this.contentService = new ContentService();
    this.currentSection = null;
    this.currentContent = null;
    
    this.init();
  }
  
  async init() {
    this.setupAuth();
    this.setupEventListeners();
    this.checkAuthState();
  }
  
  /**
   * Configura la autenticación
   */
  setupAuth() {
    this.authService.onAuthStateChange(async (user) => {
      if (user) {
        // Verificar si el usuario es admin
        const isAdmin = await this.authService.isAdmin();
        if (isAdmin) {
          this.showAdminPanel();
          this.loadContent();
        } else {
          // Usuario no es admin, cerrar sesión y mostrar error
          await this.authService.logout();
          this.showLoginScreen();
          this.showNotification('Acceso denegado. Solo usuarios admin pueden acceder.', 'error');
        }
      } else {
        this.showLoginScreen();
      }
    });
  }
  
  /**
   * Verifica el estado de autenticación al cargar
   */
  async checkAuthState() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const isAdmin = await this.authService.isAdmin();
      if (isAdmin) {
        this.showAdminPanel();
        this.loadContent();
      } else {
        await this.authService.logout();
        this.showLoginScreen();
        // Mostrar error en el login screen
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
          errorDiv.textContent = 'Acceso denegado. Solo usuarios admin pueden acceder.';
          errorDiv.style.display = 'block';
        }
      }
    } else {
      this.showLoginScreen();
    }
  }
  
  /**
   * Muestra la pantalla de login
   */
  showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
  }
  
  /**
   * Muestra el panel de administración
   */
  showAdminPanel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
    const user = this.authService.getCurrentUser();
    if (user) {
      document.getElementById('user-email').textContent = user.email;
    }
  }
  
  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.showSection(section);
      });
    });
    
    // Form submissions
    document.querySelectorAll('.admin-form').forEach(form => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    });
    
    // Add buttons
    document.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        this.showAddModal(type);
      });
    });
    
    // Modal close
    const modal = document.getElementById('modal');
    const modalClose = modal?.querySelector('.modal-close');
    const modalOverlay = modal?.querySelector('.modal-overlay');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => this.closeModal());
    }
    
    // Upload buttons
    document.querySelectorAll('.btn-upload').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const field = btn.dataset.field;
        this.handleImageUpload(field);
      });
    });
    
    // Preview buttons for Hero
    const heroPreviewToggle = document.getElementById('hero-preview-toggle');
    const heroPreviewInline = document.getElementById('hero-preview-inline');
    const heroClosePreview = document.getElementById('hero-close-preview');
    
    if (heroPreviewToggle) {
      heroPreviewToggle.addEventListener('click', () => this.toggleHeroPreview());
    }
    if (heroPreviewInline) {
      heroPreviewInline.addEventListener('click', () => this.toggleHeroPreview());
    }
    if (heroClosePreview) {
      heroClosePreview.addEventListener('click', () => this.toggleHeroPreview());
    }
    
    // Real-time preview updates for Hero
    const heroForm = document.getElementById('hero-form');
    if (heroForm) {
      heroForm.addEventListener('input', (e) => {
        if (e.target.matches('input[data-preview-target]')) {
          this.updateHeroPreview(e.target);
        }
      });
      heroForm.addEventListener('change', (e) => {
        if (e.target.matches('input[data-preview-target]')) {
          this.updateHeroPreview(e.target);
        }
      });
    }
    
    // Publish button
    const publishBtn = document.getElementById('btn-publish');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.handlePublish());
    }
  }
  
  /**
   * Maneja el login
   */
  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.style.display = 'none';
    
    const result = await this.authService.login(email, password);
    
    if (result.success) {
      // Verificar si el usuario es admin
      const isAdmin = await this.authService.isAdmin();
      if (isAdmin) {
        this.showAdminPanel();
        await this.loadContent();
      } else {
        // Usuario no es admin, cerrar sesión
        await this.authService.logout();
        errorDiv.textContent = 'Acceso denegado. Solo usuarios admin pueden acceder.';
        errorDiv.style.display = 'block';
      }
    } else {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
    }
  }
  
  /**
   * Maneja el logout
   */
  async handleLogout() {
    await this.authService.logout();
    this.showLoginScreen();
  }
  
  /**
   * Carga el contenido desde Firebase
   */
  async loadContent() {
    try {
      this.currentContent = await this.contentService.getAllContent();
      this.renderContent();
    } catch (error) {
      console.error('Error loading content:', error);
      this.showNotification('Error al cargar el contenido', 'error');
    }
  }
  
  /**
   * Renderiza el contenido en los formularios
   */
  renderContent() {
    if (!this.currentContent) return;
    
    // Render Hero
    if (this.currentContent.hero) {
      this.renderHero(this.currentContent.hero);
    }
    
    // Render Services
    if (this.currentContent.services) {
      this.fillForm('services', this.currentContent.services);
    }
    
    // Render Projects
    if (this.currentContent.projects) {
      this.renderProjectsList(this.currentContent.projects);
    }
    
    // Render Testimonials
    if (this.currentContent.testimonials) {
      this.renderTestimonialsList(this.currentContent.testimonials);
    }
    
    // Render FAQ
    if (this.currentContent.faq) {
      this.renderFAQList(this.currentContent.faq);
    }
    
    // Render Localities
    if (this.currentContent.localities) {
      this.renderLocalitiesList(this.currentContent.localities);
    }
    
    // Render Footer
    if (this.currentContent.footer) {
      this.fillForm('footer', this.currentContent.footer);
    }
  }
  
  /**
   * Llena un formulario con datos
   */
  fillForm(sectionName, data) {
    const form = document.querySelector(`form[data-section="${sectionName}"]`);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key];
        // Si es una imagen, mostrar preview
        if (key.includes('image') || key.includes('Image') || key.includes('Url')) {
          this.updateImagePreview(input.name, data[key]);
        }
      }
    });
  }
  
  /**
   * Muestra una sección específica
   */
  showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
      section.style.display = 'block';
      this.currentSection = sectionName;
      
      // Actualizar título
      const titles = {
        hero: 'Sección Hero',
        services: 'Sección Servicios',
        projects: 'Gestión de Proyectos',
        testimonials: 'Gestión de Testimonios',
        faq: 'Gestión de Preguntas Frecuentes',
        localities: 'Gestión de Localidades',
        footer: 'Configuración del Footer'
      };
      document.getElementById('section-title').textContent = titles[sectionName] || 'Panel de Administración';
      
      // Actualizar navegación activa
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
          item.classList.add('active');
        }
      });
    }
  }
  
  /**
   * Maneja el envío de formularios
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const sectionName = form.dataset.section;
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    try {
      await this.contentService.saveSection(sectionName, data);
      this.showNotification('Contenido guardado exitosamente', 'success');
      await this.loadContent();
    } catch (error) {
      console.error('Error saving section:', error);
      this.showNotification('Error al guardar el contenido', 'error');
    }
  }
  
  /**
   * Renderiza la lista de proyectos
   */
  renderProjectsList(projects) {
    const list = document.getElementById('projects-list');
    if (!list) return;
    
    if (!Array.isArray(projects) || projects.length === 0) {
      list.innerHTML = '<p>No hay proyectos agregados</p>';
      return;
    }
    
    list.innerHTML = projects.map(project => `
      <div class="item-card" data-id="${project.id}">
        <div class="item-card-content">
          <div class="item-card-title">${project.title || 'Sin título'}</div>
          <div class="item-card-subtitle">${project.subtitle || ''}</div>
          ${project.imageUrl ? `<img src="${project.imageUrl}" style="max-width: 100px; max-height: 100px; border-radius: 6px; margin-top: 0.5rem;">` : ''}
        </div>
        <div class="item-card-actions">
          <button class="btn-edit" onclick="adminController.editItem('project', '${project.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-delete" onclick="adminController.deleteItem('project', '${project.id}')">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Renderiza la lista de testimonios
   */
  renderTestimonialsList(testimonials) {
    const list = document.getElementById('testimonials-list');
    if (!list) return;
    
    if (!Array.isArray(testimonials) || testimonials.length === 0) {
      list.innerHTML = '<p>No hay testimonios agregados</p>';
      return;
    }
    
    list.innerHTML = testimonials.map(testimonial => `
      <div class="item-card" data-id="${testimonial.id}">
        <div class="item-card-content">
          <div class="item-card-title">${testimonial.name || 'Sin nombre'}</div>
          <div class="item-card-subtitle">${testimonial.position || ''}</div>
          <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${testimonial.text || ''}</p>
        </div>
        <div class="item-card-actions">
          <button class="btn-edit" onclick="adminController.editItem('testimonial', '${testimonial.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-delete" onclick="adminController.deleteItem('testimonial', '${testimonial.id}')">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Renderiza la lista de FAQs
   */
  renderFAQList(faqs) {
    const list = document.getElementById('faq-list');
    if (!list) return;
    
    if (!Array.isArray(faqs) || faqs.length === 0) {
      list.innerHTML = '<p>No hay preguntas frecuentes agregadas</p>';
      return;
    }
    
    list.innerHTML = faqs.map(faq => `
      <div class="item-card" data-id="${faq.id}">
        <div class="item-card-content">
          <div class="item-card-title">${faq.question || 'Sin pregunta'}</div>
          <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${faq.answer || ''}</p>
        </div>
        <div class="item-card-actions">
          <button class="btn-edit" onclick="adminController.editItem('faq', '${faq.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-delete" onclick="adminController.deleteItem('faq', '${faq.id}')">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Renderiza la lista de localidades
   */
  renderLocalitiesList(localities) {
    const list = document.getElementById('localities-list');
    if (!list) return;
    
    if (!Array.isArray(localities) || localities.length === 0) {
      list.innerHTML = '<p>No hay localidades agregadas</p>';
      return;
    }
    
    list.innerHTML = localities.map(locality => `
      <div class="item-card" data-id="${locality.id}">
        <div class="item-card-content">
          <div class="item-card-title">${locality.name || 'Sin nombre'}</div>
          <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${locality.description || ''}</p>
        </div>
        <div class="item-card-actions">
          <button class="btn-edit" onclick="adminController.editItem('locality', '${locality.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-delete" onclick="adminController.deleteItem('locality', '${locality.id}')">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }
  
  /**
   * Muestra el modal para agregar/editar items
   */
  async showAddModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const titles = {
      project: 'Agregar Proyecto',
      testimonial: 'Agregar Testimonio',
      faq: 'Agregar Pregunta Frecuente',
      locality: 'Agregar Localidad'
    };
    
    modalTitle.textContent = titles[type] || 'Agregar Item';
    
    // Generar formulario según el tipo
    modalBody.innerHTML = this.generateItemForm(type);
    
    modal.style.display = 'flex';
    
    // Setup form submit
    const form = modalBody.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleItemSubmit(e, type));
    }
    
    // Setup image upload
    const uploadBtn = modalBody.querySelector('.btn-upload');
    if (uploadBtn) {
      uploadBtn.addEventListener('click', (e) => {
        const field = uploadBtn.dataset.field;
        this.handleImageUpload(field);
      });
    }
  }
  
  /**
   * Genera el formulario para agregar/editar items
   */
  generateItemForm(type) {
    const forms = {
      project: `
        <form class="admin-form" data-item-type="project">
          <div class="form-group">
            <label>Título</label>
            <input type="text" name="title" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Subtítulo</label>
            <input type="text" name="subtitle" class="form-control" placeholder="Corporativo / 2023 / Lima">
          </div>
          <div class="form-group">
            <label>URL de Imagen</label>
            <div class="image-upload-group">
              <input type="url" name="imageUrl" class="form-control" required>
              <button type="button" class="btn-upload" data-field="imageUrl">
                <i class="fas fa-cloud-upload-alt"></i> Subir
              </button>
            </div>
            <div class="image-preview" data-preview="imageUrl"></div>
          </div>
          <button type="submit" class="btn-save">Guardar</button>
        </form>
      `,
      testimonial: `
        <form class="admin-form" data-item-type="testimonial">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" name="name" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Posición</label>
            <input type="text" name="position" class="form-control" placeholder="CEO, Director, etc.">
          </div>
          <div class="form-group">
            <label>URL del Avatar</label>
            <div class="image-upload-group">
              <input type="url" name="avatarUrl" class="form-control">
              <button type="button" class="btn-upload" data-field="avatarUrl">
                <i class="fas fa-cloud-upload-alt"></i> Subir
              </button>
            </div>
            <div class="image-preview" data-preview="avatarUrl"></div>
          </div>
          <div class="form-group">
            <label>Testimonio</label>
            <textarea name="text" class="form-control" rows="4" required placeholder="«Testimonio...»"></textarea>
          </div>
          <button type="submit" class="btn-save">Guardar</button>
        </form>
      `,
      faq: `
        <form class="admin-form" data-item-type="faq">
          <div class="form-group">
            <label>Pregunta</label>
            <input type="text" name="question" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Respuesta</label>
            <textarea name="answer" class="form-control" rows="4" required></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" name="isActive" value="true">
              Activa por defecto
            </label>
          </div>
          <button type="submit" class="btn-save">Guardar</button>
        </form>
      `,
      locality: `
        <form class="admin-form" data-item-type="locality">
          <div class="form-group">
            <label>Nombre de la Ciudad</label>
            <input type="text" name="name" class="form-control" required>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea name="description" class="form-control" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn-save">Guardar</button>
        </form>
      `
    };
    
    return forms[type] || '<p>Formulario no disponible</p>';
  }
  
  /**
   * Maneja el envío de formularios de items
   */
  async handleItemSubmit(e, type) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    try {
      const sectionMap = {
        project: 'projects',
        testimonial: 'testimonials',
        faq: 'faq',
        locality: 'localities'
      };
      
      const sectionName = sectionMap[type];
      await this.contentService.createItem(sectionName, data);
      this.showNotification('Item agregado exitosamente', 'success');
      this.closeModal();
      await this.loadContent();
    } catch (error) {
      console.error('Error creating item:', error);
      this.showNotification('Error al agregar el item', 'error');
    }
  }
  
  /**
   * Edita un item existente
   */
  async editItem(type, id) {
    // TODO: Implementar edición
    console.log('Edit item:', type, id);
  }
  
  /**
   * Elimina un item
   */
  async deleteItem(type, id) {
    if (!confirm('¿Estás seguro de eliminar este item?')) {
      return;
    }
    
    try {
      const sectionMap = {
        project: 'projects',
        testimonial: 'testimonials',
        faq: 'faq',
        locality: 'localities'
      };
      
      const sectionName = sectionMap[type];
      await this.contentService.deleteItem(sectionName, id);
      this.showNotification('Item eliminado exitosamente', 'success');
      await this.loadContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('Error al eliminar el item', 'error');
    }
  }
  
  /**
   * Maneja la subida de imágenes a Cloudinary
   */
  async handleImageUpload(fieldName) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Mostrar loading
      const uploadBtn = document.querySelector(`.btn-upload[data-field="${fieldName}"]`);
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
      }
      
      try {
        const result = await uploadImageToCloudinary(file);
        
        if (result.success) {
          // Actualizar el input
          const inputField = document.querySelector(`input[name="${fieldName}"]`);
          if (inputField) {
            inputField.value = result.url;
            this.updateImagePreview(fieldName, result.url);
          }
          this.showNotification('Imagen subida exitosamente', 'success');
        } else {
          this.showNotification('Error al subir imagen: ' + result.error, 'error');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        this.showNotification('Error al subir imagen', 'error');
      } finally {
        if (uploadBtn) {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Subir';
        }
      }
    };
    
    input.click();
  }
  
  /**
   * Actualiza el preview de una imagen
   */
  updateImagePreview(fieldName, imageUrl) {
    if (!imageUrl) return;
    
    const preview = document.querySelector(`.image-preview[data-preview="${fieldName}"]`);
    if (preview) {
      preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
    }
    
    // Si es la imagen del Hero, actualizar también el preview del Hero
    if (fieldName === 'imageUrl') {
      const heroForm = document.getElementById('hero-form');
      if (heroForm) {
        const imageInput = heroForm.querySelector('input[name="imageUrl"]');
        if (imageInput) {
          imageInput.value = imageUrl;
          this.updateHeroPreview(imageInput);
        }
      }
    }
  }
  
  /**
   * Cierra el modal
   */
  closeModal() {
    document.getElementById('modal').style.display = 'none';
  }
  
  /**
   * Muestra una notificación
   */
  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  /**
   * Toggle del preview del Hero
   */
  toggleHeroPreview() {
    const previewPanel = document.getElementById('hero-preview-panel');
    if (!previewPanel) return;
    
    const isVisible = previewPanel.style.display !== 'none';
    previewPanel.style.display = isVisible ? 'none' : 'block';
    
    // Actualizar preview cuando se muestra
    if (!isVisible) {
      this.updateHeroPreviewFromForm();
    }
  }
  
  /**
   * Actualiza el preview del Hero desde un input específico
   */
  updateHeroPreview(input) {
    const targetId = input.dataset.previewTarget;
    if (!targetId) return;
    
    const previewElement = document.getElementById(`preview-${targetId}`);
    if (!previewElement) return;
    
    const value = input.value || input.placeholder || '';
    
    if (targetId === 'hero-image') {
      // Es una imagen
      previewElement.src = value || 'https://via.placeholder.com/800x450?text=Imagen+Hero';
      previewElement.alt = 'Preview Hero';
    } else if (targetId === 'hero-button') {
      // Es un botón
      previewElement.textContent = value;
    } else {
      // Es texto normal
      previewElement.textContent = value;
    }
  }
  
  /**
   * Actualiza todo el preview del Hero desde el formulario
   */
  updateHeroPreviewFromForm() {
    const form = document.getElementById('hero-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[data-preview-target]');
    inputs.forEach(input => {
      this.updateHeroPreview(input);
    });
  }
  
  /**
   * Renderiza el Hero con datos desde Firebase
   */
  renderHero(heroData) {
    if (!heroData) return;
    
    // Actualizar el formulario
    this.fillForm('hero', heroData);
    
    // Actualizar el preview si está visible
    const previewPanel = document.getElementById('hero-preview-panel');
    if (previewPanel && previewPanel.style.display !== 'none') {
      this.updateHeroPreviewFromForm();
    }
  }
  
  /**
   * Maneja la publicación del sitio
   */
  async handlePublish() {
    const publishBtn = document.getElementById('btn-publish');
    if (!publishBtn) return;
    
    // Confirmar publicación
    if (!confirm('¿Estás seguro de que deseas publicar los cambios? Esto disparará un nuevo deploy en Netlify.')) {
      return;
    }
    
    // Deshabilitar botón
    publishBtn.disabled = true;
    const originalText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    
    try {
      // Obtener token de autenticación
      const user = window.firebaseSDK?.auth?.currentUser;
      if (!user) {
        throw new Error('No autenticado');
      }
      
      const token = await user.getIdToken();
      
      // Obtener projectId desde la configuración de Firebase
      // La configuración está en firebase-init.js, pero podemos obtenerla del auth
      const projectId = 'lucho-web-cms'; // TODO: Obtener dinámicamente
      const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/publish`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          userId: user.uid
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      this.showNotification(
        '✅ Publicación iniciada exitosamente. El deploy comenzará en unos momentos. Puedes ver el progreso en GitHub Actions.',
        'success'
      );
      
      // Opcional: Abrir GitHub Actions en una nueva pestaña
      // TODO: Configurar el repositorio de GitHub
      // const githubRepo = 'tu-usuario/tu-repo';
      // if (githubRepo && githubRepo !== 'tu-usuario/tu-repo') {
      //   setTimeout(() => {
      //     window.open(`https://github.com/${githubRepo}/actions`, '_blank');
      //   }, 2000);
      // }
      
    } catch (error) {
      console.error('Error al publicar:', error);
      this.showNotification(
        `❌ Error al publicar: ${error.message}. Verifica que la Cloud Function esté desplegada.`,
        'error'
      );
    } finally {
      // Restaurar botón
      publishBtn.disabled = false;
      publishBtn.innerHTML = originalText;
    }
  }
}

// Inicializar el controlador cuando el DOM esté listo
let adminController;
document.addEventListener('DOMContentLoaded', () => {
  adminController = new AdminController();
  // Hacer disponible globalmente para los onclick handlers
  window.adminController = adminController;
});
