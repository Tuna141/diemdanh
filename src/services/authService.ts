import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export function subscribeAuth(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, false);
      return;
    }
    const token = await user.getIdTokenResult(true);
    callback(user, token.claims.role === "admin");
  });
}

export async function loginAdmin(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
  await signOut(auth);
}
