export default function getErrorMessage(code: number | string) {
  let message = "";

  switch (code) {
    case 100: {
      message = "العملية مستمرة";
      break;
    }
    case 101: {
      message = "تم تبديل البروتوكولات";
      break;
    }
    case 102: {
      message = "العملية قيد المعالجة";
      break;
    }
    case 103: {
      message = "تم إرجاع رؤوس الاستجابة الأولية";
      break;
    }
    case 200: {
      message = "تمت العملية بنجاح, ولكن لا يوجد محتوى لإرجاعه";
      break;
    }
    case 201: {
      message = "تم الإنشاء";
      break;
    }
    case 202: {
      message = "تم القبول";
      break;
    }
    case 203: {
      message = "المعلومات غير موثقة";
      break;
    }
    case 204: {
      message = "لا يوجد محتوى";
      break;
    }
    case 205: {
      message = "تمت إعادة تعيين المحتوى";
      break;
    }
    case 206: {
      message = "تم إرجاع محتوى جزئي";
      break;
    }
    case 207: {
      message = "تمت المعالجة";
      break;
    }
    case 208: {
      message = "تم الإبلاغ بشكل مسبق";
      break;
    }
    case 226: {
      message = "هناك محتوى مطابق";
      break;
    }
    case 300: {
      message = "هناك خيارات متعددة";
      break;
    }
    case 301: {
      message = "هناك حالة نقل دائم";
      break;
    }
    case 302: {
      message = "موجود / نقل مؤقت";
      break;
    }
    case 303: {
      message = "شاهد مصدراً آخر";
      break;
    }
    case 304: {
      message = "غير معدّل";
      break;
    }
    case 307: {
      message = "إعادة توجيه مؤقتة";
      break;
    }
    case 308: {
      message = "إعادة توجيه دائمة";
      break;
    }
    case 400:
    case "INVALID_ARGUMENT":
    case "FAILED_PRECONDITION":
    case "OUT_OF_RANGE": {
      message = "طلب غير صالح";
      break;
    }
    case 401:
    case "UNAUTHENTICATED": {
      message = "الوصول غير مصرح به";
      break;
    }
    case 402: {
      message = "الدفع مطلوب";
      break;
    }
    case 403:
    case "PERMISSION_DENIED": {
      message = "المورد محظور";
      break;
    }
    case 404:
    case "NOT_FOUND": {
      message = "المورد غير موجود";
      break;
    }
    case 405: {
      message = "الطريقة غير مسموحة";
      break;
    }
    case 406: {
      message = "الطلب غير مقبول";
      break;
    }
    case 407: {
      message = "المصادقة مع الوكيل مطلوبة";
      break;
    }
    case 408: {
      message = "انتهاء وقت الطلب";
      break;
    }
    case 409:
    case "ALREADY_EXISTS": {
      message = "المورد موجود مسبقاً";
      break;
    }
    case 410: {
      message = "المورد لم يعد موجوداً";
      break;
    }
    case 411: {
      message = "الطول مطلوب";
      break;
    }
    case 412: {
      message = "فشل الشرط المسبق";
      break;
    }
    case 413: {
      message = "حجم البيانات كبير جداً";
      break;
    }
    case 414: {
      message = "الرابط طويل جداً";
      break;
    }
    case 415: {
      message = "نوع الوسائط غير مدعوم";
      break;
    }
    case 416: {
      message = "النطاق غير متاح";
      break;
    }
    case 417: {
      message = "فشل التوقع";
      break;
    }
    case 418: {
      message = "أنا إبريق شاي";
      break;
    }
    case 421: {
      message = "الطلب موجه بشكل خاطئ";
      break;
    }
    case 422: {
      message = "كيان غير قابل للمعالجة";
      break;
    }
    case 423: {
      message = "المصدر مغلق";
      break;
    }
    case 424: {
      message = "فشل الطلب المرتبط";
      break;
    }
    case 425: {
      message = "النتيجة باكرة جداً";
      break;
    }
    case 426: {
      message = "الترقية مطلوبة";
      break;
    }
    case 428: {
      message = "الشروط المسبقة مطلوبة";
      break;
    }
    case 429:
    case "RESOURCE_EXHAUSTED": {
      message = "تم إرسال طلبات كثيرة جداً";
      break;
    }
    case 431: {
      message = "رؤوس الطلب كبيرة جداً";
      break;
    }
    case 451: {
      message = "غير متاح لأسباب قانونية";
      break;
    }
    case 500:
    case "INTERNAL":
    case "DATA_LOSS": {
      message = "خطأ داخلي في الخادم";
      break;
    }
    case 501:
    case "UNIMPLEMENTED": {
      message = "هذه الميزة غير مدعومة";
      break;
    }
    case 502: {
      message = "البوابة غير صالحة";
      break;
    }
    case 503:
    case "UNAVAILABLE": {
      message = "الخدمة غير متوفرة";
      break;
    }
    case 504:
    case "DEADLINE_EXCEEDED": {
      message = "انتهاء وقت البوابة";
      break;
    }
    case 505: {
      message = "إصدار HTTP غير مدعوم";
      break;
    }
    case 506: {
      message = "الطلب يؤدي إلى مرجع دائري";
      break;
    }
    case 507: {
      message = "تخزين غير كافٍ";
      break;
    }
    case 508: {
      message = "تم اكتشاف حلقة لانهائية";
      break;
    }
    case 510: {
      message = "الطلب يتطلب المزيد من الإضافات";
      break;
    }
    case 511: {
      message = "مصادقة الشبكة مطلوبة";
      break;
    }

    case "CANCELLED": {
      message = "تم إلغاء الطلب قبل إكتماله";
      break;
    }

    case "ABORTED": {
      message = "تم إيقاف العملية بسبب تضاربها مع عملية أخرى";
      break;
    }

    default: {
      message = "حدث خطأ غير معروف، رجاءً أعد المحاولة";
    }
  }

  return message;
}
