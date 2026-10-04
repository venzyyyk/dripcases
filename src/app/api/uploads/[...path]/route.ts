import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { diskPath, normalizeFolder, EXT_MIME } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Раздача файлов с персистентного диска (Render) — public/ для этого
 * не годится: он вшивается в билд, а диск контейнера эфемерный.
 *
 * Локально (без UPLOAD_DIR) этот роут не используется: там файлы лежат
 * в public/uploads и раздаются Next'ом напрямую.
 */
export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const [folderRaw, filename, ...rest] = params.path || [];

  if (!folderRaw || !filename || rest.length > 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const folder = normalizeFolder(folderRaw);
  if (folder !== folderRaw) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const mime = EXT_MIME[ext];
  if (!mime) {
    return new NextResponse("Not found", { status: 404 });
  }

  let full: string;
  try {
    full = diskPath(folder, filename);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(full);
    const body = await readFile(full);

    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
