// JavaScript para funcionalidades adicionales si se necesitan
// Por ahora el menú funciona solo con CSS :hover

document.addEventListener('DOMContentLoaded', function() {
  console.log('Landing page cargada');
  
  // Menú hamburguesa
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');
  
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarToggle.classList.toggle('navbar-toggle-active');
      navbarMenu.classList.toggle('navbar-menu-active');
    });
    
    // Cerrar menú al hacer clic en un enlace o botón
    const menuLinks = navbarMenu.querySelectorAll('a, .menu-item');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        navbarToggle.classList.remove('navbar-toggle-active');
        navbarMenu.classList.remove('navbar-menu-active');
      });
    });
  }
  
  // Galería con transición automática de desplazamiento
  const gallerySlides = document.querySelectorAll('.gallery-slide');
  let currentSlide = 0;
  
  if (gallerySlides.length > 0) {
    function nextSlide() {
      // Marcar el slide actual como previo (se desplaza a la izquierda)
      gallerySlides[currentSlide].classList.remove('gallery-slide-active');
      gallerySlides[currentSlide].classList.add('gallery-slide-prev');
      
      // Avanzar al siguiente slide
      const prevSlide = currentSlide;
      currentSlide = (currentSlide + 1) % gallerySlides.length;
      
      // El nuevo slide viene desde la derecha
      gallerySlides[currentSlide].classList.remove('gallery-slide-prev');
      gallerySlides[currentSlide].classList.add('gallery-slide-active');
      
      // Limpiar la clase prev del slide anterior después de la transición
      setTimeout(() => {
        gallerySlides[prevSlide].classList.remove('gallery-slide-prev');
      }, 1500);
    }
    
    // Cambiar de slide cada 5 segundos
    setInterval(nextSlide, 5000);
  }
  
  // Carrusel de proyectos
  const projectPages = document.querySelectorAll('.projects-page');
  const projectIndicators = document.querySelectorAll('.projects-indicator');
  let currentPage = 0;
  
  if (projectPages.length > 0 && projectIndicators.length > 0) {
    function showPage(pageIndex) {
      // Ocultar todas las páginas
      projectPages.forEach(page => {
        page.classList.remove('projects-page-active');
      });
      
      // Mostrar la página seleccionada
      projectPages[pageIndex].classList.add('projects-page-active');
      
      // Actualizar indicadores
      projectIndicators.forEach((indicator, index) => {
        if (index === pageIndex) {
          indicator.classList.add('projects-indicator-active');
        } else {
          indicator.classList.remove('projects-indicator-active');
        }
      });
      
      currentPage = pageIndex;
    }
    
    // Agregar event listeners a los indicadores
    projectIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        showPage(index);
      });
    });
    
    // Auto-play del carrusel (opcional)
    setInterval(() => {
      const nextPage = (currentPage + 1) % projectPages.length;
      showPage(nextPage);
    }, 6000);
  }
  
  // Custom Cursor
  const cursorOuter = document.querySelector('.cursor-outer');
  const cursorInner = document.querySelector('.cursor-inner');
  
  if (cursorOuter && cursorInner) {
    let mouseX = 0;
    let mouseY = 0;
    let outerX = 0;
    let outerY = 0;
    let innerX = 0;
    let innerY = 0;
    
    // Obtener posición del mouse
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Animar ambos círculos con diferentes velocidades
    function animateCursor() {
      // Círculo exterior con más retraso (más lento) - factor 0.08
      outerX += (mouseX - outerX) * 0.08;
      outerY += (mouseY - outerY) * 0.08;
      
      // Círculo interior con menos retraso (más rápido) - factor 0.25
      innerX += (mouseX - innerX) * 0.25;
      innerY += (mouseY - innerY) * 0.25;
      
      cursorOuter.style.left = outerX + 'px';
      cursorOuter.style.top = outerY + 'px';
      
      cursorInner.style.left = innerX + 'px';
      cursorInner.style.top = innerY + 'px';
      
      requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Ocultar cursor cuando sale de la ventana
    document.addEventListener('mouseleave', () => {
      cursorOuter.style.opacity = '0';
      cursorInner.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
      cursorOuter.style.opacity = '1';
      cursorInner.style.opacity = '1';
    });
  }
  
  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const iconPlus = item.querySelector('.faq-icon-plus');
    const iconMinus = item.querySelector('.faq-icon-minus');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('faq-item-active');
      
      // Cerrar todos los items
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('faq-item-active');
      });
      
      // Si el item clickeado no estaba activo, abrirlo
      if (!isActive) {
        item.classList.add('faq-item-active');
      }
    });
  });
  
  // Services Cards Accordion
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach((card) => {
    card.addEventListener('click', () => {
      const isActive = card.classList.contains('service-card-active');
      
      // Toggle el estado del card clickeado
      if (isActive) {
        card.classList.remove('service-card-active');
      } else {
        card.classList.add('service-card-active');
      }
    });
  });
  
  // Carrusel de localidades
  const localitiesPages = document.querySelectorAll('.localities-page');
  const localitiesIndicators = document.querySelectorAll('.localities-indicator');
  let currentLocalityPage = 0;
  
  if (localitiesPages.length > 0 && localitiesIndicators.length > 0) {
    function showLocalityPage(pageIndex) {
      // Ocultar todas las páginas
      localitiesPages.forEach(page => {
        page.classList.remove('localities-page-active');
      });
      
      // Mostrar la página seleccionada
      localitiesPages[pageIndex].classList.add('localities-page-active');
      
      // Actualizar indicadores
      localitiesIndicators.forEach((indicator, index) => {
        if (index === pageIndex) {
          indicator.classList.add('localities-indicator-active');
        } else {
          indicator.classList.remove('localities-indicator-active');
        }
      });
      
      currentLocalityPage = pageIndex;
    }
    
    // Agregar event listeners a los indicadores
    localitiesIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        showLocalityPage(index);
      });
    });
    
    // Auto-play del carrusel
    setInterval(() => {
      const nextPage = (currentLocalityPage + 1) % localitiesPages.length;
      showLocalityPage(nextPage);
    }, 6000);
  }
});
