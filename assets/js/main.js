// Language toggle, typed tagline, scroll reveals and the active nav link.
// The Portuguese copy is loaded first, from i18n.js.

const PT = window.I18N_PT;

const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const nodes = [...document.querySelectorAll("[data-i18n]")];
const EN = Object.fromEntries(nodes.map((node) => [node.dataset.i18n, node.innerHTML]));
const tagline = document.querySelector("[data-typed]");
const buttons = [...document.querySelectorAll(".lang button")];
let typing;

function type(text, delay) {
  clearTimeout(typing);
  tagline.parentElement.setAttribute("aria-label", text);
  tagline.setAttribute("aria-hidden", "true");
  if (reduceMotion) {
    tagline.textContent = text;
    return;
  }
  let shown = 0;
  tagline.textContent = "";
  const step = () => {
    tagline.textContent = text.slice(0, ++shown);
    if (shown < text.length) typing = setTimeout(step, 26);
  };
  typing = setTimeout(step, delay);
}

function setLang(lang, firstLoad = false) {
  const dict = lang === "pt" ? PT : EN;
  for (const node of nodes) {
    if (node !== tagline && dict[node.dataset.i18n] !== undefined) node.innerHTML = dict[node.dataset.i18n];
  }
  root.lang = lang === "pt" ? "pt-BR" : "en";
  for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  type(dict["hero.tagline"], firstLoad ? 1100 : 150);
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // Private windows can refuse storage; the choice just won't be remembered.
  }
}

for (const button of buttons) button.addEventListener("click", () => setLang(button.dataset.lang));

let saved = null;
try {
  saved = localStorage.getItem("lang");
} catch {
  saved = null;
}
setLang(saved === "pt" ? "pt" : "en", true);

// Reveal blocks as they scroll into view, staggered among their siblings.
const revealed = [...document.querySelectorAll("[data-reveal]")];
for (const el of revealed) {
  const siblings = [...el.parentElement.children].filter((child) => child.hasAttribute("data-reveal"));
  el.style.setProperty("--i", Math.max(0, siblings.indexOf(el)));
}
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add("in"));
}

// Mark the nav link of the section on screen.
const links = new Map([...document.querySelectorAll(".nav-links a")].map((a) => [a.hash.slice(1), a]));
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const link = links.get(entry.target.id);
        if (link && entry.isIntersecting) {
          links.forEach((a) => a.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  });
}

document.querySelector("[data-year]").textContent = new Date().getFullYear();
