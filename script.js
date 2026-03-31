const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll("[data-reveal]");
const filterButtons = document.querySelectorAll(".filter-button");
const portfolioCards = document.querySelectorAll(".portfolio-card");
const portfolioStatus = document.getElementById("portfolio-status");
const contactForm = document.querySelector('[data-form="contact"]');
const tickerTracks = document.querySelectorAll(".ticker__track");
const servicesRail = document.querySelector(".services-rail");
const servicesSection = document.getElementById("services");
const servicesRailLinks = servicesRail ? Array.from(servicesRail.querySelectorAll(".services-rail__item")) : [];
const serviceCards = servicesSection ? Array.from(servicesSection.querySelectorAll(".service-card[id]")) : [];

const filterMessages = {
  all: "Ниже показаны фото-направления, видеоподача и цифровые решения агентства.",
  photo: "Показываем фотоформаты: каталоги, лукбуки, beauty-съёмки и рабочую визуальную подачу.",
  video: "В фокусе видеоформаты: вертикальный продакшн, сериал, видео-кейсы и брендированный контент.",
  digital: "Здесь собраны цифровые решения: 2D, 3D, цифровые аватары и AI-автоматизация."
};

if (navToggle && header && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "Закрыть" : "Меню";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Меню";
    });
  });
}

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const updateServicesRailState = () => {
  if (!servicesRail || !servicesSection) return;

  const anchorLine = (header?.getBoundingClientRect().bottom || 84) + 24;
  const servicesRect = servicesSection.getBoundingClientRect();
  const shouldShow = servicesRect.top <= anchorLine && servicesRect.bottom >= anchorLine + 120;

  servicesRail.classList.toggle("is-visible", shouldShow);

  if (!shouldShow || !serviceCards.length) {
    servicesRailLinks.forEach((link) => link.classList.remove("is-active"));
    return;
  }

  let activeId = serviceCards[0].id;

  serviceCards.forEach((card) => {
    if (card.getBoundingClientRect().top <= anchorLine + 32) {
      activeId = card.id;
    }
  });

  servicesRailLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("is-active", targetId === activeId);
  });
};

updateHeaderState();
updateServicesRailState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("scroll", updateServicesRailState, { passive: true });
window.addEventListener("resize", updateServicesRailState, { passive: true });

if (tickerTracks.length) {
  let tickerFrame = 0;

  const setupTickerMarquee = () => {
    tickerTracks.forEach((track) => {
      const sourceGroup = track.querySelector(".ticker__group");
      const viewport = track.closest(".ticker__viewport");

      if (!sourceGroup || !viewport) return;

      const baseMarkup = sourceGroup.dataset.baseMarkup || sourceGroup.innerHTML;
      sourceGroup.dataset.baseMarkup = baseMarkup;
      sourceGroup.innerHTML = baseMarkup;

      track.querySelectorAll('.ticker__group[data-clone="true"]').forEach((clone) => clone.remove());

      let copies = 0;
      while (sourceGroup.scrollWidth < viewport.clientWidth * 1.5 && copies < 8) {
        sourceGroup.insertAdjacentHTML("beforeend", baseMarkup);
        copies += 1;
      }

      const clone = sourceGroup.cloneNode(true);
      clone.dataset.clone = "true";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  };

  const queueTickerSetup = () => {
    cancelAnimationFrame(tickerFrame);
    tickerFrame = requestAnimationFrame(setupTickerMarquee);
  };

  queueTickerSetup();
  window.addEventListener("load", queueTickerSetup);
  window.addEventListener("resize", queueTickerSetup, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(queueTickerSetup).catch(() => {});
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    portfolioCards.forEach((card) => {
      const isMatch = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-muted", !isMatch);
    });

    if (portfolioStatus) {
      portfolioStatus.textContent = filterMessages[filter] || filterMessages.all;
    }
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const note = contactForm.querySelector("[data-form-note]");
    const data = new FormData(contactForm);
    const subject = `Запрос с сайта AL.LEX: ${data.get("direction") || "новый проект"}`;
    const body = [
      `Имя или компания: ${data.get("brand") || "-"}`,
      `Телефон: ${data.get("phone") || "-"}`,
      `Электронная почта: ${data.get("email") || "-"}`,
      `Направление: ${data.get("direction") || "-"}`,
      `Сроки: ${data.get("deadline") || "-"}`,
      `Удобный канал связи: ${data.get("channel") || "-"}`,
      "",
      "Описание задачи:",
      data.get("task") || "-"
    ].join("\n");

    if (note) {
      note.textContent =
        "Откроется почтовое приложение с готовым письмом на адрес AL.LEX. Если письмо не открылось, можно написать напрямую на gars.video@mail.ru.";
    }

    window.location.href = `mailto:gars.video@mail.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
