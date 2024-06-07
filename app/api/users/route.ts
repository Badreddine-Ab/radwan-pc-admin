import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const baseurl = new URL(req.url);

  const cursor = baseurl.searchParams.get("cursor");
  const pageSize = parseInt(baseurl.searchParams.get("pageSize") || "10", 10);

  const email = baseurl.searchParams.get("email");
  const name = baseurl.searchParams.get("name");
  try {
    await connectToDatabase();
    const users = await prisma.user.findMany({
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "desc" },
      where: {
        email: email ? { contains: email, mode: "insensitive" } : undefined,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
    });

    const hasNextPage = users.length > pageSize;
    const nextCursor = hasNextPage ? users[pageSize].id : null;
    if (hasNextPage) users.pop();

    return NextResponse.json(
      { users, hasNextPage, nextCursor },
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
