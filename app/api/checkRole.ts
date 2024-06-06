import { Session } from "next-auth";
import prisma from "@/prisma";

export const getUserRole = async (session: Session | null): Promise<string> => {
  if (!session) {
    return "not authenticated";
  }

  const email = session.user?.email || "";

  if (!email) {
    return "no email found in session";
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (dbUser) {
      return dbUser.role;
    } else {
      return "user not found";
    }
  } catch (error) {
    return "database error";
  }
};
