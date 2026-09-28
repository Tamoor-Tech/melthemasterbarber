/* ==========================================================================
   MEL THE MASTER BARBER — VANILLA JAVASCRIPT CONTROLLER (VIP FLOATING NAVBAR)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initFloatingNavbarScroll();
  initHeroSlider();
  initReviewSlider();
  initScrollAnimations();
  initFAQAccordion();
});

/* --------------------------------------------------------------------------
   1. THEME SWITCHER ENGINE (PERSISTS LOCALSTORAGE & SYSTEM PREFERENCE)
   -------------------------------------------------------------------------- */
function initThemeEngine() {
  const desktopBtn = document.getElementById('themeToggleBtnDesktop');
  const mobileBtn = document.getElementById('themeToggleBtnMobile');
  
  const savedTheme = localStorage.getItem('mel_barber_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark');
  
  applyTheme(currentTheme);
  
  [desktopBtn, mobileBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('mel_barber_theme', currentTheme);
      });
    }
  });
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icons = document.querySelectorAll('.themeIcon');
    icons.forEach(icon => {
      if (theme === 'light') {
        icon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      } else {
        icon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      }
    });
  }
}

/* --------------------------------------------------------------------------
   2. FLOATING NAVBAR SCROLL & MOBILE MENU
   -------------------------------------------------------------------------- */
function initFloatingNavbarScroll() {
  const navbarWrapper = document.getElementById('navbarWrapper');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbarWrapper.classList.add('scrolled');
    } else {
      navbarWrapper.classList.remove('scrolled');
    }
  });

  const toggler   = document.getElementById('mobileNavToggler');
  const closeBtn  = document.getElementById('mobileNavClose');
  const mobileMenu = document.getElementById('navbarCollapse');

  function openMenu() {
    mobileMenu.classList.add('show');
    mobileMenu.setAttribute('aria-hidden', 'false');
    toggler.classList.add('is-open');
    toggler.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mob-menu-open');
  }

  function closeMenu() {
    mobileMenu.classList.remove('show');
    mobileMenu.setAttribute('aria-hidden', 'true');
    toggler.classList.remove('is-open');
    toggler.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mob-menu-open');
  }

  if (toggler && mobileMenu) {
    toggler.addEventListener('click', () => {
      mobileMenu.classList.contains('show') ? closeMenu() : openMenu();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Close on any nav link click
    mobileMenu.querySelectorAll('.mob-nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('show')) closeMenu();
    });
  }
}

/* --------------------------------------------------------------------------
   3. HERO SLIDER (4 SLIDES, 4s INTERVAL, SIDE NAV, TOUCH SWIPE)
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const currentNumEl = document.getElementById('heroCurrentSlideNum');
  
  if (!slides.length) return;
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  let slideInterval;
  const INTERVAL_TIME = 4000;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('active'));
    currentSlide = (index + totalSlides) % totalSlides;
    slides[currentSlide].classList.add('active');
    
    if (currentNumEl) {
      currentNumEl.textContent = `0${currentSlide + 1}`;
    }
  }

  function nextSlide() { showSlide(currentSlide + 1); }
  function prevSlide() { showSlide(currentSlide - 1); }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, INTERVAL_TIME);
  }

  function stopAutoplay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { nextSlide(); startAutoplay(); }
    else if (e.key === 'ArrowLeft') { prevSlide(); startAutoplay(); }
  });

  const heroSection = document.querySelector('.hero-slider-section');
  if (heroSection) {
    let touchStartX = 0;
    let touchEndX = 0;
    heroSection.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) { nextSlide(); startAutoplay(); }
      else if (touchEndX - touchStartX > 40) { prevSlide(); startAutoplay(); }
    }, { passive: true });
  }

  startAutoplay();
}

/* --------------------------------------------------------------------------
   4. TESTIMONIAL REVIEW CAROUSEL
   -------------------------------------------------------------------------- */
function initReviewSlider() {
  const reviews = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('reviewPrevBtn');
  const nextBtn = document.getElementById('reviewNextBtn');
  const currentNumEl = document.getElementById('reviewCurrentNum');
  const totalNumEl = document.getElementById('reviewTotalNum');
  
  if (!reviews.length) return;
  
  if (totalNumEl) {
    totalNumEl.textContent = reviews.length < 10 ? '0' + reviews.length : reviews.length;
  }
  
  let currentReview = 0;
  
  function showReview(index) {
    reviews.forEach(r => r.classList.remove('active'));
    currentReview = (index + reviews.length) % reviews.length;
    reviews[currentReview].classList.add('active');
    
    if (currentNumEl) {
      const displayNum = currentReview + 1;
      currentNumEl.textContent = displayNum < 10 ? '0' + displayNum : displayNum;
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', () => showReview(currentReview + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => showReview(currentReview - 1));
}

/* --------------------------------------------------------------------------
   5. SINGLE-OPEN CUSTOM FAQ ACCORDION ENGINE
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item-custom');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header-custom');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all active items (single-open behavior)
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherHeader = otherItem.querySelector('.faq-header-custom');
        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
      });

      // If clicked item was not active, open it
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    // Handle Keyboard Accessibility Event (Enter / Space mapped natively due to button markup)
  });

  // Ensure first active item calculates initial Accessibility
  const initialActive = document.querySelector('.faq-item-custom.active');
  if (initialActive) {
    const activeHeader = initialActive.querySelector('.faq-header-custom');
    if (activeHeader) activeHeader.setAttribute('aria-expanded', 'true');
  }
}



/* --------------------------------------------------------------------------
   6. SCROLL REVEAL ANIMATION
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
}
