import { Suspense } from "react";

export default function RPGLayer({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
