import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";

export async function uploadAttendanceImage(file: File, imagePath: string) {
  try {
    const storageRef = ref(storage, imagePath);

    // upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // lấy URL thật từ Firebase
    const url = await getDownloadURL(snapshot.ref);

    console.log("🔥 UPLOAD SUCCESS:", url);

    return url;
  } catch (err) {
    console.error("❌ uploadAttendanceImage error:", err);
    throw err;
  }
}