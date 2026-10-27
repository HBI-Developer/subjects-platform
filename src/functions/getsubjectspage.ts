import {
  collection,
  doc,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { getPage } from "./getpageddata";

export default function getSubjectsPage(collectionId: string, cursor?: QueryDocumentSnapshot) {
  const base = query(
    collection(db, "subjects"),
    where("belongTo", "==", doc(db, "collections", collectionId)),
    orderBy("createdTime", "asc"),
  );
  const pageQuery = cursor ? query(base, startAfter(cursor), limit(15)) : query(base, limit(15));
  return getPage(
    pageQuery,
    (snapshot) => {
      const { belongTo: _belongTo, ...subject } = snapshot.data();
      return { id: snapshot.id, ...subject, belongToId: collectionId } as SubjectInterface;
    },
    !cursor,
  );
}
