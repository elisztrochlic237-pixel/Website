(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menu && nav) {
    const close = () => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open menu');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !nav.contains(event.target)) close();
    });
  }

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets = document.querySelectorAll('.section-heading, .service-card, .project-card, .service-detail, .project-feature, .values-grid > div');
    targets.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    targets.forEach(el => observer.observe(el));
  }

  const form = document.getElementById('enquiry-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const submit = form.querySelector('button[type="submit"]');
  const filesInput = document.getElementById('photos');
  const maxFiles = 4;
  const maxBytes = 5 * 1024 * 1024;
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const show = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ''}`;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const files = [...filesInput.files];
    if (files.length > maxFiles) return show('Please choose up to 4 photos.', 'error');
    if (files.some(file => !allowedTypes.has(file.type) || file.size > maxBytes)) {
      return show('Each photo must be a JPG, PNG or WebP file under 5 MB.', 'error');
    }
    const data = new FormData(form);
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    show('Sending your enquiry…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        credentials: 'same-origin'
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'The form could not be sent.');
      form.reset();
      show('Thanks. Your enquiry has been sent to EAZ Electrical. Eli will be in touch.', 'success');
      status.focus?.();
    } catch (error) {
      show(`${error.message} Please call ${'0402 161 802'} or email info@eazelectrical.com.au.`, 'error');
    } finally {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
