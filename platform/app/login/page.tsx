import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "تسجيل الدخول — بنّاء" };

export default function LoginPage() {
  return (
    <main className="glow-bg min-h-screen flex flex-col items-center justify-center gap-8 px-5">
      <Logo />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
