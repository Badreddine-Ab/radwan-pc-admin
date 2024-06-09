import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
export const GET = async (req: Request) => {
  try {
    await connectToDatabase();
    const baseurl = new URL(req.url);
    const module = baseurl.searchParams.get("module");
    const level = baseurl.searchParams.get("level");
    const language = baseurl.searchParams.get("language");
    let response = {};

    if (module) {
      const modules = await prisma.course.groupBy({
        by: ["module"],
      });
      const uniqueModules = modules.map((moduleGroup) => moduleGroup.module);
      response = { uniqueModules };
    } else if (level) {
      const levels = await prisma.course.groupBy({
        by: ["level"],
      });
      let uniqueLevels = levels.map((levelGroup) => levelGroup.level);
      uniqueLevels = sortLevels(uniqueLevels);
      response = { uniqueLevels };
    } else {
      const languages = await prisma.course.groupBy({
        by: ["language"],
      });
      const uniqueLanguages = languages.map(
        (languageGroup) => languageGroup.language,
      );
      response = { uniqueLanguages };
    }

    return NextResponse.json(response, { status: 200 });
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

const predefinedOrder = [
  "Collège (1ère année)",
  "Collège (2ème année)",
  "Collège (3ème année)",
  "Tronc commun",
  "BAC (1ère année)",
  "BAC (2ème année)",
  "Classes préparatoires",
  "Médecine",
];

const sortLevels = (levels: string[]): string[] => {
  return levels.sort((a: string, b: string) => {
    const indexA = predefinedOrder.indexOf(a);
    const indexB = predefinedOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    } else if (indexA === -1) {
      return 1;
    } else if (indexB === -1) {
      return -1;
    } else {
      return indexA - indexB;
    }
  });
};

