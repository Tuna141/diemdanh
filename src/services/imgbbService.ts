export async function uploadToImgBB(file: File) {
  const apiKey = import.meta.env.VITE_IMGBB_KEY;

  console.log("🔥 IMGBB KEY:", apiKey); // <<< CHECK

  if (!apiKey) {
    throw new Error("Missing IMGBB API KEY");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  console.log("🔥 IMGBB RESPONSE:", data);

  if (!data?.success) {
    throw new Error("Upload failed");
  }

  return data.data.url;
}