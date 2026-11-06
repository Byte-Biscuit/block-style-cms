import { notFound } from "next/navigation";

/** Catch unknown paths under /[locale]/… so [locale]/not-found.tsx renders. */
export default function CatchAllPage() {
    notFound();
}
