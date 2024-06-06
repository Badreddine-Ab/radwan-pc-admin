import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { NextResponse } from "next/server";
export const GET = async (req: Request) => {
    try {
        await connectToDatabase();
        const baseurl = new URL(req.url);
        const module = baseurl.searchParams.get('module');
        const level = baseurl.searchParams.get('level');
        const language = baseurl.searchParams.get('language');
        let response = {};

        if (module) {
            const modules = await prisma.course.groupBy({
                by: ['module'],
            });
            const uniqueModules = modules.map(moduleGroup => moduleGroup.module);
            response = { uniqueModules };
        } else if (level) {
            const levels = await prisma.course.groupBy({
                by: ['level'],
            });
            const uniqueLevels = levels.map(levelGroup => levelGroup.level);
            response = { uniqueLevels };
        } else {
            const language = await prisma.course.groupBy({
                by: ['language'],
            });
            const uniqueLanguages = language.map(languageGroup => languageGroup.language);
            response = { uniqueLanguages };
        }

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}