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

export default function getResourcesPage(subjectId: string, cursor?: QueryDocumentSnapshot) {
  const base = query(
    collection(db, "resources"),
    where("subject", "==", doc(db, "subjects", subjectId)),
    orderBy("createdTime", "asc"),
  );
  const pageQuery = cursor ? query(base, startAfter(cursor), limit(15)) : query(base, limit(15));
  return getPage(
    pageQuery,
    (snapshot) => {
      const { subject: _subject, ...resource } = snapshot.data();
      return { id: snapshot.id, ...resource } as ResourceInterface;
    },
    !cursor,
  );
}
