import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header/Header";
import { auth } from "@/auth";
import SignInPage from "./components/signIn/SingInPage";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    };
  }

  return (
    <main>
      <SignInPage session={session} />
    </main>
  );
}
