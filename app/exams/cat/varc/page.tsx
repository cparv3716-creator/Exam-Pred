import { redirect } from "next/navigation";

/** /exams/cat/varc — canonical VARC entry; the live bank lives at /varc/source. */
export default function CatVarcIndexPage() {
  redirect("/exams/cat/varc/source");
}
