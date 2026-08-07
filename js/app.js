/**
 * SlideController — Vibe Coding
 * Navegaci&oacute;n minimal para el sistema de presentaci&oacute;n editorial.
 */
class SlideController {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.index = 0;
    this.isAnimating = false;

    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.counter = document.getElementById('slide-counter');
    this.progressFill = document.getElementById('progress-fill');

    // Anunciar el cambio de slide a lectores de pantalla
    if (this.counter) this.counter.setAttribute('aria-live', 'polite');

    if (!this.slides.length) {
      console.warn('No se encontraron slides en el documento.');
      return;
    }

    this.init();
  }

  init() {
    // Si es un solo slide sin botones de navegación, marcar como activo y salir
    if (this.slides.length === 1 && !this.prevBtn && !this.nextBtn) {
      this.slides[0].classList.add('active');
      return;
    }

    this.bindEvents();
    this.show(0);
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    document.addEventListener('keydown', (e) => this.handleKey(e));

    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
    }, { passive: true });
  }

  show(index) {
    if (this.isAnimating) return;
    if (index < 0 || index >= this.slides.length) return;

    this.isAnimating = true;
    const current = this.slides[this.index];
    const next = this.slides[index];

    current.classList.remove('active');
    // Forzar reflow para reiniciar la animaci&oacute;n
    void next.offsetWidth;
    next.classList.add('active');

    this.index = index;
    this.updateUI();

    setTimeout(() => { this.isAnimating = false; }, 500);
  }

  updateUI() {
    const total = this.slides.length;
    const current = this.index + 1;
    const totalStr = String(total).padStart(2, '0');
    const currentStr = String(current).padStart(2, '0');

    if (this.counter) this.counter.textContent = `${currentStr} / ${totalStr}`;
    if (this.progressFill) {
      const pct = (current / total) * 100;
      this.progressFill.style.width = pct + '%';
    }

    if (this.prevBtn) this.prevBtn.disabled = this.index === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.index === total - 1;
  }

  next() { this.show(this.index + 1); }
  prev() { this.show(this.index - 1); }

  handleKey(e) {
    // Si el foco está en un control interactivo, respetar su semántica nativa
    // (ej.: espacio sobre el botón "Anterior" no debe avanzar el deck)
    if (e.target.matches('input, textarea, select, button')) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this.prev();
        break;
      case 'Home':
        e.preventDefault();
        this.show(0);
        break;
      case 'End':
        e.preventDefault();
        this.show(this.slides.length - 1);
        break;
      case 'f':
      case 'F':
        if (e.ctrlKey || e.metaKey) return;
        this.toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.presentation = new SlideController();
});
