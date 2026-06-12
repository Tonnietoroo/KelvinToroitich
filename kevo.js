/**
 * ============================================================
 *  CPA KELVIN KIPKOSGEI TOROITICH PORTFOLIO — kevo.js
 *  Modules: Theme · Navigation · Scroll · Counters · Form
 *           CursorGlow · ScrollTop · LazyImages · PrintHelper
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Debounce — limits how often fn can fire */
function debounce(fn, delay = 100) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), delay);
  };
}

/** Create an IntersectionObserver with sane defaults */
function createObserver(callback, options = {}) {
  return new IntersectionObserver(callback, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
    ...options,
  });
}


/* ============================================================
   1. THEME MODULE
   ============================================================ */
const Theme = (() => {
  const STORAGE_KEY = 'kkt-theme';
  const ROOT        = document.documentElement;

  function get()      { return localStorage.getItem(STORAGE_KEY) || 'dark'; }
  function set(theme) { localStorage.setItem(STORAGE_KEY, theme); }
  function isDark()   { return ROOT.getAttribute('data-theme') === 'dark'; }

  function apply(theme) {
    ROOT.setAttribute('data-theme', theme);
    set(theme);

    const icon = $('#themeIcon');
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    icon.setAttribute('aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  function toggle() { apply(isDark() ? 'light' : 'dark'); }

  function init() {
    apply(get());
    const btn = $('#themeToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init, apply, toggle, isDark };
})();


/* ============================================================
   2. NAVIGATION MODULE
   ============================================================ */
const Nav = (() => {
  let navbar, navMenu, navToggle, navLinks, sections;

  function scrolled() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    highlightSection(y);
  }

  function highlightSection(y) {
    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 150) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  function openMenu() {
    navMenu.classList.add('mobile-open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('mobile-open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    navMenu.classList.contains('mobile-open') ? closeMenu() : openMenu();
  }

  function smoothScroll(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || href === '#') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function init() {
    navbar    = $('#navbar');
    navMenu   = $('#navMenu');
    navToggle = $('#navToggle');
    navLinks  = $$('.nav-link');
    sections  = $$('section[id]');

    if (!navbar || !navMenu || !navToggle) return;

    window.addEventListener('scroll', debounce(scrolled, 60), { passive: true });
    navToggle.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', smoothScroll));

    // Smooth scroll for any in-page anchor
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', smoothScroll);
    });

    // Close mobile menu on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        closeMenu();
      }
    });

    // Initial active state
    scrolled();
  }

  return { init };
})();


/* ============================================================
   3. SCROLL-REVEAL MODULE
   ============================================================ */
