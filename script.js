// Mobile navigation menu toggle
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Smooth scrolling for all internal links
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

const setActiveLink = () => {
  const scrollPosition = window.scrollY + 120;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPosition >= top && scrollPosition < top + height) {
      navItems.forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${id}`) {
          item.classList.add('active');
        }
      });
    }
  });
};

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// Reveal animation on scroll
const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Typing animation for job title
const typingTarget = document.querySelector('.typing-text');
const fullText = 'Student | First Year IT Developer';

let index = 0;

function typeText() {
  if (!typingTarget) return;

  typingTarget.textContent = fullText.slice(0, index);
  index += 1;

  if (index <= fullText.length) {
    setTimeout(typeText, 90);
  } else {
    setTimeout(() => {
      index = 0;
      typeText();
    }, 1500);
  }
}

typeText();

// Contact form validation
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

const setFieldError = (field, message) => {
  const input = document.getElementById(field);
  const errorMessage = input.parentElement.querySelector('.error-message');

  if (!input || !errorMessage) return;

  input.classList.toggle('invalid', Boolean(message));
  errorMessage.textContent = message;
};

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    let valid = true;

    if (!name.value.trim()) {
      setFieldError('name', 'Please enter your name.');
      valid = false;
    } else {
      setFieldError('name', '');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setFieldError('email', 'Please enter your email.');
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      setFieldError('email', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('email', '');
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError('message', 'Message must be at least 10 characters long.');
      valid = false;
    } else {
      setFieldError('message', '');
    }

    if (!valid) {
      formMessage.textContent = 'Please fix the highlighted fields and try again.';
      formMessage.className = 'form-message error';
      return;
    }

    formMessage.textContent = 'Your message has been sent successfully!';
    formMessage.className = 'form-message success';
    contactForm.reset();
  });
}

// Back-to-top button
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

// Button interactions
const buttons = document.querySelectorAll('.btn, .project-link, .social-links a');
buttons.forEach((button) => {
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = '';
  });
});
