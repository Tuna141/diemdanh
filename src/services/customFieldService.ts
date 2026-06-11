import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { CustomField } from "../types";

const fieldsRef = collection(db, "customFields");

function toCustomField(snapshot: import("firebase/firestore").QueryDocumentSnapshot): CustomField {
  const data = snapshot.data();
  const typeValue = String(data.type);
  return {
    id: snapshot.id,
    label: String(data.label),
    type: typeValue === "number" || typeValue === "date" ? typeValue : "text",
    required: Boolean(data.required),
    createdAt: data.createdAt,
  };
}

export async function getCustomFields() {
  const snapshot = await getDocs(query(fieldsRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map(toCustomField);
}

export async function createCustomField(input: { label: string; type: CustomField["type"]; required: boolean }) {
  await addDoc(fieldsRef, {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteCustomField(fieldId: string) {
  await deleteDoc(doc(db, "customFields", fieldId));
}
