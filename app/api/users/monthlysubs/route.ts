import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { subMonths, format } from "date-fns";

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();

    const now = new Date();
    const subscriptions = await prisma.user.findMany({
      where: {
        role: "PREMIUM",
        premium_start: {
          gte: subMonths(now, 12),
        },
      },
      select: {
        premium_start: true,
      },
    });

    const monthlySubscriptions = Array(12).fill(0);
    subscriptions.forEach((user) => {
      if (user.premium_start) {
        const monthIndex =
          now.getMonth() -
          user.premium_start.getMonth() +
          11 * (now.getFullYear() - new Date(user.premium_start).getFullYear());
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlySubscriptions[monthIndex]++;
        }
      }
    });

    const result = monthlySubscriptions.map((count, index) => ({
      month: format(subMonths(now, 11 - index), "yyyy-MM"),
      count,
    }));

    return NextResponse.json({ subscriptions: result }, { status: 200 });
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
