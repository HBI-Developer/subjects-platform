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
import { getPage, PAGE_SIZE } from "./getpageddata";

export default function getResourcesPage(
  subjectId: string,
  cursor?: QueryDocumentSnapshot,
  pageSize = PAGE_SIZE,
) {
  const base = query(
    collection(db, "resources"),
    where("subject", "==", doc(db, "subjects", subjectId)),
    orderBy("createdTime", "asc"),
  );
  const pageQuery = cursor
    ? query(base, startAfter(cursor), limit(pageSize))
    : query(base, limit(pageSize));
  return getPage(
    pageQuery,
    (snapshot) => {
      const { subject: _subject, ...resource } = snapshot.data();
      return { id: snapshot.id, ...resource } as ResourceInterface;
    },
    !cursor,
    pageSize,
  );
}
