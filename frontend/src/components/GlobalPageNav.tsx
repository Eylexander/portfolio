"use client";

import { usePathname, useRouter } from "next/navigation";
import PageNav from "./PageNav";
import { useTranslations } from "next-intl";

export default function GlobalPageNav() {
  const pathname = usePathname();
  const navT = useTranslations("Navigation");

  // Do not show on Home, Login, or Admin dashboard
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  // Handle specific paths that need custom back behavior
  let backLabel = undefined;
  let backHref = "/";

  // For project detail pages
  if (pathname.startsWith("/projects/") && pathname !== "/projects") {
    backLabel = navT("projects");
    backHref = "/projects";
  }

  return <PageNav backLabel={backLabel} backHref={backHref} />;
}
