const header = document.querySelector(".site-header");
const headerWrap = document.querySelector(".site-header-wrap");
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.querySelector(".site-nav-mobile");
const revealItems = document.querySelectorAll("[data-reveal]");
const filterButtons = document.querySelectorAll(".filter-button");
const portfolioCards = document.querySelectorAll(".portfolio-card");
const portfolioStatus = document.getElementById("portfolio-status");
const tickerTracks = document.querySelectorAll(".ticker__track");
const servicesRail = document.querySelector(".services-rail");
const servicesSection = document.getElementById("services");
const servicesRailLinks = servicesRail ? Array.from(servicesRail.querySelectorAll(".services-rail__item")) : [];
const serviceCards = servicesSection ? Array.from(servicesSection.querySelectorAll(".service-card[id]")) : [];
const contactTabButtons = Array.from(document.querySelectorAll("[data-contact-tab]"));
const contactTabPanels = Array.from(document.querySelectorAll("[data-contact-panel]"));
const contactTabTriggers = Array.from(document.querySelectorAll("[data-contact-tab-trigger]"));
const requestApplyForm = document.getElementById("request-apply-form");
const castingApplyForm = document.getElementById("casting-apply-form");
const castingModeToggle = document.getElementById("casting-mode-toggle");
const castingModeInputs = castingApplyForm ? Array.from(castingApplyForm.querySelectorAll('input[name="castingMode"]')) : [];
const castingModeTriggers = Array.from(document.querySelectorAll("[data-casting-mode-trigger]"));
const phoneInputs = Array.from(document.querySelectorAll('input[type="tel"]'));

if (mobileNav && mobileNav.parentElement !== document.body) {
  document.body.appendChild(mobileNav);
}

const filterMessages = {
  all: "Ниже показаны фото-направления, видеоподача и цифровые решения агентства.",
  photo: "Показываем фотоформаты: каталоги, лукбуки, beauty-съёмки и рабочую визуальную подачу.",
  video: "В фокусе видеоформаты: вертикальный продакшен, сериал, видео-кейсы и брендированный контент.",
  digital: "Здесь собраны цифровые решения: 2D, 3D, цифровые аватары и AI-автоматизация."
};

if (navToggle && header && headerWrap && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = headerWrap.classList.toggle("is-open");
    mobileNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "Закрыть" : "Меню";
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      headerWrap.classList.remove("is-open");
      mobileNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Меню";
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) {
      headerWrap.classList.remove("is-open");
      mobileNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Меню";
    }
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

const setContactTab = (tab) => {
  const normalizedTab = tab === "casting" ? "casting" : "request";

  contactTabButtons.forEach((button) => {
    const isActive = button.dataset.contactTab === normalizedTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  contactTabPanels.forEach((panel) => {
    const isActive = panel.dataset.contactPanel === normalizedTab;
    panel.hidden = !isActive;

    const panelForm = panel.querySelector("form");

    if (!panelForm) {
      return;
    }

    panelForm.querySelectorAll("input, select, textarea, button").forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement || field instanceof HTMLButtonElement)) {
        return;
      }

      field.disabled = !isActive;
    });
  });
};

if (contactTabButtons.length && contactTabPanels.length) {
  contactTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setContactTab(button.dataset.contactTab || "request");
    });
  });

  contactTabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setContactTab(trigger.dataset.contactTabTrigger || "request");
    });
  });

  const initialTab =
    contactTabButtons.find((button) => button.classList.contains("is-active"))?.dataset.contactTab ||
    contactTabPanels.find((panel) => !panel.hidden)?.dataset.contactPanel ||
    "request";

  setContactTab(initialTab);
}

const setCastingMode = (mode) => {
  const normalizedMode = mode === "online" ? "online" : "offline";
  const modeValue = normalizedMode === "online" ? "Онлайн" : "Офлайн";

  if (castingModeToggle) {
    castingModeToggle.dataset.mode = normalizedMode;
  }

  castingModeInputs.forEach((input) => {
    input.checked = input.value === modeValue;
  });
};

if (castingModeInputs.length) {
  castingModeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      setCastingMode(input.value === "Онлайн" ? "online" : "offline");
    });
  });

  const initiallyCheckedMode = castingModeInputs.find((input) => input.checked)?.value === "Онлайн" ? "online" : "offline";
  setCastingMode(initiallyCheckedMode);
}

