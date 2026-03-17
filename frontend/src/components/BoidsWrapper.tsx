"use client";

import { usePathname } from "next/navigation";
import BoidsBackground from "./BoidsBackground";

export default function BoidsWrapper() {
  const pathname = usePathname() || "";

  const isHome = pathname === "/";
  const isProjectSlug = pathname.match(/\/projects\/.+/);
  const isHidden = pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (isHidden) return null;

  let backgroundClass = "";
  if (isProjectSlug) {
    backgroundClass = "!opacity-0 blur-md";
  } else if (!isHome) {
    backgroundClass = "blur-sm !opacity-30";
  }

  return (
    <BoidsBackground
      className={`transition-all duration-700 ease-in-out ${backgroundClass}`}
    />
  );
}