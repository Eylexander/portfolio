import React from "react";
import { BiLogoGoLang, BiLogoReact, BiLogoNodejs } from "react-icons/bi";
import { VscVscodeInsiders } from "react-icons/vsc";
import { Navigation } from "../components/nav";
import Link from "next/link";

const stack = [
  {
    name: "React",
    Icon: BiLogoReact,
    url: "https://reactjs.org/",
  },
  {
    name: "VSCode",
    Icon: VscVscodeInsiders,
    url: "https://code.visualstudio.com/",
  },
  {
    name: "Go",
    Icon: BiLogoGoLang,
    url: "https://golang.org/",
  },
  {
    name: "Node.js",
    Icon: BiLogoNodejs,
    url: "https://nodejs.org/",
  },
];

export default async function AboutPage() {
  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl text-center">
          About Me
        </h1>

        <div className="space-y-8">
          <div className="hidden w-full h-px md:block bg-zinc-800" />

          <div className="flex flex-col items-center md:flex-row md:items-center justify-center w-full md:w-1/2 mx-auto">
            <img
              src="/Myself.jpg"
              alt="Myself"
              className="w-32 h-32 md:w-48 md:h-48 mb-4 md:mb-0 md:mr-16 rounded-3xl"
            />
            <p className="text-zinc-400 text-justify">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam,
              numquam sint nulla, fugit odio dicta aliquam provident totam
              cumque facilis iure non nesciunt amet earum officiis? Fugiat
              assumenda autem minus.
            </p>
          </div>

          <div className="hidden w-full h-px md:block bg-zinc-800" />

          <div className="md:w-5/6 mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Professional Experiences
            </h2>
            <div className="mt-4 text-zinc-400">
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                Job Title 1
              </h3>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div className="mt-4 text-zinc-400">
              <h3 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                Job Title 2
              </h3>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>

          <div className="hidden w-full h-px md:block bg-zinc-800" />

          <div className="md:w-5/6 mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              My Stack
            </h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-8 gap-4">
              {stack.map((tech) => (
                <Link href={tech.url} key={tech.name} target="_blank">
                  <div
                    key={tech.name}
                    className="flex flex-col items-start p-4 bg-gray-800 border border-gray-700 rounded-lg w-24 h-24"
                  >
                    <tech.Icon className="text-6xl text-gray-100" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden w-full h-px md:block bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
