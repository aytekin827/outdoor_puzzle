import { redirect } from "next/navigation";

export default function ResultsIndexPage() {
  redirect("/admin/results/play-sessions");
}
