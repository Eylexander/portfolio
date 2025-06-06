"use client";

import { LuGithub, LuMail, LuAtSign } from "react-icons/lu";
import Link from "next/link";
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import { Footer } from "@/src/components/footer";

const socials = [
	{
		icon: <LuAtSign size={20} />,
		href: "https://discord.com/users/344526513577918477",
		label: "Discord",
		handle: "@eylexander",
	},
	{
		icon: <LuMail size={20} />,
		href: "mailto:eylexander88@gmail.com",
		label: "Email",
		handle: "eylexander88@gmail.com",
	},
	{
		icon: <LuGithub size={20} />,
		href: "https://github.com/Eylexander",
		label: "Github",
		handle: "Eylexander",
	},
];

export default function Example() {
	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
			<Navigation />

			<div>
				<div className="fixed top-[15%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[160px] pointer-events-none firefly-1" />
				<div className="fixed top-[20%] right-[-15%] w-[400px] h-[400px] bg-cyan-500/30 rounded-full blur-[130px] pointer-events-none firefly-2" />
				<div className="fixed bottom-[-5%] left-[30%] w-[550px] h-[550px] bg-rose-500/20 rounded-full blur-[150px] pointer-events-none firefly-3" />
				<div className="fixed top-[10%] right-[20%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[150px] pointer-events-none firefly-4" />
			</div>

			<div className="flex-grow container flex items-center justify-center px-4 mx-auto">
				<div className="grid w-full grid-cols-1 gap-8 mx-auto mt-32 md:mt-0 md:grid-cols-3 lg:gap-16">
					{socials.map((s) => (
						<Card key={s.href}>
							<Link
								href={s.href}
								target="_blank"
								className="p-12 relative flex flex-col items-center gap-4 duration-700 group md:gap-8 md:py-24 md:p-16"
							>
								<span className="relative z-10 flex items-center justify-center w-12 h-12 text-sm duration-1000 border rounded-full text-zinc-200 group-hover:text-white group-hover:bg-zinc-900 border-zinc-500 bg-zinc-900 group-hover:border-zinc-200 drop-shadow-orange">
									{s.icon}
								</span>{" "}
								<div className="z-10 flex flex-col items-center">
									<span className="lg:text-xl font-medium duration-150 xl:text-3xl text-zinc-200 group-hover:text-white font-display">
										{s.handle}
									</span>
									<span className="mt-4 text-sm text-center duration-1000 text-zinc-400 group-hover:text-zinc-200">
										{s.label}
									</span>
								</div>
							</Link>
						</Card>
					))}
				</div>
			</div>
			<Footer />
		</div>
	);
}
