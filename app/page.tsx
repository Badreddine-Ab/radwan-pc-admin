import { auth } from "@/auth";
import SignInPage from "./components/signIn/SingInPage";

import { redirect } from "next/navigation";
export default async function Home() {
  const session = await auth();
  if (session?.user) {
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    };
    redirect("/admin");
  }

  return (
    <main>
      <SignInPage session={session} />
    </main>
  );
}
