/* Shared front-end behavior for all pages:
   - Page-load fade/blur
   - Scroll reveal animations
   - Sticky nav blur
   - Tablet+ burger menu with animated slide-in/out
   - Testimonials carousel
   - FAQ accordion
*/

(function(){
  const root = document.querySelector('.page-root');
  if(root){
    const start = () => {
      root.classList.add('is-loaded');
    };
    // Two-step to ensure CSS transition runs reliably.
    window.requestAnimationFrame(() => window.setTimeout(start, 80));
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.18 });
    revealEls.forEach(el => io.observe(el));
  }else{
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Sticky nav blur
  const topbar = document.querySelector('.topbar');
  const updateTopbar = () => {
    if(!topbar) return;
    topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  // Burger menu
  const burgerBtn = document.querySelector('[data-burger-open]');
  const panel = document.querySelector('[data-nav-panel]');
  const overlay = document.querySelector('[data-nav-overlay]');
  const closeBtn = document.querySelector('[data-burger-close]');

  let setNavOpen = null;

  if(burgerBtn && panel && overlay){
    const setOpen = (open) => {
      panel.classList.toggle('is-open', open);
      overlay.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      document.body.classList.toggle('nav-menu-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      burgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      const openLabel = burgerBtn.getAttribute('data-aria-open') || 'Ouvrir le menu';
      const closeLabel = burgerBtn.getAttribute('data-aria-close') || 'Fermer le menu';
      burgerBtn.setAttribute('aria-label', open ? closeLabel : openLabel);
    };
    setNavOpen = setOpen;
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.setAttribute('aria-haspopup', 'true');
    burgerBtn.setAttribute('aria-controls', panel.id || 'nav-panel');
    if(!panel.id) panel.id = 'nav-panel';
    burgerBtn.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    overlay.addEventListener('click', () => setOpen(false));
    if(closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

    window.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });
  }

  // Reliable anchor scrolling for single-page navigation.
  // This avoids edge-cases where default anchor behavior gets inconsistent near long pages.
  const hashLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  hashLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if(!href || href.length < 2) return;
      const target = document.querySelector(href);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if(setNavOpen) setNavOpen(false);
    });
  });

  // Testimonials carousel
  const carousel = document.querySelector('[data-testimonials]');
  if(carousel){
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    if(track && slides.length){
      let idx = 0;
      let timer = null;

      const setIndex = (next) => {
        idx = (next + slides.length) % slides.length;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      };

      setIndex(0);

      const resetTimer = () => {
        if(timer) window.clearInterval(timer);
        timer = window.setInterval(() => setIndex(idx + 1), 6500);
      };
      resetTimer();

      if(prevBtn) prevBtn.addEventListener('click', () => { setIndex(idx - 1); resetTimer(); });
      if(nextBtn) nextBtn.addEventListener('click', () => { setIndex(idx + 1); resetTimer(); });

      dots.forEach((d) => {
        d.addEventListener('click', () => {
          const n = Number(d.getAttribute('data-carousel-dot'));
          setIndex(n);
          resetTimer();
        });
      });
    }
  }

  // FAQ accordion
  document.querySelectorAll('[data-faq]').forEach((faqRoot) => {
    const items = Array.from(faqRoot.querySelectorAll('[data-faq-item]'));
    items.forEach((item) => {
      const btn = item.querySelector('[data-faq-toggle]');
      if(!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        // Close siblings for a cleaner UX.
        items.forEach(i => i.classList.toggle('is-open', i === item ? !isOpen : false));
      });
    });
  });
})();

