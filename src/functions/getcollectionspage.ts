import {
  collection,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { getPage } from "./getpageddata";

export default function getCollectionsPage(cursor?: QueryDocumentSnapshot) {
  const base = query(collection(db, "collections"), orderBy("createdTime", "asc"));
  const pageQuery = cursor ? query(base, startAfter(cursor), limit(15)) : query(base, limit(15));
  return getPage(
    pageQuery,
    (snapshot) =>
      ({
        id: snapshot.id,
        ...snapshot.data(),
      }) as CollectionInterface,
    !cursor,
  );
}
