import { db } from "@/firebase-config";
import {
  collection,
  doc,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";

export default async function getResourcesCount(
  subjectId: string,
  successCallback: (data: number) => void,
  errorCallback: (er: unknown) => void,
  finallyCallback: () => void
) {
  try {
    const coll = collection(db, "resources");
    const subjectRef = doc(db, "subjects", subjectId);
    const q = query(coll, where("subject", "==", subjectRef));
    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    successCallback(count);
  } catch (er) {
    errorCallback(er);
  } finally {
    finallyCallback();
  }
}
