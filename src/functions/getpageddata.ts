import type { DocumentData, Query, QueryDocumentSnapshot } from "firebase/firestore";
import { getDocsFromCache, getDocsFromServer } from "firebase/firestore";

export const PAGE_SIZE = 15;

export interface FirestorePage<T> {
  readonly data: Array<T>;
  readonly cursor: QueryDocumentSnapshot<DocumentData> | undefined;
  readonly hasMore: boolean;
  readonly fromCache: boolean;
}

/**
 * Prefer the persistent local cache. On a first visit (or a cache miss), load
 * from Firestore; the SDK persists that result for the next visit.
 */
export async function getPage<T>(
  pageQuery: Query<DocumentData>,
  map: (document: QueryDocumentSnapshot<DocumentData>) => T,
  preferCache = true,
): Promise<FirestorePage<T>> {
  if (!preferCache) {
    const snapshot = await getDocsFromServer(pageQuery);
    return {
      data: snapshot.docs.map(map),
      cursor: snapshot.docs.at(-1),
      hasMore: snapshot.docs.length === PAGE_SIZE,
      fromCache: false,
    };
  }
  try {
    const snapshot = await getDocsFromCache(pageQuery);
    // A cache-only query can be empty both for a real empty collection and
    // for an unprimed cache. Prefer correctness for the initial page.
    if (snapshot.empty) throw new Error("Cache empty");
    return {
      data: snapshot.docs.map(map),
      cursor: snapshot.docs.at(-1),
      hasMore: snapshot.docs.length === PAGE_SIZE,
      fromCache: true,
    };
  } catch {
    const snapshot = await getDocsFromServer(pageQuery);
    return {
      data: snapshot.docs.map(map),
      cursor: snapshot.docs.at(-1),
      hasMore: snapshot.docs.length === PAGE_SIZE,
      fromCache: false,
    };
  }
}
