"use client";

import ArticleEditor from "@/components/ArticleEditor";

export default function NewArticlePage() {
    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            <ArticleEditor isNew={true} backHref="/admin/dashboard" />
        </div>
    );
}
