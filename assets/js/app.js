(function () {
  "use strict";

  const pricing = window.VantaPricing;
  const externalConfig = window.VANTA_ORDER_CONFIG || {};
  const orderForm = document.querySelector("[data-order-form]");
  const estimateNodes = {
    product: document.querySelector("[data-estimate-product]"),
    quantity: document.querySelector("[data-estimate-quantity]"),
    unit: document.querySelector("[data-estimate-unit]"),
    items: document.querySelector("[data-estimate-items]"),
    setup: document.querySelector("[data-estimate-setup]"),
    design: document.querySelector("[data-estimate-design]"),
    rush: document.querySelector("[data-estimate-rush]"),
    total: document.querySelector("[data-estimate-total]"),
    note: document.querySelector("[data-estimate-note]")
  };
  const submitButton = document.querySelector("[data-submit-order]");
  const statusBox = document.querySelector("[data-form-status]");
  const endpointStatus = document.querySelector("[data-endpoint-status]");
  const yearNode = document.querySelector("[data-current-year]");

  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const productSelect = document.querySelector("#product");
  const sizeSelect = document.querySelector("#size");
  const finishSelect = document.querySelector("#finish");
  const rushSelect = document.querySelector("#rush");

  function populateOptions() {
    fillSelect(productSelect, pricing.CONFIG.products);
    fillSelect(sizeSelect, pricing.CONFIG.sizes);
    fillSelect(finishSelect, pricing.CONFIG.finishes);
    fillSelect(rushSelect, pricing.CONFIG.rushOptions);
  }

  function fillSelect(select, source) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = Object.entries(source)
      .map(([key, value]) => `<option value="${key}">${value.nameAr}</option>`)
      .join("");
    if (current && source[current]) select.value = current;
  }

  function formValue(name) {
    const field = orderForm.elements[name];
    if (!field) return "";
    if (field.type === "checkbox") return field.checked;
    return field.value;
  }

  function getCalculationInput() {
    return {
      product: formValue("product"),
      quantity: formValue("quantity"),
      size: formValue("size"),
      printSides: formValue("printSides"),
      colors: formValue("colors"),
      finish: formValue("finish"),
      rush: formValue("rush"),
      designService: Boolean(formValue("designService"))
    };
  }

  function money(value) {
    return pricing.formatMoney(value);
  }

  function renderEstimate() {
    if (!orderForm) return null;
    try {
      const result = pricing.calculateOrder(getCalculationInput());
      estimateNodes.product.textContent = result.productName;
      estimateNodes.quantity.textContent = `${result.quantity} قطعة`;
      estimateNodes.unit.textContent = money(result.unitPrice);
      estimateNodes.items.textContent = money(result.itemsSubtotal);
      estimateNodes.setup.textContent = money(result.setupFee);
      estimateNodes.design.textContent = result.designFee > 0n ? money(result.designFee) : "0.00 ج.س";
      estimateNodes.rush.textContent = result.rushFee > 0n ? money(result.rushFee) : "0.00 ج.س";
      estimateNodes.total.textContent = money(result.total);
      estimateNodes.note.textContent = `تم الحساب بفئة كمية تبدأ من ${result.selectedTierMin} قطعة، مع ${result.colors} لون/ألوان على ${result.printSides} وجه.`;
      estimateNodes.note.classList.remove("is-error");
      return result;
    } catch (error) {
      estimateNodes.note.textContent = error.message;
      estimateNodes.note.classList.add("is-error");
      estimateNodes.total.textContent = "—";
      return null;
    }
  }

  function setStatus(message, type) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = `form-status ${type || ""}`.trim();
    statusBox.hidden = !message;
  }

  function configuredEndpoint() {
    const url = String(externalConfig.googleScriptUrl || externalConfig.orders?.googleScriptUrl || "").trim();
    if (!url || url.includes("PASTE_") || url.includes("YOUR_")) return "";
    return url;
  }

  function updateEndpointStatus() {
    if (!endpointStatus) return;
    endpointStatus.hidden = true;
  }

  function generateOrderId() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const stamp = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("");
    const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join("");
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VAN-${stamp}-${time}-${random}`;
  }

  function buildPayload(result) {
    const now = new Date();
    return {
      submittedAt: now.toISOString(),
      orderId: generateOrderId(),
      customerName: formValue("customerName").trim(),
      phone: formValue("phone").trim(),
      businessName: formValue("businessName").trim(),
      city: formValue("city").trim() || externalConfig.defaultCity || "",
      productKey: result.productKey,
      productName: result.productName,
      quantity: String(result.quantity),
      size: result.sizeName,
      printSides: String(result.printSides),
      colors: String(result.colors),
      finish: result.finishName,
      rush: result.rushName,
      designService: result.designFee > 0n ? "نعم" : "لا",
      deadline: formValue("deadline"),
      notes: formValue("notes").trim(),
      baseUnit: pricing.decimalMoneyString(result.baseUnit),
      sizeFee: pricing.decimalMoneyString(result.sizeFee),
      colorFee: pricing.decimalMoneyString(result.colorFee),
      finishFee: pricing.decimalMoneyString(result.finishFee),
      unitPrice: pricing.decimalMoneyString(result.unitPrice),
      itemsSubtotal: pricing.decimalMoneyString(result.itemsSubtotal),
      setupFee: pricing.decimalMoneyString(result.setupFee),
      designFee: pricing.decimalMoneyString(result.designFee),
      rushFee: pricing.decimalMoneyString(result.rushFee),
      total: pricing.decimalMoneyString(result.total),
      totalQirsh: result.total.toString(),
      currency: pricing.CONFIG.currency,
      calculationVersion: "2026-10-02"
    };
  }

  function storeLocalCopy(payload) {
    const key = "vantaOrders";
    const previous = JSON.parse(localStorage.getItem(key) || "[]");
    previous.unshift(payload);
    localStorage.setItem(key, JSON.stringify(previous.slice(0, 30)));
  }

  async function sendToGoogleSheet(payload) {
    const endpoint = configuredEndpoint();
    if (!endpoint) return { sent: false, reason: "missing-endpoint" };

    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      keepalive: true
    });
    return { sent: true };
  }

  function validateRequiredFields() {
    const requiredFields = ["customerName", "phone", "businessName"];
    for (const name of requiredFields) {
      const field = orderForm.elements[name];
      if (!field.value.trim()) {
        field.focus();
        throw new Error("أكمل الاسم ورقم الهاتف واسم النشاط التجاري قبل إرسال الطلب.");
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("", "");

    let result;
    try {
      validateRequiredFields();
      result = pricing.calculateOrder(getCalculationInput());
    } catch (error) {
      setStatus(error.message, "error");
      return;
    }

    const payload = buildPayload(result);
    storeLocalCopy(payload);

    submitButton.disabled = true;
    submitButton.textContent = "جاري الإرسال...";

    try {
      const response = await sendToGoogleSheet(payload);
      if (response.sent) {
        setStatus(`تم إرسال طلبك رقم ${payload.orderId}. الإجمالي التقديري: ${pricing.formatMoney(result.total)}. سنتواصل معك لتأكيد التفاصيل.`, "success");
        orderForm.reset();
        document.querySelector("#quantity").value = "100";
        renderEstimate();
      } else {
        setStatus(`تعذر إرسال الطلب الآن. الرجاء التواصل معنا مباشرة لتأكيد الطلب. رقم الطلب المرجعي: ${payload.orderId}.`, "warning");
      }
    } catch (error) {
      setStatus(`تعذر إرسال الطلب الآن. الرجاء المحاولة لاحقاً أو التواصل معنا مباشرة. رقم الطلب المرجعي: ${payload.orderId}.`, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "إرسال الطلب";
    }
  }

  let animationObserver;

  function revealAnimatedElement(element) {
    element.classList.add("is-visible");
    if (animationObserver) animationObserver.unobserve(element);
  }

  function initAnimations() {
    const elements = Array.from(document.querySelectorAll("[data-animate]"));
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    if (!animationObserver) {
      animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) revealAnimatedElement(entry.target);
        });
      }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    }

    elements.forEach((element) => {
      if (element.dataset.animationReady === "true") return;
      element.dataset.animationReady = "true";
      animationObserver.observe(element);
    });
  }

  window.VantaAnimations = { refresh: initAnimations };

  function init() {
    initAnimations();
    if (!orderForm || !pricing) return;
    populateOptions();
    updateEndpointStatus();
    orderForm.addEventListener("input", renderEstimate);
    orderForm.addEventListener("change", renderEstimate);
    orderForm.addEventListener("submit", handleSubmit);
    renderEstimate();
  }

  init();
})();