const Reveal = (() => {
  function init() {
    const targets = $$('.reveal');
    if (!targets.length) return;

    const observer = createObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    });

    targets.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   4. COUNTER MODULE  (hero stats)
   ============================================================ */
const Counter = (() => {
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    const counters = $$('.stat-number[data-target]');
    if (!counters.length) return;

    const observer = createObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   5. SCROLL-TO-TOP MODULE
   ============================================================ */
const ScrollTop = (() => {
  function init() {
    const btn = $('#scrollTop');
    if (!btn) return;

    window.addEventListener('scroll', debounce(() => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, 80), { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();


/* ============================================================
   6. FORM MODULE
   ============================================================ */
const Form = (() => {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showMessage(el, text, type) {
    el.textContent  = text;
    el.className    = `form-message ${type}`;
    el.style.display = 'block';
    setTimeout(() => {
      el.className   = 'form-message';
      el.textContent = '';
    }, 6000);
  }

  function setLoading(btn, loading) {
    const textEl = btn.querySelector('.btn-text');
    const iconEl = btn.querySelector('.btn-icon');
    btn.disabled = loading;
    if (textEl) textEl.textContent = loading ? 'Sending\u2026' : 'Send Message';
    if (iconEl) iconEl.className   = loading
      ? 'fas fa-spinner fa-spin btn-icon'
      : 'fas fa-paper-plane btn-icon';
  }

  function validate(fields) {
    const { name, email, subject, message } = fields;
    if (!name.trim())              return 'Please enter your name.';
    if (!email.trim())             return 'Please enter your email.';
    if (!EMAIL_RE.test(email))     return 'Please enter a valid email address.';
    if (!subject.trim())           return 'Please enter a subject.';
    if (!message.trim())           return 'Please enter a message.';
    return null;
  }

  async function handleSubmit(e, form, msgEl, submitBtn) {
    e.preventDefault();

    const data   = new FormData(form);
    const fields = {
      name:    data.get('name')    || '',
      email:   data.get('email')   || '',
      subject: data.get('subject') || '',
      message: data.get('message') || '',
    };

    const error = validate(fields);
    if (error) { showMessage(msgEl, error, 'error'); return; }

    setLoading(submitBtn, true);

    try {
      const res = await fetch(form.getAttribute('action'), {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' },
      });

      // FormSubmit.co returns { "success": "true" } on success
      const json = await res.json().catch(() => ({}));
      const ok   = res.ok && (json.success === true || json.success === 'true');

      if (ok) {
        showMessage(msgEl, "Message sent! I'll get back to you within 24 hours. \u2705", 'success');
        form.reset();
        // Reset field border colours
        $$('.form-group input, .form-group textarea', form).forEach(input => {
          input.style.borderColor = '';
        });
      } else {
        const errMsg = json?.errors?.[0]?.message || json?.message || 'Something went wrong. Please try again.';
        showMessage(msgEl, errMsg, 'error');
      }
    } catch {
      showMessage(
        msgEl,
        'Network error. Please email me directly at toroitichkelvin@gmail.com',
        'error'
      );
    } finally {
      setLoading(submitBtn, false);
    }
  }

  function init() {
    const form      = $('#contactForm');
    const msgEl     = $('#formMessage');
    const submitBtn = $('#submitBtn');

    if (!form || !msgEl || !submitBtn) return;

    form.addEventListener('submit', e => handleSubmit(e, form, msgEl, submitBtn));

    // Real-time field validation feedback
    $$('.form-group input, .form-group textarea', form).forEach(input => {
      input.addEventListener('blur', () => {
        const empty        = !input.value.trim();
        const emailInvalid = input.type === 'email' && input.value && !EMAIL_RE.test(input.value);
        if (empty || emailInvalid) {
          input.style.borderColor = 'var(--clr-danger)';
        } else {
          input.style.borderColor = 'var(--clr-success)';
        }
      });
      input.addEventListener('focus', () => {
        input.style.borderColor = '';
      });
    });
  }

  return { init };
})();


/* ============================================================
   7. CURSOR GLOW MODULE (desktop only)
   ============================================================ */
const CursorGlow = (() => {
  function init() {
    // Only on devices with a fine pointer (mouse/trackpad)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let rafId;
    let mx = -500, my = -500;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    function render() {
      glow.style.left = `${mx}px`;
      glow.style.top  = `${my}px`;
      rafId = requestAnimationFrame(render);
    }
    render();

    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });

    // Pause rendering when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else render();
    });
  }

  return { init };
})();


/* ============================================================
   8. FOOTER YEAR MODULE
   ============================================================ */
const FooterYear = (() => {
  function init() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }
  return { init };
})();


/* ============================================================
   9. LAZY IMAGE MODULE
   ============================================================ */
const LazyImages = (() => {
  function init() {
    const imgs = $$('img[loading="lazy"]');
    if (!imgs.length || !('IntersectionObserver' in window)) return;

    const observer = createObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.removeAttribute('loading');
          observer.unobserve(img);
        }
      });
    });

    imgs.forEach(img => observer.observe(img));
  }
  return { init };
})();


/* ============================================================
   10. PRINT STYLES HELPER
   ============================================================ */
const PrintHelper = (() => {
  function init() {
    window.addEventListener('beforeprint', () => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    window.addEventListener('afterprint', () => {
      document.documentElement.setAttribute(
        'data-theme',
        Theme.isDark() ? 'dark' : 'light'
      );
    });
  }
  return { init };
})();


/* ============================================================
   11. SKILL BARS — ensure bars animate via reveal observer
       (skill-item elements also have class .reveal, so the
        Reveal module will add .in-view to them; this module
        is a no-op safety fallback for older browsers)
   ============================================================ */
const SkillBars = (() => {
  function init() {
    // Nothing extra needed — bars are triggered by .in-view on
    // .skill-item via the shared Reveal IntersectionObserver.
    // This stub is kept for future extensibility.
  }
  return { init };
})();


/* ============================================================
   12. ACTIVE NAV ON SECTION ENTER
       Enhances the existing Nav module for sections that
       are not direct <section> tags (fallback guard)
   ============================================================ */
const ActiveNav = (() => {
  function init() {
    // Already handled inside Nav.highlightSection
    // This stub prevents errors if called externally
  }
  return { init };
})();


/* ============================================================
   13. BOOTSTRAP — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Nav.init();
  Reveal.init();
  Counter.init();
  ScrollTop.init();
  Form.init();
  CursorGlow.init();
  FooterYear.init();
  LazyImages.init();
  PrintHelper.init();
  SkillBars.init();

  console.log(
    '%c\u2714 CPA Kelvin Kipkosgei Toroitich \u2014 Portfolio Loaded',
    'color:#0ea472;font-weight:700;font-size:13px;font-family:monospace'
  );
});
