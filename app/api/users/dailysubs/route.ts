import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { subDays, format } from "date-fns";

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();

    const now = new Date();
    const startDate = subDays(now, 7);
    const subscriptions = await prisma.user.findMany({
      where: {
        role: "PREMIUM",
        premium_start: {
          gte: startDate,
        },
      },
      select: {
        premium_start: true,
      },
    });

    const dailySubscriptions = Array(7).fill(0);

    subscriptions.forEach((user) => {
      if (user.premium_start) {
        const dayIndex = (new Date(user.premium_start).getDay() + 6) % 7;
        dailySubscriptions[dayIndex]++;
      }
    });

    const result = dailySubscriptions.map((count, index) => ({
      day: format(subDays(now, 6 - index), "yyyy-MM-dd"),
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
