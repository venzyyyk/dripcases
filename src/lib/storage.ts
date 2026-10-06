import path from "path";

/**
 * Куда писать загруженные файлы.
 *
 * Локально  — public/uploads, раздаётся Next'ом напрямую.
 * На Render — /var/data/uploads (персистентный диск), раздаётся через
 *             /api/uploads/[...path], потому что public/ вшит в билд
 *             и файловая система контейнера эфемерная.
 *
 * Переключается одной переменной UPLOAD_DIR.
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

/** Пишем ли мы вне public/ — тогда раздача идёт через API-роут */
export const SERVES_VIA_API = !!process.env.UPLOAD_DIR;

export const ALLOWED_FOLDERS = ["cases", "products"] as const;
export type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

export function normalizeFolder(raw: unknown): UploadFolder {
  return raw === "products" ? "products" : "cases";
}

/** Публичный URL файла по его папке и имени */
export function publicUrl(folder: UploadFolder, filename: string) {
  return SERVES_VIA_API
    ? `/api/uploads/${folder}/${filename}`
    : `/uploads/${folder}/${filename}`;
}

/** Абсолютный путь на диске. Защищён от выхода за UPLOAD_DIR. */
export function diskPath(folder: UploadFolder, filename: string) {
  const safeName = path.basename(filename);
  const full = path.join(UPLOAD_DIR, folder, safeName);

  const root = path.resolve(UPLOAD_DIR);
  if (!path.resolve(full).startsWith(root + path.sep)) {
    throw new Error("Path traversal");
  }

  return full;
}

export const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/avif": "avif",
};

export const EXT_MIME: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  avif: "image/avif",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Транслит + чистка имени файла */
export function slugifyFilename(name: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  const base = name.replace(/\.[^.]+$/, "").toLowerCase();
  const translit = base.split("").map((ch) => map[ch] ?? ch).join("");

  return translit.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "render";
}
