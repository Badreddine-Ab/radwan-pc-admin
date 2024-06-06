import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRole } from "../checkRole";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import prisma from "@/prisma";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connectToDatabase } from "@/helpers/server-helpers";

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "application/x-pdf",
];
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const maxFileSize = 1048576 * 100;
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);

  try {
    const notifications = await prisma.notification.findMany({
      take: pageSize + 1, // Fetch one more item than page size to check for next page
      cursor: cursor ? { id: parseInt(cursor, 10) } : undefined,
      orderBy: { id: "desc" },
    });

    const hasNextPage = notifications.length > pageSize;
    const nextCursor = hasNextPage ? notifications[pageSize].id : null;
    if (hasNextPage) notifications.pop(); // Remove the extra item used to check for next page

    return NextResponse.json(
      { notifications, hasNextPage, nextCursor },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await auth();

    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const formData = await req.formData();

      const file: File = formData.get("file") as File;
      const fileType: string = formData.get("fileType") as string;
      const checksum: string = formData.get("checksum") as string;
      const fileSizeStr: string = formData.get("fileSize") as string; // Get size as string
      const fileSize: number = parseInt(fileSizeStr, 10);
      const from_user_email = session?.user?.email;
      if (!allowedFileTypes.includes(fileType)) {
        return NextResponse.json(
          { failure: "File type not allowed" },
          { status: 400 },
        );
      }
      if (fileSize > maxFileSize) {
        return NextResponse.json(
          { failure: "File size too large" },
          { status: 400 },
        );
      }

      const fileName = generateFileName();
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        ContentType: fileType,
        ChecksumSHA256: checksum,
      });
      const url = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 60,
      });
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
        },
        body: file,
      });
      if (response.ok) {
        await connectToDatabase();
        const newPdf = await prisma.notification.create({
          data: {
            image: url.split("?")[0],
            from_user_email,
          },
        });

        return NextResponse.json({ newPdf }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Failed to upload file" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
};
