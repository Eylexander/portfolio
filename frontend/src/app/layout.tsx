import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import AdminLoginButton from "@/components/AdminLoginButton";
import CustomCursor from "@/components/CustomCursor";
import PageNav from "@/components/PageNav";
import BoidsWrapper from "@/components/BoidsWrapper";
import "./global.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "eylexander.fr",
	description: "Personal Portfolio of eylexander",
	icons: {
		shortcut: "/favicon.png",
	},
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const messages = await getMessages();
	const locale = await getLocale();

	return (
		<html lang={locale} suppressHydrationWarning className={inter.variable}>
			<body className={`antialiased min-h-screen bg-background text-foreground transition-colors duration-300 font-sans`}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<ThemeProvider>
						<CustomCursor />
						<BoidsWrapper />
						<ToasterProvider />
						<PageNav />
						{children}
						<AdminLoginButton />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
