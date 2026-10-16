export default function cleanName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function checkCleanName(title: string) {
  if (!title) {
    return "ﻻ يمكن أن يكون حقل الاسم فارغاً";
  }

  if (title.length <= 2) {
    return "الاسم صغير للغاية، يجب أن يتكون من 3 أحرف على الأقل";
  }

  if (title.length > 60) {
    return "النص أطول من حياتك، يجب أن يتكون من 60 حرف على الأكثر";
  }

  if (!window.navigator.onLine) {
    return "اتصالك بالإنترنت مقطوع، رجاءً اتصل بالانترنت ثم حاول مجدداً";
  }

  return "";
}
