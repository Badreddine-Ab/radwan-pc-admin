import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUserRole } from "../checkRole";

const s3Client = new S3Client({
  region: process.env.AWS_APP_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_APP_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_APP_SECRET_ACCESS_KEY!,
  },
});

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "application/x-pdf",
];

const maxFileSize = 1048576 * 100;
const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const POST = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file: File = formData.get("file") as File;
    const title: string = formData.get("title") as string;
    const chapitreId: string = formData.get("chapitreId") as string;
    const fileType: string = formData.get("fileType") as string;
    const checksum: string = formData.get("checksum") as string;
    const fileSizeStr: string = formData.get("fileSize") as string; // Get size as string
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

    console.log(response);

    if (response.ok) {
      await connectToDatabase();
      const newPdf = await prisma.pDF.create({
        data: {
          url: url.split("?")[0],
          title,
          chapitreId,
        },
      });

      return NextResponse.json({ newPdf }, { status: 200 });
    } else {
      console.log("aloooo");
      return NextResponse.json(
        { message: "Failed to upload file" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const DELETE = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const { id } = await req.json();

      if (!id) {
        console.error("invalid data");
        return new Response(JSON.stringify({ message: "invalid data" }), {
          status: 400,
        });
      }

      await connectToDatabase();

      const deletedCourse = await prisma.pDF.delete({
        where: { id },
      });
      if (deletedCourse) {
        const url = deletedCourse.url;
        const key = url.split("/").slice(-1)[0];
        const deleteParams = {
          Bucket: process.env.AWS_APP_BUCKET_NAME!,
          Key: key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }
      return new Response(JSON.stringify({ deletedCourse }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
};
