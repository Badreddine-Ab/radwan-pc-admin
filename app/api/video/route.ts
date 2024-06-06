import { auth } from "@/auth";
import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { getUserRole } from "../checkRole";

export const POST = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const body = await req.json();
      const { url, title, courseId } = body;

      if (!url || !title || !courseId) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
      }

      await connectToDatabase();
      const newVideo = await prisma.video.create({
        data: {
          url,
          title,
          courseId,
        },
      });

      return NextResponse.json({ newVideo }, { status: 200 });
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
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const body = await req.json();
      const { id } = body;

      if (!id) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
      }

      await connectToDatabase();

      const deletedVideo = await prisma.video.delete({
        where: { id },
      });
      return NextResponse.json({ deletedVideo }, { status: 200 });
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
