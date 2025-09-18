import { redirect } from "next/navigation";

export default function RPGIndexPage() {
  // Temporarily redirect to test page instead of dashboard
  redirect("/test");
}