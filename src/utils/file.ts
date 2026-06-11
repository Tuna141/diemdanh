export function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }
  const [, subtype] = file.type.split("/");
  return subtype === "jpeg" ? "jpg" : subtype || "jpg";
}

export function makeId() {
  return crypto.randomUUID();
}
