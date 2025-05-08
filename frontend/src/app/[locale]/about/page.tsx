"use client";

import React, { useRef } from "react";
import {
  BiLogoGoLang,
  BiLogoReact,
  BiLogoNodejs,
  BiLogoJava,
  BiLogoTypescript,
  BiLogoKubernetes,
  BiLogoDocker,
  BiLogoMongodb,
  BiLogoTailwindCss,
} from "react-icons/bi";
import { VscVscodeInsiders } from "react-icons/vsc";
import { Navigation } from "@/src/components/nav";
import { Link } from "@/src/i18n/navigation";
import { Card } from "@/src/components/card";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

const stack = [
  {
    name: "React",
    Icon: BiLogoReact,
    url: "https://reactjs.org/",
  },
  {
    name: "VsCode",
    Icon: VscVscodeInsiders,
    url: "https://code.visualstudio.com/",
  },
  {
    name: "Golang",
    Icon: BiLogoGoLang,
    url: "https://golang.org/",
  },
  {
    name: "Node.js",
    Icon: BiLogoNodejs,
    url: "https://nodejs.org/",
  },
  {
    name: "Next.js",
    Icon: BiLogoReact,
    url: "https://nextjs.org/",
  },
  {
    name: "Tailwind CSS",
    Icon: BiLogoTailwindCss,
    url: "https://tailwindcss.com/",
  },
  {
    name: "MongoDB",
    Icon: BiLogoMongodb,
    url: "https://www.mongodb.com/",
  },
  {
    name: "Java",
    Icon: BiLogoJava,
    url: "https://www.java.com/",
  },
  {
    name: "Docker",
    Icon: BiLogoDocker,
    url: "https://www.docker.com/",
  },
  {
    name: "Kubernetes",
    Icon: BiLogoKubernetes,
    url: "https://kubernetes.io/",
  },
  {
    name: "TypeScript",
    Icon: BiLogoTypescript,
    url: "https://www.typescriptlang.org/",
  },
];

export default function AboutPage() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!marqueeRef.current || !contentRef.current) return;

      // Clear any existing animations first
      gsap.killTweensOf(contentRef.current);

      // Safely cast the content element to HTMLDivElement
      const marqueeContent = contentRef.current as HTMLDivElement;
      const originalItems = Array.from(
        marqueeContent.children
      ) as HTMLElement[];

      // Calculate the total width of all items
      let totalWidth = 0;
      originalItems.forEach((item) => {
        totalWidth += item.offsetWidth;
      });

      // Clone the items for a perfect loop
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        marqueeContent.appendChild(clone);
      });

      // Set initial position
      gsap.set(marqueeContent, { x: 0 });

      const pixelsPerSecond = 50; // Adjust speed as needed
      const duration = totalWidth / pixelsPerSecond;

      // Create the infinite seamless loop animation
      gsap.to(marqueeContent, {
        x: -totalWidth,
        duration: duration,
        ease: "none", // Linear movement
        repeat: -1,
        onRepeat: function () {
          gsap.set(marqueeContent, { x: 0 });
        },
      });
    },
    { scope: marqueeRef, dependencies: [] }
  );

  const t = useTranslations("about");

  return (
    <div className="relative pb-16">
      <Navigation />

      <div>
        <div className="fixed top-[-10%] right-[-15%] w-[700px] h-[700px] bg-purple-700/40 rounded-full blur-[200px] pointer-events-none firefly-1" />
        <div className="fixed top-[20%] left-[0%] w-[400px] h-[400px] bg-blue-600/25 rounded-full blur-[150px] pointer-events-none firefly-2" />
      </div>

      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl max-md:mt-8">
            {t("title.name")}
          </h2>
          <p className="mt-4 text-zinc-400">{t("title.description")}</p>
        </div>

        <div className="w-full h-px" />

        <div className="grid grid-cols-1 place-items-center md:mx-32">
          <Card>
            <article className="relative flex flex-col md:flex-row w-full h-full p-8">
              <div className="flex-shrink-0 md:mr-8 flex items-center justify-center">
                <img
                  src="/Myself.svg"
                  alt="Description of image"
                  className="w-40 h-40 object-cover rounded-md m-4"
                />
              </div>
              <div>
                <h2 className="my-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display">
                  {t("presentation.title")}
                </h2>
                <p className="mb-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300 text-align-left">
                  {t("presentation.content")
                    .split("\n")
                    .map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index <
                          t("presentation.content").split("\n").length - 1 && (
                            <br />
                          )}
                      </React.Fragment>
                    ))}
                </p>
              </div>
            </article>
          </Card>
        </div>

        <div className="w-full h-px" />

        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {t("experience.title")}
          </h2>
        </div>

        <div className="space-y-8 mx-auto">
          <div className="flex flex-col space-y-1">
            <h3 className="text-2xl font-bold text-zinc-100 font-display">
              {t("experience.job1.title")}
            </h3>
            <p className="text-zinc-500 text-s">
              {t("experience.job1.duration")}
            </p>
          </div>
          <p className="mt-4 leading-8 text-zinc-400">
            {t("experience.job1.description")}
          </p>
          <div className="flex flex-col space-y-1">
            <h3 className="text-2xl font-bold text-zinc-100 font-display">
              {t("experience.job2.title")}
            </h3>
            <p className="text-zinc-500 text-s">
              {t("experience.job2.duration")}
            </p>
          </div>
          <p className="mt-4 leading-8 text-zinc-400">
            {t("experience.job2.description")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {t("techstack")}
          </h2>
        </div>

        <div className="overflow-hidden w-full relative my-8" ref={marqueeRef}>
          <div className="marquee-container">
            <div className="marquee-content" ref={contentRef}>
              {stack.map((item, index) => (
                <Link
                  href={item.url}
                  key={index}
                  className="marquee-item transition-all hover:text-zinc-300"
                  target="_blank"
                >
                  <item.Icon className="w-12 h-12" />
                  <span className="ml-2 text-zinc-400">{item.name}</span>
                </Link>
              ))}
              {/* {stack.map((item, index) => (
                <Link
                  href={item.url}
                  key={index}
                  className="marquee-item transition-all"
                  target="_blank"
                >
                  <item.Icon className="w-12 h-12 text-zinc-300" />
                  <span className="ml-2 text-fuchsia-500">{item.name}</span>
                </Link>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
