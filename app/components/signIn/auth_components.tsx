import { signIn, signOut } from "@/auth";
import Button from "../button/Button";

export function SignIn({
  provider,
  children,
  ...props
}: {
  provider?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithRef<"button">) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider);
      }}
    >
      <button {...props}>{children}</button>
    </form>
  );
}
export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className="w-full"
    >
      <Button className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  );
}

