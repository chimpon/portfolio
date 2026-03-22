/* ============================================================
   MAIN.JS
   Portfolio — Juan Cobo
   
   Funcionalidades:
   1. Dark/Light mode toggle con persistencia en localStorage
   2. Scroll reveal animations (Intersection Observer)
   3. Filtro de cases por tipo (sin recarga)
   4. Lightbox para imágenes en case studies
   5. Mobile navigation toggle
   6. Password gate para cases confidenciales
   
   Sin dependencias. Sin frameworks. Vanilla JS.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScrollReveal();
  initFilter();
  initLightbox();
  initMobileNav();
  initPasswordGate();
});


/* ==============================================================
   1. DARK/LIGHT MODE
   
   - Lee preferencia de localStorage
   - Si no hay preferencia, respeta prefers-color-scheme del OS
   - Persiste la elección en localStorage
   - Transición suave gestionada por CSS (--transition-theme)
   ============================================================== */

function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  // Determinar tema inicial
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = stored || (prefersDark ? 'dark' : 'dark'); // Default: dark (diseño original)

  applyTheme(initialTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}


/* ==============================================================
   2. SCROLL REVEAL
   
   - Usa Intersection Observer (nativo, sin librerías)
   - Elementos con clase .reveal se animan al entrar en viewport
   - threshold configurable por data-attribute si se necesita
   - Respeta prefers-reduced-motion (manejado en CSS)
   ============================================================== */

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Solo animar una vez
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
}


/* ==============================================================
   3. FILTRO DE CASES
   
   - Filtra cards por data-attribute (data-category)
   - Botón activo recibe clase .is-active
   - "All" muestra todas las cards
   - Sin recarga de página
   ============================================================== */

function initFilter() {
  const buttons = document.querySelectorAll('.filter__btn');
  const cards = document.querySelectorAll('.card[data-category]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Actualizar botón activo
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Mostrar/ocultar cards
      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}


/* ==============================================================
   4. LIGHTBOX
   
   - Imágenes con clase .case-image hacen zoom en lightbox
   - Cierra con click en overlay, botón close, o tecla Escape
   - Previene scroll del body mientras está abierto
   ============================================================== */

function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const triggers = document.querySelectorAll('.case-image img');

  triggers.forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Cerrar lightbox
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}


/* ==============================================================
   5. MOBILE NAVIGATION
   
   - Toggle hamburger menu
   - Cierra al hacer click en un link
   - Cierra con Escape
   ============================================================== */

function initMobileNav() {
  const hamburger = document.querySelector('.header__hamburger');
  const nav = document.querySelector('.header__nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar al hacer click en un link del nav
  nav.querySelectorAll('.header__nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}


/* ==============================================================
   6. PASSWORD GATE
   
   - Protección client-side (suficiente para portfolio)
   - La contraseña se define como data-attribute en el gate
   - Al acertar, oculta el gate y muestra el contenido
   - NO es seguridad real — solo una barrera de cortesía
   ============================================================== */

function initPasswordGate() {
  const gate = document.querySelector('.password-gate');
  if (!gate) return;

  const content = document.querySelector('.case-content');
  const input = gate.querySelector('.password-gate__input');
  const submit = gate.querySelector('.password-gate__submit');
  const error = gate.querySelector('.password-gate__error');
  const password = gate.getAttribute('data-password');

  function attemptUnlock() {
    if (input.value === password) {
      gate.style.display = 'none';
      if (content) content.style.display = '';
      // Guardar en sessionStorage para no pedir otra vez en la misma sesión
      sessionStorage.setItem('unlocked-' + window.location.pathname, 'true');
    } else {
      error.textContent = 'Incorrect password. Please try again.';
      input.value = '';
      input.focus();
    }
  }

  // Comprobar si ya fue desbloqueado en esta sesión
  if (sessionStorage.getItem('unlocked-' + window.location.pathname) === 'true') {
    gate.style.display = 'none';
    if (content) content.style.display = '';
    return;
  }

  // Ocultar contenido protegido por defecto
  if (content) content.style.display = 'none';

  submit.addEventListener('click', attemptUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock();
  });
}
