const annee = document.querySelector("#annee");
if (annee) annee.textContent = new Date().getFullYear();

const elements = document.querySelectorAll(".apparition");
const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !mouvementReduit) {
  const observateur = new IntersectionObserver((entrees, observateurActif) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) {
        entree.target.classList.add("visible");
        observateurActif.unobserve(entree.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observateur.observe(element));
} else {
  elements.forEach((element) => element.classList.add("visible"));
}