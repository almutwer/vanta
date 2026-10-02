(function () {
  "use strict";

  const rootConfig = window.VANTA_ORDER_CONFIG || {};
  const sanityConfig = rootConfig.sanity || {};

  function isSafeToken(value, pattern) {
    return typeof value === "string" && pattern.test(value);
  }

  function isConfigured() {
    return isSafeToken(sanityConfig.projectId, /^[a-z0-9][a-z0-9-]+$/i)
      && isSafeToken(sanityConfig.dataset || "production", /^[a-z0-9_-]+$/i)
      && isSafeToken(sanityConfig.apiVersion || "2026-10-02", /^\d{4}-\d{2}-\d{2}$/);
  }

  function endpoint(query, params) {
    const projectId = sanityConfig.projectId;
    const dataset = sanityConfig.dataset || "production";
    const apiVersion = sanityConfig.apiVersion || "2026-10-02";
    const host = sanityConfig.useCdn === false ? "api.sanity.io" : "apicdn.sanity.io";
    const url = new URL(`https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}`);
    url.searchParams.set("query", query);
    Object.entries(params || {}).forEach(([key, value]) => url.searchParams.set(`$${key}`, JSON.stringify(value)));
    return url.toString();
  }

  function setText(cmsKey, value) {
    if (typeof value !== "string" || !value.trim()) return;
    const element = document.querySelector(`[data-cms="${cmsKey}"]`);
    if (!element) return;
    element.textContent = value.trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderBadges(badges) {
    if (!Array.isArray(badges) || !badges.length) return;
    const target = document.querySelector('[data-cms-list="trustBadges"]');
    if (!target) return;
    target.innerHTML = badges
      .filter((badge) => typeof badge === "string" && badge.trim())
      .slice(0, 4)
      .map((badge) => `<span>${escapeHtml(badge)}</span>`)
      .join("");
  }

  function renderServices(services) {
    if (!Array.isArray(services) || !services.length) return;
    const target = document.querySelector('[data-cms-list="services"]');
    if (!target) return;
    target.innerHTML = services
      .filter((service) => service && service.title && service.description)
      .slice(0, 6)
      .map((service, index) => {
        const number = String(index + 1).padStart(2, "0");
        return `
          <article class="service-card" data-animate style="--delay: ${index * 90}ms">
            <span class="service-icon">${number}</span>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderSteps(steps) {
    if (!Array.isArray(steps) || !steps.length) return;
    const target = document.querySelector('[data-cms-list="steps"]');
    if (!target) return;
    target.innerHTML = steps
      .filter((step) => step && step.title && step.text)
      .slice(0, 5)
      .map((step, index) => `
        <li data-animate style="--delay: ${index * 90}ms">
          <strong>${escapeHtml(step.title)}</strong>
          <span>${escapeHtml(step.text)}</span>
        </li>
      `)
      .join("");
  }

  function applySiteContent(content) {
    if (!content) return;

    const fields = {
      "hero.eyebrow": content.heroEyebrow,
      "hero.title": content.heroTitle,
      "hero.text": content.heroText,
      "hero.primaryCta": content.primaryCta,
      "hero.secondaryCta": content.secondaryCta,
      "services.eyebrow": content.servicesEyebrow,
      "services.title": content.servicesTitle,
      "services.text": content.servicesText,
      "workflow.eyebrow": content.workflowEyebrow,
      "workflow.title": content.workflowTitle,
      "workflow.text": content.workflowText,
      "order.eyebrow": content.orderEyebrow,
      "order.title": content.orderTitle,
      "order.text": content.orderText,
      "contact.eyebrow": content.contactEyebrow,
      "contact.title": content.contactTitle,
      "contact.text": content.contactText,
      "footer.text": content.footerText
    };

    Object.entries(fields).forEach(([key, value]) => setText(key, value));
    renderBadges(content.trustBadges);
    renderServices(content.services);
    renderSteps(content.steps);

    if (window.VantaAnimations) window.VantaAnimations.refresh();
  }

  async function loadSiteContent() {
    if (!isConfigured()) return null;

    const slug = sanityConfig.homeSlug || "home";
    const query = `*[_type == "siteSettings" && slug.current == $slug][0]{
      heroEyebrow,
      heroTitle,
      heroText,
      primaryCta,
      secondaryCta,
      trustBadges,
      servicesEyebrow,
      servicesTitle,
      servicesText,
      services[]{title, description},
      workflowEyebrow,
      workflowTitle,
      workflowText,
      steps[]{title, text},
      orderEyebrow,
      orderTitle,
      orderText,
      contactEyebrow,
      contactTitle,
      contactText,
      footerText
    }`;

    try {
      const response = await fetch(endpoint(query, { slug }));
      if (!response.ok) throw new Error("Sanity request failed");
      const payload = await response.json();
      applySiteContent(payload.result);
      return payload.result;
    } catch (error) {
      console.warn("Vanta Sanity content was not loaded.", error);
      return null;
    }
  }

  window.VantaSanity = {
    loadSiteContent,
    applySiteContent
  };

  loadSiteContent();
})();
