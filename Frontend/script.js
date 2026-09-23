const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const items = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((item) => observer.observe(item));
} else {
  items.forEach((item) => item.classList.add("is-visible"));
}