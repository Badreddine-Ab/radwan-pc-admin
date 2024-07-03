import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserRole } from "../checkRole";
import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";

export const POST = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const body = await req.json();
      const { name, courseId } = body;

      if (!name || !courseId) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
      }

      await connectToDatabase();
      const newChapitre = await prisma.chapitre.create({
        data: {
          name,
          courseId,
        },
      });

      return NextResponse.json({ newChapitre }, { status: 200 });
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
