import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { SiteMock } from "@/components/landing/SiteMock";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in — Bannaa" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l hairline lg:block">
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 grid-bg" />
        <div className="relative flex h-full flex-col items-center justify-center px-12">
          <div className="w-full max-w-md space-y-4">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-white/10 border hairline px-4 py-3 text-sm backdrop-blur">
              A portfolio for my photography studio with a gallery and booking form
            </div>
            <div className="rotate-[-2deg] rounded-2xl ring-gradient bg-ink-900 p-2 shadow-[0_40px_100px_-30px_#c026d3aa] animate-float">
              <div className="aspect-[4/3] overflow-hidden rounded-xl">
                <div className="h-1/2 w-1/2 origin-top-left scale-[2]">
                  <SiteMock colors={["#e11d48", "#7c3aed"]} variant={1} title="Lumen Studio" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-12 max-w-sm text-center font-display text-3xl italic text-white/85">
            “From a sentence to a live site.”
          </p>
        </div>
      </div>
    </main>
  );
}
