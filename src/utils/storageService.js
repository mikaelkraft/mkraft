import supabase from "./supabase";

// Buckets expected: 'media', 'logos'. Ensure they exist in Supabase Storage.
const DEFAULT_BUCKET = "media";

const randomKey = (prefix = "") => {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now();
  return `${prefix}${prefix ? "/" : ""}${time}-${rand}`;
};

const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
};

const uploadFile = async (
  file,
  { bucket = DEFAULT_BUCKET, pathPrefix = "", onProgress: _onProgress } = {},
) => {
  if (!file) return { success: false, error: "No file provided" };
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const key = randomKey(pathPrefix) + `.${ext}`;
    const uploader = supabase.storage.from(bucket);
    const { data, error } = await uploader.upload(key, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { success: false, error: error.message };
    const url = getPublicUrl(bucket, data.path);
    return { success: true, data: { path: data.path, url, bucket } };
  } catch (e) {
    return { success: false, error: e?.message || "Upload failed" };
  }
};

const removeFile = async (path, bucket = DEFAULT_BUCKET) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e?.message || "Delete failed" };
  }
};

const storageService = { uploadFile, getPublicUrl, removeFile };
export default storageService;
