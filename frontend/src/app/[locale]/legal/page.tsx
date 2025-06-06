import React from "react";
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import { getTranslations } from "next-intl/server";

export default async function LegalPage() {
    const t = await getTranslations("legal");

    return (
        <div className="relative pb-16">
            <Navigation />

            <div>
                <div className="fixed top-[10%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/25 rounded-full blur-[150px] pointer-events-none firefly-1" />
                <div className="fixed top-[20%] right-[-10%] w-[420px] h-[420px] bg-cyan-500/25 rounded-full blur-[150px] pointer-events-none firefly-2" />
                <div className="fixed bottom-[-10%] left-[30%] w-[430px] h-[430px] bg-orange-500/20 rounded-full blur-[150px] pointer-events-none firefly-3" />
            </div>

            <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
                <div className="max-w-2xl mx-auto lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-zinc-400">{t("subtitle")}</p>
                </div>

                <Card>
                    <article className="relative w-full h-full p-4 md:p-8">
                        <div>
                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("law")}
                            </p>

                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("acceptance")}
                            </p>

                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("reference")}
                            </p>

                            <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                                {t("editor.title")}
                            </h3>
                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("editor.content")}
                            </p>

                            <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                                {t("hoster.title")}
                            </h3>
                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("hoster.content")}
                            </p>

                            <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                                {t("access.title")}
                            </h3>
                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("access.content")}
                            </p>

                            <p className="mt-4 leading-8 text-zinc-400">
                                {t("copyright")}
                            </p>
                        </div>
                    </article>
                </Card>
            </div>
        </div>
    );
}
