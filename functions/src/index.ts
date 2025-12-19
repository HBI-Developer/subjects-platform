import { onCall } from "firebase-functions/v2/https";
import admin from "firebase-admin";

// تهيئة التطبيق بصلاحيات المسؤول (Admin)
admin.initializeApp();

exports.getAllPosts = onCall(async () => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection("subjects").get();

    // تحويل البيانات إلى مصفوفة بسيطة
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: posts };
  } catch (error) {
    return { success: false, error: (error as { message: string }).message };
  }
});
