const test = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../assets/js/pricing.js');

test('يحسب طلب أكياس ورقية متوسط بدقة وبالأرقام الصحيحة', () => {
  const result = pricing.calculateOrder({
    product: 'paper-bags',
    quantity: '100',
    size: 'medium',
    printSides: '2',
    colors: '3',
    finish: 'matte',
    rush: 'express',
    designService: true
  });

  assert.equal(result.selectedTierMin, 100);
  assert.equal(result.baseUnit, 48000n);
  assert.equal(result.sizeFee, 7000n);
  assert.equal(result.colorFee, 51000n);
  assert.equal(result.finishFee, 12000n);
  assert.equal(result.unitPrice, 118000n);
  assert.equal(result.itemsSubtotal, 11800000n);
  assert.equal(result.setupFee, 850000n);
  assert.equal(result.designFee, 1000000n);
  assert.equal(result.subtotalBeforeRush, 13650000n);
  assert.equal(result.rushFee, 2047500n);
  assert.equal(result.total, 15697500n);
  assert.equal(pricing.decimalMoneyString(result.total), '156975.00');
});

test('يختار شريحة الكمية الأعلى المطابقة فقط', () => {
  const below = pricing.calculateOrder({
    product: 'fabric-bags',
    quantity: '499',
    size: 'small',
    printSides: '1',
    colors: '1',
    finish: 'none',
    rush: 'normal'
  });
  const atTier = pricing.calculateOrder({
    product: 'fabric-bags',
    quantity: '500',
    size: 'small',
    printSides: '1',
    colors: '1',
    finish: 'none',
    rush: 'normal'
  });

  assert.equal(below.selectedTierMin, 100);
  assert.equal(atTier.selectedTierMin, 500);
  assert.equal(below.baseUnit, 82000n);
  assert.equal(atTier.baseUnit, 74000n);
});

test('رسوم النسبة المئوية تقرب للقرش بدون floating point', () => {
  assert.equal(pricing.roundBasisPoints(101n, 1500n), 15n);
  assert.equal(pricing.roundBasisPoints(105n, 1500n), 16n);
  assert.equal(pricing.roundBasisPoints(10000n, 2500n), 2500n);
});

test('يرفض الكميات والحقول غير الصحيحة', () => {
  assert.throws(() => pricing.calculateOrder({
    product: 'paper-bags',
    quantity: '49',
    size: 'small',
    printSides: '1',
    colors: '1',
    finish: 'none',
    rush: 'normal'
  }), /أقل كمية/);

  assert.throws(() => pricing.calculateOrder({
    product: 'paper-bags',
    quantity: '100.5',
    size: 'small',
    printSides: '1',
    colors: '1',
    finish: 'none',
    rush: 'normal'
  }), /رقماً صحيحاً/);

  assert.throws(() => pricing.calculateOrder({
    product: 'paper-bags',
    quantity: '100',
    size: 'small',
    printSides: '3',
    colors: '1',
    finish: 'none',
    rush: 'normal'
  }), /1 أو 2/);
});

test('مجموع بنود الملخص يساوي الإجمالي النهائي دائماً', () => {
  const cases = [
    ['paper-bags', '1000', 'large', '2', '6', 'reinforced', 'urgent', false],
    ['fabric-bags', '50', 'medium', '1', '2', 'none', 'normal', true],
    ['promo-bags', '700', 'large', '2', '4', 'glossy', 'express', true]
  ];

  for (const [product, quantity, size, printSides, colors, finish, rush, designService] of cases) {
    const result = pricing.calculateOrder({ product, quantity, size, printSides, colors, finish, rush, designService });
    assert.equal(result.itemsSubtotal + result.setupFee + result.designFee, result.subtotalBeforeRush);
    assert.equal(result.subtotalBeforeRush + result.rushFee, result.total);
  }
});
