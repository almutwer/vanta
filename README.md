# Vanta Website

موقع تعريفي بسيط وسريع لشركة **Vanta** المتخصصة في طباعة الأكياس والحقائب الدعائية لأصحاب الأعمال التجارية.

## التشغيل المحلي

```bash
npm test
npm run serve
```

ثم افتح الموقع على المنفذ `4173`.

## الملفات المهمة

- `index.html`: واجهة الموقع العربية واتجاه RTL، بدون عرض التفاصيل التقنية للزوار.
- `assets/css/styles.css`: الهوية البصرية المستوحاة من الشعار المرفق مع أنيميشن خفيف.
- `assets/js/pricing.js`: جدول الأسعار ومنطق الحساب الدقيق باستخدام `BigInt`.
- `assets/js/app.js`: تحديث الملخص وإرسال الطلب.
- `assets/js/config.js`: إعدادات Google Apps Script و Sanity.
- `assets/js/sanity.js`: عميل Sanity اختياري لتحميل محتوى الصفحة.
- `google-apps-script/Code.gs`: سكربت استقبال الطلبات في Google Sheets.
- `sanity/schemaTypes/`: مخططات جاهزة لربط المحتوى والأسعار مع Sanity Studio.
- `tests/pricing.test.js`: اختبارات للتحقق من صحة العمليات الحسابية.

## تفعيل Google Sheets

1. أنشئ Google Sheet جديداً.
2. افتح `Extensions > Apps Script`.
3. الصق محتوى `google-apps-script/Code.gs`.
4. شغّل الدالة `setupSheet` مرة واحدة للموافقة على الصلاحيات وتجهيز العناوين.
5. اختر `Deploy > New deployment > Web app`.
6. الإعدادات المقترحة:
   - Execute as: `Me`
   - Who has access: `Anyone`
7. انسخ رابط الـ Web App وضعه في `assets/js/config.js` داخل `orders.googleScriptUrl` أو `googleScriptUrl`.

> ملاحظة تقنية: الإرسال من المتصفح يستخدم `no-cors` لتفادي مشاكل CORS مع Apps Script، لذلك يحفظ الموقع نسخة محلية أيضاً داخل المتصفح لآخر الطلبات.

## تجهيز Sanity

الموقع جاهز لتحميل النصوص العامة من Sanity عند ضبط بيانات المشروع في `assets/js/config.js`:

```js
sanity: {
  projectId: "yourProjectId",
  dataset: "production",
  apiVersion: "2026-10-02",
  useCdn: true,
  homeSlug: "home"
}
```

تفاصيل المخططات وخطوات الربط موجودة في `sanity/README.md`.

## تعديل الأسعار

كل الأسعار الحالية موجودة في `assets/js/pricing.js` بوحدة الجنيه السوداني وتتحول داخلياً إلى قروش صحيحة. بعد أي تعديل شغّل:

```bash
npm test
```

للتأكد من أن الحسابات لا تزال صحيحة.
