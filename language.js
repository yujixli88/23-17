function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-ru][data-en]").forEach(element => {
      element.textContent = element.dataset[lang];
  });

  document.querySelectorAll("[data-ru-placeholder][data-en-placeholder]")
      .forEach(element => {
          element.placeholder = element.dataset[`${lang}Placeholder`];
      });

  localStorage.setItem("language", lang);
}

const savedLanguage = localStorage.getItem("language") || "ru";
setLanguage(savedLanguage);