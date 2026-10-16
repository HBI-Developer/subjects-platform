import type { QuerySnapshot } from "firebase/firestore";
import {
  collection,
  doc,
  getDocsFromCache,
  getDocsFromServer,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase-config";

export default async function getResources(
  subjectId: string,
  successCallback: (data: Array<ResourceInterface>) => void,
  errorCallback: (error_: unknown) => void,
  finallyCallback: () => void,
) {
  const CACHE_KEY = `last_fetch_res_${subjectId}`;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  try {
    const resourcesCollection = collection(db, "resources"),
      subjectRef = doc(db, "subjects", subjectId),
      q = query(
        resourcesCollection,
        where("subject", "==", subjectRef),
        orderBy("createdTime", "asc"),
      ),
      lastFetch = localStorage.getItem(CACHE_KEY),
      now = Date.now(),
      isDataFresh = lastFetch && now - Number.parseInt(lastFetch, 10) < ONE_DAY_MS;

    let snapshot: QuerySnapshot;

    if (isDataFresh) {
      try {
        snapshot = await getDocsFromCache(q);
        if (snapshot.empty) throw new Error("Cache empty");
      } catch {
        // Cache miss/empty -- fall back to server fetch (intentional).
        snapshot = await getDocsFromServer(q);
        localStorage.setItem(CACHE_KEY, now.toString());
      }
    } else {
      snapshot = await getDocsFromServer(q);
      localStorage.setItem(CACHE_KEY, now.toString());
    }

    const data = snapshot.docs.map((doc) => {
      const docData = {
        id: doc.id,
        ...doc.data(),
      };

      //@ts-expect-error false data type
      delete docData.subject;

      return docData;
    }) as Array<ResourceInterface>;

    successCallback(data);
  } catch (error_) {
    errorCallback(error_);
  } finally {
    finallyCallback();
  }
}
