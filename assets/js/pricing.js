(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VantaPricing = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const QIRSH_PER_SDG = 100n;

  function sdg(value) {
    if (!Number.isInteger(value)) {
      throw new TypeError("Money values must be integers in Sudanese pounds.");
    }
    return BigInt(value) * QIRSH_PER_SDG;
  }

  const CONFIG = Object.freeze({
    currency: "ج.س",
    minQuantity: 50,
    maxQuantity: 100000,
    designFee: sdg(10000),
    products: Object.freeze({
      "paper-bags": Object.freeze({
        nameAr: "أكياس ورقية مطبوعة",
        setupFee: sdg(8500),
        colorUnitFee: sdg(85),
        minQuantity: 50,
        tiers: Object.freeze([
          Object.freeze({ min: 50, unit: sdg(550) }),
          Object.freeze({ min: 100, unit: sdg(480) }),
          Object.freeze({ min: 500, unit: sdg(420) }),
          Object.freeze({ min: 1000, unit: sdg(360) })
        ])
      }),
      "fabric-bags": Object.freeze({
        nameAr: "حقائب قماش دعائية",
        setupFee: sdg(12000),
        colorUnitFee: sdg(140),
        minQuantity: 50,
        tiers: Object.freeze([
          Object.freeze({ min: 50, unit: sdg(900) }),
          Object.freeze({ min: 100, unit: sdg(820) }),
          Object.freeze({ min: 500, unit: sdg(740) }),
          Object.freeze({ min: 1000, unit: sdg(680) })
        ])
      }),
      "promo-bags": Object.freeze({
        nameAr: "حقائب دعائية فاخرة",
        setupFee: sdg(15000),
        colorUnitFee: sdg(180),
        minQuantity: 50,
        tiers: Object.freeze([
          Object.freeze({ min: 50, unit: sdg(1300) }),
          Object.freeze({ min: 100, unit: sdg(1180) }),
          Object.freeze({ min: 500, unit: sdg(1050) }),
          Object.freeze({ min: 1000, unit: sdg(950) })
        ])
      })
    }),
    sizes: Object.freeze({
      small: Object.freeze({ nameAr: "صغير", fee: sdg(0) }),
      medium: Object.freeze({ nameAr: "متوسط", fee: sdg(70) }),
      large: Object.freeze({ nameAr: "كبير", fee: sdg(140) })
    }),
    finishes: Object.freeze({
      none: Object.freeze({ nameAr: "بدون تشطيب إضافي", fee: sdg(0) }),
      matte: Object.freeze({ nameAr: "تغليف مطفي", fee: sdg(120) }),
      glossy: Object.freeze({ nameAr: "تغليف لامع", fee: sdg(120) }),
      reinforced: Object.freeze({ nameAr: "يد مقواة", fee: sdg(180) })
    }),
    rushOptions: Object.freeze({
      normal: Object.freeze({ nameAr: "تنفيذ عادي", basisPoints: 0n }),
      express: Object.freeze({ nameAr: "مستعجل 15%", basisPoints: 1500n }),
      urgent: Object.freeze({ nameAr: "طارئ 25%", basisPoints: 2500n })
    })
  });

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function parseInteger(value, fieldName) {
    const stringValue = String(value ?? "").trim();
    if (!/^\d+$/.test(stringValue)) {
      throw new Error(`${fieldName} يجب أن يكون رقماً صحيحاً بدون كسور.`);
    }
    const parsed = Number(stringValue);
    if (!Number.isSafeInteger(parsed)) {
      throw new Error(`${fieldName} أكبر من الحد المسموح.`);
    }
    return parsed;
  }

  function selectTier(product, quantity) {
    let chosenTier = product.tiers[0];
    for (const tier of product.tiers) {
      if (quantity >= tier.min) {
        chosenTier = tier;
      }
    }
    return chosenTier;
  }

  function multiplyMoney(amount, quantity) {
    return amount * BigInt(quantity);
  }

  function roundBasisPoints(amount, basisPoints) {
    if (basisPoints === 0n) return 0n;
    // تقريب لنصف قرش فأعلى بدون استخدام الأعداد العشرية لتجنّب أخطاء floating point.
    return (amount * basisPoints + 5000n) / 10000n;
  }

  function designServiceEnabled(value) {
    return value === true || value === "true" || value === "on" || value === "1" || value === 1;
  }

  function calculateOrder(input) {
    const productKey = String(input.product || "paper-bags");
    const sizeKey = String(input.size || "small");
    const finishKey = String(input.finish || "none");
    const rushKey = String(input.rush || "normal");

    if (!hasOwn(CONFIG.products, productKey)) throw new Error("نوع المنتج غير معروف.");
    if (!hasOwn(CONFIG.sizes, sizeKey)) throw new Error("المقاس غير معروف.");
    if (!hasOwn(CONFIG.finishes, finishKey)) throw new Error("خيار التشطيب غير معروف.");
    if (!hasOwn(CONFIG.rushOptions, rushKey)) throw new Error("خيار سرعة التنفيذ غير معروف.");

    const product = CONFIG.products[productKey];
    const size = CONFIG.sizes[sizeKey];
    const finish = CONFIG.finishes[finishKey];
    const rush = CONFIG.rushOptions[rushKey];

    const quantity = parseInteger(input.quantity, "الكمية");
    const minQuantity = product.minQuantity || CONFIG.minQuantity;
    if (quantity < minQuantity) throw new Error(`أقل كمية لهذا المنتج هي ${minQuantity}.`);
    if (quantity > CONFIG.maxQuantity) throw new Error(`أكبر كمية مسموحة هي ${CONFIG.maxQuantity}.`);

    const colors = parseInteger(input.colors, "عدد الألوان");
    if (colors < 1 || colors > 6) throw new Error("عدد الألوان يجب أن يكون بين 1 و 6.");

    const printSides = parseInteger(input.printSides, "عدد أوجه الطباعة");
    if (![1, 2].includes(printSides)) throw new Error("عدد أوجه الطباعة يجب أن يكون 1 أو 2 فقط.");

    const tier = selectTier(product, quantity);
    const baseUnit = tier.unit;
    const sizeFee = size.fee;
    const colorFee = multiplyMoney(product.colorUnitFee, colors * printSides);
    const finishFee = finish.fee;
    const unitPrice = baseUnit + sizeFee + colorFee + finishFee;
    const itemsSubtotal = multiplyMoney(unitPrice, quantity);
    const setupFee = product.setupFee;
    const designFee = designServiceEnabled(input.designService) ? CONFIG.designFee : 0n;
    const subtotalBeforeRush = itemsSubtotal + setupFee + designFee;
    const rushFee = roundBasisPoints(subtotalBeforeRush, rush.basisPoints);
    const total = subtotalBeforeRush + rushFee;

    return Object.freeze({
      productKey,
      productName: product.nameAr,
      sizeKey,
      sizeName: size.nameAr,
      finishKey,
      finishName: finish.nameAr,
      rushKey,
      rushName: rush.nameAr,
      quantity,
      colors,
      printSides,
      selectedTierMin: tier.min,
      basisPoints: rush.basisPoints,
      baseUnit,
      sizeFee,
      colorFee,
      finishFee,
      unitPrice,
      itemsSubtotal,
      setupFee,
      designFee,
      subtotalBeforeRush,
      rushFee,
      total
    });
  }

  function decimalMoneyString(amount) {
    const value = BigInt(amount);
    const sign = value < 0n ? "-" : "";
    const absolute = value < 0n ? -value : value;
    const whole = absolute / QIRSH_PER_SDG;
    const cents = absolute % QIRSH_PER_SDG;
    return `${sign}${whole.toString()}.${cents.toString().padStart(2, "0")}`;
  }

  function groupThousands(value) {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatMoney(amount, currency) {
    const decimal = decimalMoneyString(amount);
    const [whole, cents] = decimal.split(".");
    return `${groupThousands(whole)}.${cents} ${currency || CONFIG.currency}`;
  }

  function toPlainObject(result) {
    const output = {};
    for (const [key, value] of Object.entries(result)) {
      output[key] = typeof value === "bigint" ? value.toString() : value;
    }
    return output;
  }

  return {
    CONFIG,
    calculateOrder,
    decimalMoneyString,
    formatMoney,
    roundBasisPoints,
    designServiceEnabled,
    selectTier,
    toPlainObject
  };
});
