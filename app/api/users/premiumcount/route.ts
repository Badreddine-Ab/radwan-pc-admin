import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();
    const premiumUsersCount = await prisma.user.count({
      where: {
        role: "PREMIUM",
      },
    });

    return NextResponse.json({ count: premiumUsersCount }, { status: 200 });
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
