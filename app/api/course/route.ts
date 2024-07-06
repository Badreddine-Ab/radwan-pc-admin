import { auth } from "@/auth";
import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { URL } from "url";
import { getUserRole } from "../checkRole";
import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "application/x-pdf",
];
const s3Client = new S3Client({
  region: process.env.AWS_APP_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_APP_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_APP_SECRET_ACCESS_KEY!,
  },
});
const maxFileSize = 1048576 * 100;
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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
      const name: string = formData.get("name") as string;
      const description: string = formData.get("description") as string;
      const isSupStr: string = formData.get("is_sup") as string;
      const is_sup = isSupStr === "true";
      const level: string = formData.get("level") as string;
      const language: string = formData.get("language") as string;
      const isPremiumStr: string = formData.get("is_premium") as string;
      const is_premium = isPremiumStr === "true";
      const module: string = formData.get("module") as string;
      const fileSize: number = parseInt(fileSizeStr, 10);

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
        Bucket: process.env.AWS_APP_BUCKET_NAME!,
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
        if (
          !name ||
          !description ||
          is_sup === undefined ||
          !level ||
          !language ||
          is_premium === undefined ||
          !module ||
          !url
        ) {
          console.log("invalid data");
          return NextResponse.json(
            { message: "invalid data" },
            { status: 400 },
          );
        }
        await connectToDatabase();
        const newCourse = await prisma.course.create({
          data: {
            name,
            description,
            is_sup,
            level,
            language,
            is_premium,
            module,
            image: url.split("?")[0],
          },
        });
        return NextResponse.json({ newCourse }, { status: 200 });
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

export const GET = async (req: Request) => {
  const baseurl = new URL(req.url);

  const cursor = baseurl.searchParams.get("cursor");
  const pageSize = parseInt(baseurl.searchParams.get("pageSize") || "10", 10);
  const isPremium = baseurl.searchParams.get("is_premium");
  const language = baseurl.searchParams.get("language");
  const isSup = baseurl.searchParams.get("is_sup");
  const name = baseurl.searchParams.get("name");
  const module = baseurl.searchParams.get("module");
  const level = baseurl.searchParams.get("level");
  const id = baseurl.searchParams.get("id");

  try {
    await connectToDatabase();

    const whereCondition: any = {
      is_premium: isPremium ? JSON.parse(isPremium) : undefined,
      language: language ? language : undefined,
      is_sup: isSup ? JSON.parse(isSup) : undefined,
      name: name ? { contains: name } : undefined,
      level: level ? level : undefined,
      module: module ? module : undefined,
      id: id ? id : undefined,
    };
    const includeCondition: any = {};
    if (id) {
      includeCondition.chapitre = {
        include: {
          videos: true,
          PDFs: true,
        },
      };
    }
    const courses = await prisma.course.findMany({
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "desc" },
      where: whereCondition,
      include: includeCondition,
    });

    const hasNextPage = courses.length > pageSize;
    const nextCursor = hasNextPage ? courses[pageSize].id : null;
    if (hasNextPage) courses.pop();

    return NextResponse.json(
      { courses, hasNextPage, nextCursor },
      { status: 200 },
    );
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

export const PUT = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const formData = await req.formData();
      const file: File = formData.get("file") as File;
      const fileType: string = formData.get("fileType") as string;
      const checksum: string = formData.get("checksum") as string;
      const fileSizeStr: string = formData.get("fileSize") as string; // Get size as string
      const name: string = formData.get("name") as string;
      const description: string = formData.get("description") as string;
      const isSupStr: string = formData.get("is_sup") as string;
      const is_sup = isSupStr === "true";
      const level: string = formData.get("level") as string;
      const language: string = formData.get("language") as string;
      const isPremiumStr: string = formData.get("is_premium") as string;
      const is_premium = isPremiumStr === "true";
      const module: string = formData.get("module") as string;
      const fileSize: number = parseInt(fileSizeStr, 10);
      const id: string = formData.get("id") as string;

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
        Bucket: process.env.AWS_APP_BUCKET_NAME!,
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
        if (
          !id ||
          !name ||
          !description ||
          is_sup === undefined ||
          !level ||
          !language ||
          is_premium === undefined ||
          !module ||
          !url
        ) {
          console.log("invalid data");
          return NextResponse.json(
            { message: "invalid data" },
            { status: 400 },
          );
        }

        await connectToDatabase();

        const updatedCourse = await prisma.course.update({
          where: { id },
          data: {
            name,
            description,
            is_sup,
            level,
            language,
            is_premium,
            module,
            image: url.split("?")[0],
          },
        });

        return NextResponse.json({ updatedCourse }, { status: 200 });
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
export const DELETE = async (req: Request) => {
  try {
    const session = await auth();
    console.log(session);
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
      }

      await connectToDatabase();

      const deletedCourse = await prisma.course.delete({
        where: { id },
      });

      return NextResponse.json({ deletedCourse }, { status: 200 });
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
