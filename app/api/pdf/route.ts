import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
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
    if (role === "ADMIN") {
      const { file, title, courseId, fileType, fileSize, checksum } =
        await req.json();
      if (!allowedFileTypes.includes(fileType)) {
        return new Response(
          JSON.stringify({ failure: "File type not allowed" }),
          { status: 400 },
        );
      }
      if (fileSize > maxFileSize) {
        return new Response(
          JSON.stringify({ failure: "File size too large" }),
          { status: 400 },
        );
      }
      const fileName = generateFileName();

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_APP_BUCKET_NAME!,
        Key: fileName,
        ContentType: fileType,
        ContentLength: fileSize,
        ChecksumSHA256: checksum,
      });

      const url = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 60,
      });

      if (!file || !title || !courseId) {
        return new Response(JSON.stringify({ message: "invalid data" }), {
          status: 400,
        });
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": fileType,
        },
        body: file,
      });
      console.log(response);
      await connectToDatabase();
      const newPdf = await prisma.pDF.create({
        data: {
          url: url.split("?")[0],
          title,
          courseId,
        },
      });

      return new Response(JSON.stringify({ newPdf }), { status: 200 });
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
          Bucket: process.env.AWS_BUCKET_NAME!,
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
