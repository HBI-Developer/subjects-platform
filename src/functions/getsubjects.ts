import type { DocumentReference, QuerySnapshot } from "firebase/firestore";
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

function mapSubjectDocs(snapshot: QuerySnapshot) {
  return snapshot.docs.map((docSnapshot) => {
    const raw = docSnapshot.data() as Record<string, unknown>;
    const belongToRef = raw.belongTo as DocumentReference | undefined;

    const belongToId = extractBelongToId(belongToRef, raw);

    const mapped: Record<string, unknown> = {
      id: docSnapshot.id,
      ...raw,
      belongToId,
    };

    delete mapped.belongTo;

    return mapped;
  }) as unknown as Array<SubjectInterface>;
}

function extractBelongToId(
  belongToRef: DocumentReference | undefined,
  raw: Record<string, unknown>,
): string {
  if (belongToRef && typeof belongToRef === "object" && "id" in belongToRef) {
    return (belongToRef as DocumentReference).id;
  }
  if (typeof raw.belongToId === "string") {
    return raw.belongToId;
  }
  return "";
}

export default async function getSubjects(
  successCallback: (data: Array<SubjectInterface>) => void,
  errorCallback: (error_: unknown) => void,
  finallyCallback: () => void,
  collectionId?: string,
) {
  const CACHE_KEY = collectionId ? `last_fetch_sub_${collectionId}` : "last_fetch_subjects",
    ONE_DAY_MS = 24 * 60 * 60 * 1000;

  try {
    const subjectsCollection = collection(db, "subjects");

    // The composite index in firestore.indexes.json keeps this ordered query
    // server-side, avoiding an unnecessary client-side sort.
    const q = collectionId
      ? query(
          subjectsCollection,
          where("belongTo", "==", doc(db, "collections", collectionId)),
          orderBy("createdTime", "asc"),
        )
      : query(subjectsCollection, orderBy("createdTime", "asc"));

    const lastFetch = localStorage.getItem(CACHE_KEY),
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

    successCallback(mapSubjectDocs(snapshot));
  } catch (error_) {
    console.error("[getSubjects]", error_);
    errorCallback(error_);
  } finally {
    finallyCallback();
  }
}
