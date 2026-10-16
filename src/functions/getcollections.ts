import type { QuerySnapshot } from "firebase/firestore";
import {
  collection,
  getDocsFromCache,
  getDocsFromServer,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebase-config";

export default async function getCollections(
  successCallback: (data: Array<CollectionInterface>) => void,
  errorCallback: (error_: unknown) => void,
  finallyCallback: () => void,
) {
  const CACHE_KEY = "last_fetch_collections",
    ONE_DAY_MS = 24 * 60 * 60 * 1000;

  try {
    const collectionsCollection = collection(db, "collections"),
      q = query(collectionsCollection, orderBy("createdTime", "asc")),
      lastFetch = localStorage.getItem(CACHE_KEY),
      now = Date.now(),
      isDataFresh = lastFetch && now - Number.parseInt(lastFetch, 10) < ONE_DAY_MS;

    console.log(collectionsCollection);

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

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<CollectionInterface>;

    successCallback(data);
  } catch (error_) {
    errorCallback(error_);
  } finally {
    finallyCallback();
  }
}
