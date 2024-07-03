import { auth } from "@/auth";
import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
import { URL } from "url";
import { getUserRole } from "../checkRole";

export const POST = async (req: Request) => {
  try {
    const session = await auth();
    const role = await getUserRole(session);
    if (role === "ADMIN") {
      const body = await req.json();
      const {
        name,
        description,
        is_sup,
        level,
        language,
        is_premium,
        module,
        image,
      } = body;
      if (
        !name ||
        !description ||
        is_sup === undefined ||
        !level ||
        !language ||
        is_premium === undefined ||
        !module ||
        !image
      ) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
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
          image,
        },
      });
      return NextResponse.json({ newCourse }, { status: 200 });
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
      const body = await req.json();
      const {
        id,
        name,
        description,
        is_sup,
        level,
        language,
        is_premium,
        module,
        image,
      } = body;

      if (
        !id ||
        !name ||
        !description ||
        is_sup === undefined ||
        !level ||
        !language ||
        is_premium === undefined ||
        !module ||
        !image
      ) {
        console.log("invalid data");
        return NextResponse.json({ message: "invalid data" }, { status: 400 });
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
          image,
        },
      });

      return NextResponse.json({ updatedCourse }, { status: 200 });
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
