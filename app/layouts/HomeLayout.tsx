import type { ReactNode } from "react";
import Orb from "../components/Orb";

type HomeLayoutProps = {
  children: ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b0b17] via-[#141427] to-black text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute -bottom-44 -right-32 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/15 blur-[120px]" />
        <div className="absolute left-[12%] bottom-[18%] h-56 w-56 rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-6xl">{children}</div>
      </div>

      <Orb />
    </div>
  );
}
