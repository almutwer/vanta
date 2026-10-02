# Sanity readiness for Vanta

هذه الملفات تجهز الموقع للربط مع Sanity بدون فرض Sanity Studio داخل الموقع الحالي.

## ما الجاهز الآن؟

- `assets/js/config.js` يحتوي إعدادات `sanity`.
- `assets/js/sanity.js` يقرأ محتوى الصفحة من Sanity عند وضع `projectId` و `dataset`.
- `sanity/schemaTypes/siteSettings.js` لإدارة نصوص الصفحة العامة.
- `sanity/schemaTypes/orderProduct.js` لإدارة أسعار المنتجات لاحقاً مع قيود تمنع الكسور والقيم السالبة.

## خطوات الربط

1. أنشئ مشروع Sanity أو Studio مستقل.
2. انسخ مجلد `sanity/schemaTypes` إلى مشروع الـ Studio.
3. أضف `schemaTypes` إلى إعدادات الـ Studio.
4. أنشئ مستند `Vanta Site Content` واجعل الـ slug هو `home`.
5. ضع بيانات المشروع في `assets/js/config.js`:

```js
sanity: {
  projectId: "yourProjectId",
  dataset: "production",
  apiVersion: "2026-10-02",
  useCdn: true,
  homeSlug: "home"
}
```

سيبقى الموقع يعمل بالنصوص الافتراضية إذا لم يتم ضبط Sanity أو تعذر تحميله.