if (castingModeTriggers.length) {
  castingModeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      setCastingMode(trigger.dataset.castingModeTrigger || "offline");
    });
  });
}

const normalizeRuPhoneDigits = (value = "") => {
  let digits = String(value).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
};

const formatRuPhoneValue = (digits = "") => {
  if (!digits) {
    return "+7";
  }

  const parts = ["+7"];

  if (digits.length > 0) {
    parts.push(` (${digits.slice(0, 3)}`);
  }

  if (digits.length >= 4) {
    parts.push(`) ${digits.slice(3, 6)}`);
  }

  if (digits.length >= 7) {
    parts.push(`-${digits.slice(6, 8)}`);
  }

  if (digits.length >= 9) {
    parts.push(`-${digits.slice(8, 10)}`);
  }

  return parts.join("");
};

const applyRuPhoneMask = (input, { allowEmpty = false } = {}) => {
  const digits = normalizeRuPhoneDigits(input.value);

  if (!digits && allowEmpty) {
    input.value = "";
    return;
  }

  input.value = formatRuPhoneValue(digits);
};

if (phoneInputs.length) {
  phoneInputs.forEach((input) => {
    input.setAttribute("inputmode", "tel");
    input.setAttribute("maxlength", "18");

    if (input.value) {
      applyRuPhoneMask(input, { allowEmpty: true });
    }

    input.addEventListener("focus", () => {
      if (!normalizeRuPhoneDigits(input.value)) {
        input.value = "+7";
      }
    });

    input.addEventListener("input", () => {
      applyRuPhoneMask(input);

      if (typeof input.setSelectionRange === "function") {
        requestAnimationFrame(() => {
          input.setSelectionRange(input.value.length, input.value.length);
        });
      }
    });

    input.addEventListener("paste", () => {
      requestAnimationFrame(() => {
        applyRuPhoneMask(input);
      });
    });

    input.addEventListener("blur", () => {
      applyRuPhoneMask(input, { allowEmpty: true });
    });
  });
}

const setFormStatus = (statusElement, message = "", tone = "") => {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.classList.remove("form-status--pending", "form-status--success", "form-status--error");

  if (tone) {
    statusElement.classList.add(`form-status--${tone}`);
  }
};

