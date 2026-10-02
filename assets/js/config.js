// إعدادات الربط الخارجية للموقع.
// ملاحظة: هذه الإعدادات تقنية ولا تظهر للزوار.
window.VANTA_ORDER_CONFIG = {
  // أبقينا المفتاح القديم للتوافق مع النسخة السابقة.
  googleScriptUrl: "",

  orders: {
    // ضع رابط Web App الخاص بـ Google Apps Script هنا عند تفعيل استقبال الطلبات.
    googleScriptUrl: ""
  },

  sanity: {
    // ضع بيانات مشروع Sanity عند جاهزية الربط.
    projectId: "",
    dataset: "production",
    apiVersion: "2026-10-02",
    useCdn: true,
    homeSlug: "home"
  },

  whatsappNumber: "",
  defaultCity: ""
};
