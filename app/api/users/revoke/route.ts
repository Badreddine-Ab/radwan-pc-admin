import { connectToDatabase } from "@/helpers/server-helpers";
import prisma from "@/prisma";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
    try {
        await connectToDatabase();
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role !== 'PREMIUM') {
            return NextResponse.json({ message: "User is not a premium member" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role: 'REGULAR',
                premium_start: new Date('2000-01-01T00:00:00.000Z'),
                premium_end: new Date('2000-01-01T00:00:00.000Z'),
            },
        });

        return NextResponse.json({ user: updatedUser }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
};