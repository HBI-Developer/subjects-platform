import { db } from "@/firebase-config";
import {
  collection,
  getDocsFromCache,
  getDocsFromServer,
} from "firebase/firestore";

export default async function getSubjects(
  successCallback: (data: Array<Subject>) => void,
  errorCallback: (er: unknown) => void,
  finallyCallback: () => void
) {
  const CACHE_KEY = "last_fetch_subjects",
    ONE_DAY_MS = 24 * 60 * 60 * 1000;

  try {
    const subjectsCollection = collection(db, "subjects"),
      lastFetch = localStorage.getItem(CACHE_KEY),
      now = Date.now(),
      isDataFresh = lastFetch && now - parseInt(lastFetch) < ONE_DAY_MS;

    let snapshot;

    if (isDataFresh) {
      try {
        snapshot = await getDocsFromCache(subjectsCollection);
        if (snapshot.empty) throw new Error("Cache empty");
      } catch (_) {
        snapshot = await getDocsFromServer(subjectsCollection);
        localStorage.setItem(CACHE_KEY, now.toString());
      }
    } else {
      snapshot = await getDocsFromServer(subjectsCollection);
      localStorage.setItem(CACHE_KEY, now.toString());
    }

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<Subject>;

    successCallback(data);
  } catch (er) {
    errorCallback(er);
  } finally {
    finallyCallback();
  }
}
