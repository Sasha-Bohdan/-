/**
 * БОГДАН & ОЛЕКСАНДРА — ВЕСІЛЬНИЙ ВЕБСАЙТ (03.10.2026)
 * Main Interactive Script (ES6)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initRsvpForm();
  initScrollAnimations();
  initVenueActions();
  initColorPaletteInteractions();
  initGoogleSheetsConfigModal();
});

// URL-адреса Google Apps Script (Web App).
const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI7CIUfGqVB6RAO3I_5BUrmJlOORIrxtnb2e_h4lKF3zJW9YwDKY7JUOvP8L8ykgtrlQ/exec'; 

let GOOGLE_APPS_SCRIPT_URL = localStorage.getItem('wedding_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;

/* -------------------------------------------------------------------------- */
/* 1. NAVBAR & NAVIGATION                                                    */
/* -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.innerHTML = isOpen 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close menu when clicking outside or on a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 2. COUNTDOWN TIMER                                                         */
/* -------------------------------------------------------------------------- */
function initCountdown() {
  // Target Wedding Date: October 3, 2026, 13:00 UTC+3 (Ukraine)
  const targetDate = new Date('2026-10-03T13:00:00+03:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* -------------------------------------------------------------------------- */
/* 3. RSVP FORM LOGIC (WITH GOOGLE SHEETS INTEGRATION)                        */
/* -------------------------------------------------------------------------- */
function initRsvpForm() {
  const rsvpForm = document.getElementById('rsvp-form');
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
  const conditionalSection = document.getElementById('conditional-details');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalSummary = document.getElementById('modal-summary');

  if (!rsvpForm) return;

  // Toggle conditional section when 'Так' is selected
  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'yes') {
        conditionalSection?.classList.add('active');
      } else {
        conditionalSection?.classList.remove('active');
      }
    });
  });

  // Handle RSVP Submission
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Підтвердити';

    const formData = new FormData(rsvpForm);
    const attendance = formData.get('attendance');
    const firstName = formData.get('first_name')?.toString().trim();
    const lastName = formData.get('last_name')?.toString().trim();

    if (!firstName || !lastName || !attendance) {
      alert('Будь ласка, заповніть обов\'язкові поля: Ім\'я, Прізвище та статус присутності.');
      return;
    }

    const alcoholChoices = Array.from(rsvpForm.querySelectorAll('input[name="alcohol"]:checked'))
      .map(cb => cb.value);

    const rsvpPayload = {
      firstName,
      lastName,
      attending: attendance === 'yes',
      guestCount: attendance === 'yes' ? (parseInt(formData.get('guest_count'), 10) || 1) : 0,
      alcohol: attendance === 'yes' ? alcoholChoices : [],
      dietary: attendance === 'yes' ? (formData.get('dietary') || '') : '',
      comment: formData.get('comment') || '',
      submittedAt: new Date().toISOString()
    };

    // 1. Always save a copy to localStorage as backup
    try {
      const existingRsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      existingRsvps.push(rsvpPayload);
      localStorage.setItem('wedding_rsvps', JSON.stringify(existingRsvps));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // Disable button & show loading text
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Надсилання...';
    }

    // 2. Send to Google Sheets Apps Script Web App (if configured)
    let sendError = null;
    const storedUrl = localStorage.getItem('wedding_apps_script_url');
    const scriptUrl = (storedUrl && storedUrl.startsWith('https://script.google.com')) 
      ? storedUrl 
      : (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL.startsWith('https://script.google.com') ? GOOGLE_APPS_SCRIPT_URL : DEFAULT_APPS_SCRIPT_URL);

    if (scriptUrl && scriptUrl.startsWith('https://script.google.com')) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Avoids CORS preflight issue with Google Apps Script
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(rsvpPayload)
        });
      } catch (err) {
        console.error('Failed to send RSVP to Google Sheets:', err);
        sendError = err;
      }
    }

    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    // Show warning toast if Google Sheets URL was missing or failed
    if (!scriptUrl) {
      showToast('⚠️ Google Sheets URL не налаштовано. Дані збережено локально.');
    } else if (sendError) {
      showToast('⚠️ Помилка з\'єднання з Google Sheets. Дані збережено в браузері.');
    }

    // 3. Generate Ukrainian Modal Confirmation Message
    if (modalSummary) {
      if (rsvpPayload.attending) {
        modalSummary.innerHTML = `
          <p class="modal-name"><strong>${firstName} ${lastName}</strong>,</p>
          <p>Щиро дякуємо за ваше підтвердження! Ми з нетерпінням чекаємо на зустріч з вами <strong>03 жовтня 2026 року</strong> у MORAY Resort.</p>
          <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); margin: 1rem 0; text-align: left; font-size: 0.9rem;">
            <p style="margin-bottom: 0.3rem;"><strong>Кількість гостей:</strong> ${rsvpPayload.guestCount}</p>
            ${rsvpPayload.alcohol.length > 0 ? `<p style="margin-bottom: 0.3rem;"><strong>Напої:</strong> ${rsvpPayload.alcohol.join(', ')}</p>` : ''}
            ${rsvpPayload.dietary ? `<p style="margin-bottom: 0.3rem;"><strong>Особливості харчування:</strong> ${rsvpPayload.dietary}</p>` : ''}
          </div>
        `;
      } else {
        modalSummary.innerHTML = `
          <p class="modal-name"><strong>${firstName} ${lastName}</strong>,</p>
          <p>Дякуємо, що повідомили нам. Шкода, що ви не зможете бути з нами у цей день, але ми відчуваємо вашу підтримку і тепло!</p>
        `;
      }
    }

    // Open Modal
    modalOverlay?.classList.add('active');
  });

  // Modal Close
  modalCloseBtn?.addEventListener('click', () => {
    modalOverlay?.classList.remove('active');
    rsvpForm.reset();
    conditionalSection?.classList.remove('active');
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      rsvpForm.reset();
      conditionalSection?.classList.remove('active');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 3.1. GOOGLE SHEETS CONFIG MODAL HANDLER                                   */
/* -------------------------------------------------------------------------- */
function initGoogleSheetsConfigModal() {
  const openBtn = document.getElementById('open-sheets-config');
  const sheetsOverlay = document.getElementById('sheets-modal-overlay');
  const closeBtn = document.getElementById('sheets-modal-close-btn');
  const saveBtn = document.getElementById('sheets-modal-save-btn');
  const urlInput = document.getElementById('apps-script-url-input');

  if (!sheetsOverlay || !openBtn) return;

  openBtn.addEventListener('click', () => {
    const currentUrl = localStorage.getItem('wedding_apps_script_url') || GOOGLE_APPS_SCRIPT_URL || '';
    if (urlInput) urlInput.value = currentUrl;
    sheetsOverlay.classList.add('active');
  });

  closeBtn?.addEventListener('click', () => {
    sheetsOverlay.classList.remove('active');
  });

  saveBtn?.addEventListener('click', () => {
    const newUrl = urlInput?.value.trim() || '';
    if (newUrl && !newUrl.startsWith('https://script.google.com')) {
      alert('Будь ласка, введіть дійсне URL-посилання з script.google.com');
      return;
    }
    
    GOOGLE_APPS_SCRIPT_URL = newUrl;
    localStorage.setItem('wedding_apps_script_url', newUrl);
    sheetsOverlay.classList.remove('active');
    
    if (newUrl) {
      showToast('✅ Google Sheets URL успішно збережено!');
    } else {
      showToast('ℹ️ Google Sheets URL видалено.');
    }
  });

  sheetsOverlay.addEventListener('click', (e) => {
    if (e.target === sheetsOverlay) {
      sheetsOverlay.classList.remove('active');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 4. VENUE ACTIONS (COPY ADDRESS & MAPS)                                      */
/* -------------------------------------------------------------------------- */
function initVenueActions() {
  const copyBtn = document.getElementById('copy-address-btn');
  const toast = document.getElementById('toast-notification');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const addressText = "MORAY Resort, вул. Шкільна 24А, Крюківщина, Київська область, Україна";
      navigator.clipboard.writeText(addressText).then(() => {
        showToast('Адресу успішно скопійовано!');
      }).catch(() => {
        showToast('Адреса: ' + addressText);
      });
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--color-dark-eucalyptus);
      color: #FFFFFF;
      padding: 0.8rem 1.6rem;
      border-radius: var(--radius-pill);
      font-size: 0.9rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 3000;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 3000);
}

/* -------------------------------------------------------------------------- */
/* 5. INTERSECTION OBSERVER REVEAL ANIMATIONS                                 */
/* -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up, .reveal-blur');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* -------------------------------------------------------------------------- */
/* 6. COLOR PALETTE SWATCH INTERACTION                                        */
/* -------------------------------------------------------------------------- */
function initColorPaletteInteractions() {
  const swatches = document.querySelectorAll('.color-swatch-item');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const colorName = swatch.querySelector('.color-name')?.textContent;
      if (colorName) {
        showToast(`Обраний колір: ${colorName}`);
      }
    });
  });
}
