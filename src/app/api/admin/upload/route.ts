import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  UPLOAD_DIR,
  MIME_EXT,
  MAX_UPLOAD_BYTES,
  normalizeFolder,
  publicUrl,
  slugifyFilename,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const ext = MIME_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Нужен PNG, WebP, JPEG или AVIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Файл больше ${MAX_UPLOAD_BYTES / 1024 / 1024} МБ` },
      { status: 400 }
    );
  }

  const folder = normalizeFolder(formData.get("folder"));
  const filename = `${slugifyFilename(file.name)}-${Date.now()}.${ext}`;

  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: publicUrl(folder, filename) }, { status: 201 });
}
