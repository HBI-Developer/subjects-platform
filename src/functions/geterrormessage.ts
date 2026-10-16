const httpMessages: Record<number, string> = {
  100: "العملية مستمرة",
  101: "تم تبديل البروتوكولات",
  102: "العملية قيد المعالجة",
  103: "تم إرجاع رؤوس الاستجابة الأولية",
  200: "تمت العملية بنجاح, ولكن لا يوجد محتوى لإرجاعه",
  201: "تم الإنشاء",
  202: "تم القبول",
  203: "المعلومات غير موثقة",
  204: "لا يوجد محتوى",
  205: "تمت إعادة تعيين المحتوى",
  206: "تم إرجاع محتوى جزئي",
  207: "تمت المعالجة",
  208: "تم الإبلاغ بشكل مسبق",
  226: "هناك محتوى مطابق",
  300: "هناك خيارات متعددة",
  301: "هناك حالة نقل دائم",
  302: "موجود / نقل مؤقت",
  303: "شاهد مصدراً آخر",
  304: "غير معدّل",
  307: "إعادة توجيه مؤقتة",
  308: "إعادة توجيه دائمة",
  402: "الدفع مطلوب",
  405: "الطريقة غير مسموحة",
  406: "الطلب غير مقبول",
  407: "المصادقة مع الوكيل مطلوبة",
  408: "انتهاء وقت الطلب",
  410: "المورد لم يعد موجوداً",
  411: "الطول مطلوب",
  412: "فشل الشرط المسبق",
  413: "حجم البيانات كبير جداً",
  414: "الرابط طويل جداً",
  415: "نوع الوسائط غير مدعوم",
  416: "النطاق غير متاح",
  417: "فشل التوقع",
  418: "أنا إبريق شاي",
  421: "الطلب موجه بشكل خاطئ",
  422: "كيان غير قابل للمعالجة",
  423: "المصدر مغلق",
  424: "فشل الطلب المرتبط",
  425: "النتيجة باكرة جداً",
  426: "الترقية مطلوبة",
  428: "الشروط المسبقة مطلوبة",
  431: "رؤوس الطلب كبيرة جداً",
  451: "غير متاح لأسباب قانونية",
  502: "البوابة غير صالحة",
  505: "إصدار HTTP غير مدعوم",
  506: "الطلب يؤدي إلى مرجع دائري",
  507: "تخزين غير كافٍ",
  508: "تم اكتشاف حلقة لانهائية",
  510: "الطلب يتطلب المزيد من الإضافات",
  511: "مصادقة الشبكة مطلوبة",
};

const firebaseAliases: Record<string, { code: number; message: string }> = {
  INVALID_ARGUMENT: { code: 400, message: "طلب غير صالح" },
  FAILED_PRECONDITION: { code: 400, message: "طلب غير صالح" },
  OUT_OF_RANGE: { code: 400, message: "طلب غير صالح" },
  UNAUTHENTICATED: { code: 401, message: "الوصول غير مصرح به" },
  PERMISSION_DENIED: { code: 403, message: "المورد محظور" },
  NOT_FOUND: { code: 404, message: "المورد غير موجود" },
  ALREADY_EXISTS: { code: 409, message: "المورد موجود مسبقاً" },
  ABORTED: { code: 409, message: "تم إيقاف العملية بسبب تضاربها مع عملية أخرى" },
  RESOURCE_EXHAUSTED: { code: 429, message: "تم إرسال طلبات كثيرة جداً" },
  CANCELLED: { code: 499, message: "تم إلغاء الطلب قبل إكتماله" },
  INTERNAL: { code: 500, message: "خطأ داخلي في الخادم" },
  DATA_LOSS: { code: 500, message: "خطأ داخلي في الخادم" },
  UNIMPLEMENTED: { code: 501, message: "هذه الميزة غير مدعومة" },
  UNAVAILABLE: { code: 503, message: "الخدمة غير متوفرة أو ﻻ يمكن الوصول إليها" },
  DEADLINE_EXCEEDED: { code: 504, message: "انتهاء وقت البوابة" },
};

const numericOverrides: Record<number, { code: number; message: string }> = {
  400: { code: 400, message: "طلب غير صالح" },
  401: { code: 401, message: "الوصول غير مصرح به" },
  403: { code: 403, message: "المورد محظور" },
  404: { code: 404, message: "المورد غير موجود" },
  409: { code: 409, message: "المورد موجود مسبقاً" },
  429: { code: 429, message: "تم إرسال طلبات كثيرة جداً" },
  499: { code: 499, message: "تم إلغاء الطلب قبل إكتماله" },
  500: { code: 500, message: "خطأ داخلي في الخادم" },
  501: { code: 501, message: "هذه الميزة غير مدعومة" },
  503: { code: 503, message: "الخدمة غير متوفرة أو ﻻ يمكن الوصول إليها" },
  504: { code: 504, message: "انتهاء وقت البوابة" },
};

function normalizeKey(code: number | string): number | string {
  if (typeof code === "number") return code;
  return code.toUpperCase().replaceAll(/[-_\s]/g, "_");
}

export default function getErrorMessage(code: number | string) {
  const key = normalizeKey(code);

  if (typeof key === "number") {
    const override = numericOverrides[key];
    if (override) return { ...override };
    const message = httpMessages[key];
    // Preserve legacy: unknown numeric codes keep the input number.
    if (message) return { code: key, message };
    return { code: key, message: "حدث خطأ غير معروف، رجاءً أعد المحاولة" };
  }

  const alias = firebaseAliases[key];
  if (alias) return { ...alias };
  return { code: 500, message: "حدث خطأ غير معروف، رجاءً أعد المحاولة" };
}
