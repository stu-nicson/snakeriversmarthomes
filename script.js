// Shared interactions for the static Snake River Smart Homes website.
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 12);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    });
  });
}

// Highlight the current page in the navigation.
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-menu a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// FAQ accordion behavior.
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector("span").textContent = isOpen ? "-" : "+";
  });
});

// Subtle tilt on service cards for pointer users.
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-3px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

// Client-side validation for the consultation form.
const form = document.querySelector("#consultation-form");
if (form) {
  const validators = {
    name: (value) => value.trim().length >= 2 || "Please enter your name.",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please enter a valid email address.",
    phone: (value) => value.replace(/\D/g, "").length >= 10 || "Please enter a valid phone number.",
    city: (value) => value.trim().length >= 2 || "Please enter your city.",
    services: (value) => value.trim() !== "" || "Please choose a service.",
    message: (value) => value.trim().length >= 10 || "Please share a little more about what you need."
  };

  function validateField(field) {
    const row = field.closest(".form-row");
    const message = row.querySelector(".error-message");
    const validator = validators[field.name];
    if (!validator) return true;

    const result = validator(field.value);
    const isValid = result === true;
    row.classList.toggle("invalid", !isValid);
    message.textContent = isValid ? "" : result;
    field.setAttribute("aria-invalid", String(!isValid));
    return isValid;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-row").classList.contains("invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Array.from(form.querySelectorAll("input, select, textarea"));
    const isValid = fields.every(validateField);
    const status = form.querySelector(".form-status");

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields before submitting.";
      return;
    }

    status.textContent = "Thanks. Your consultation request is ready to send. Please call or email Nicson to finish scheduling.";
    form.reset();
  });
}