const setFormFieldValue = (form, name, value) => {
  const field = form.elements.namedItem(name);

  if (!field || !("value" in field)) {
    return;
  }

  field.value = value;
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildMessageRow = (label, value, type = "text") => {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  const content =
    type === "link"
      ? `<a href="${safeValue}" target="_blank" rel="noreferrer" style="color:#0f4c81;text-decoration:none;">${safeValue}</a>`
      : type === "multiline"
        ? safeValue.replaceAll("\n", "<br />")
        : safeValue;

  return `
    <tr>
      <td style="padding:10px 12px;border:1px solid #d8e1eb;font-weight:700;background:#f7f9fc;">${safeLabel}</td>
      <td style="padding:10px 12px;border:1px solid #d8e1eb;">${content}</td>
    </tr>
  `;
};

const buildMessageHtml = (title, rows) =>
  [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;">`,
    `<p style="margin:0 0 16px;"><strong>${escapeHtml(title)}</strong></p>`,
    `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">`,
    rows.map((row) => buildMessageRow(row.label, row.value, row.type)).join(""),
    `</table>`,
    `</div>`
  ].join("");

const buildPlainMessage = (title, rows) =>
  [
    title,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`)
  ].join("\n");

const syncRequestTemplateFields = (form) => {
  const formData = new FormData(form);
  const siteName = String(formData.get("site_name") || "AL.LEX");
  const contactName = String(formData.get("name") || "Без имени");
  const requestMessage = String(formData.get("message") || "-");
  const submittedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());

  const rows = [
    { label: "Имя", value: contactName },
    { label: "Телефон", value: String(formData.get("phone") || "-") },
    { label: "Почта", value: String(formData.get("email") || "-") },
    { label: "Запрос", value: requestMessage, type: "multiline" },
    { label: "Отправлено", value: submittedAt }
  ];

  const subject = `${siteName}: новая заявка от ${contactName}`;
  const messageHtml = buildMessageHtml(`Новая заявка с сайта ${siteName}.`, rows);

  setFormFieldValue(form, "subject", subject);
  setFormFieldValue(form, "submitted_at", submittedAt);
  setFormFieldValue(form, "message", requestMessage);
  setFormFieldValue(form, "message_html", messageHtml);
};

const syncCastingTemplateFields = (form) => {
  const formData = new FormData(form);
  const siteName = String(formData.get("site_name") || "AL.LEX");
  const fullName = String(formData.get("fullName") || "Без имени");
  const castingMode = String(formData.get("castingMode") || "Офлайн");
  const height = String(formData.get("height") || "").trim();
  const submittedAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());

  const rows = [
    { label: "Формат кастинга", value: castingMode },
    { label: "ФИО", value: fullName },
    { label: "Город", value: String(formData.get("city") || "-") },
    { label: "Рост", value: height ? `${height} см` : "-" },
    { label: "Возраст", value: String(formData.get("age") || "-") },
    { label: "Опыт в моделинге", value: String(formData.get("experience") || "-") },
    { label: "Ссылка на MAX", value: String(formData.get("social") || "-"), type: "link" },
    { label: "Телефон", value: String(formData.get("phone") || "-") },
    { label: "Отправлено", value: submittedAt }
  ];

  const subject = `${siteName}: заявка на кастинг [${castingMode}] от ${fullName}`;
  const message = buildPlainMessage(`Новая заявка на кастинг с сайта ${siteName}.`, rows);
  const messageHtml = buildMessageHtml(`Новая заявка на кастинг с сайта ${siteName}.`, rows);

  setFormFieldValue(form, "subject", subject);
  setFormFieldValue(form, "submitted_at", submittedAt);
  setFormFieldValue(form, "message", message);
  setFormFieldValue(form, "message_html", messageHtml);
};

const extractSubmitErrorMessage = (error, fallbackMessage) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "text" in error && typeof error.text === "string" && error.text) {
    return `${fallbackMessage.replace(/\.\s*$/, "")}: ${error.text}`;
  }

  return fallbackMessage;
};

const setupEmailForm = (form, options) => {
  if (!form) {
    return;
  }

  const statusElement = form.querySelector("[data-form-status]");
  const submitButton = form.querySelector('[type="submit"]');
  const emailjsConfig = {
    serviceId: form.dataset.emailjsServiceId?.trim() || "default_service",
    templateId: form.dataset.emailjsTemplateId?.trim() || "",
    publicKey: form.dataset.emailjsPublicKey?.trim() || ""
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const panel = form.closest("[data-contact-panel]");

    if (panel && panel.hidden) {
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setFormStatus(statusElement, options.pendingMessage, "pending");

    try {
      if (!window.emailjs || typeof window.emailjs.init !== "function" || typeof window.emailjs.sendForm !== "function") {
        throw new Error("EmailJS не загрузился. Проверьте подключение SDK.");
      }

      if (!emailjsConfig.templateId || !emailjsConfig.publicKey) {
        throw new Error("Заполните data-emailjs-template-id и data-emailjs-public-key в форме.");
      }

      options.syncFields(form);
      window.emailjs.init({ publicKey: emailjsConfig.publicKey });
      await window.emailjs.sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, form);

      form.reset();
      options.afterSuccess?.(form);
      setFormStatus(statusElement, options.successMessage, "success");
    } catch (error) {
      setFormStatus(statusElement, extractSubmitErrorMessage(error, options.errorMessage), "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
};

setupEmailForm(requestApplyForm, {
  pendingMessage: "Отправляем заявку...",
  successMessage: "Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
  errorMessage: "Не удалось отправить заявку. Попробуйте еще раз.",
  syncFields: syncRequestTemplateFields
});

setupEmailForm(castingApplyForm, {
  pendingMessage: "Отправляем анкету...",
  successMessage: "Заявка на кастинг отправлена. Мы свяжемся с вами после проверки.",
  errorMessage: "Не удалось отправить заявку на кастинг. Попробуйте еще раз.",
  syncFields: syncCastingTemplateFields,
  afterSuccess: () => {
    setCastingMode("offline");
  }
});
