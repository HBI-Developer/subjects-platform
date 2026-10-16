import { collection, doc, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/firebase-config";

export default async function getResourcesCount(
  subjectId: string,
  successCallback: (data: number) => void,
  errorCallback: (error_: unknown) => void,
  finallyCallback: () => void,
) {
  try {
    const coll = collection(db, "resources");
    const subjectRef = doc(db, "subjects", subjectId);
    const q = query(coll, where("subject", "==", subjectRef));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    successCallback(count);
  } catch (error_) {
    errorCallback(error_);
  } finally {
    finallyCallback();
  }
}
