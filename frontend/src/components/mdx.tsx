"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { MDXRemote } from 'next-mdx-remote';

function clsx(...args: any[]) {
	return args.filter(Boolean).join(" ");
}

type ComponentWithClassName = {
  className?: string;
  [key: string]: any;
}

const components = {
	h1: ({ className, ...props }: ComponentWithClassName) => (
		<h1
			className={clsx(
				"mt-2 scroll-m-20 text-4xl font-bold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h2: ({ className, ...props }: ComponentWithClassName) => (
		<h2
			className={clsx(
				"mt-10 scroll-m-20 border-b border-b-zinc-800 pb-1 text-3xl font-semibold tracking-tight first:mt-0",
				className,
			)}
			{...props}
		/>
	),
	h3: ({ className, ...props }: ComponentWithClassName) => (
		<h3
			className={clsx(
				"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h4: ({ className, ...props }: ComponentWithClassName) => (
		<h4
			className={clsx(
				"mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h5: ({ className, ...props }: ComponentWithClassName) => (
		<h5
			className={clsx(
				"mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	h6: ({ className, ...props }: ComponentWithClassName) => (
		<h6
			className={clsx(
				"mt-8 scroll-m-20 text-base font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	),
	a: ({ className, ...props }: ComponentWithClassName) => (
		<Link
			className={clsx(
				"font-medium text-cyan-400 underline underline-offset-4 hover:text-cyan-200 transition-colors",
				className,
			)}
			href={props.href || "#"}
			{...props}
		/>
	),
	p: ({ className, ...props }: ComponentWithClassName) => (
		<p
			className={clsx("leading-7 [&:not(:first-child)]:mt-6", className)}
			{...props}
		/>
	),
	ul: ({ className, ...props }: ComponentWithClassName) => (
		<ul className={clsx("my-6 ml-6 list-disc", className)} {...props} />
	),
	ol: ({ className, ...props }: ComponentWithClassName) => (
		<ol className={clsx("my-6 ml-6 list-decimal", className)} {...props} />
	),
	li: ({ className, ...props }: ComponentWithClassName) => (
		<li className={clsx("mt-2", className)} {...props} />
	),
	blockquote: ({ className, ...props }: ComponentWithClassName) => (
		<blockquote
			className={clsx(
				"mt-6 border-l-2 border-zinc-300 pl-6 italic text-zinc-800 [&>*]:text-zinc-600",
				className,
			)}
			{...props}
		/>
	),
	img: ({
		className,
		alt,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={clsx("rounded-md border border-zinc-200", className)}
			alt={alt}
			{...props}
		/>
	),
	hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
		<hr className="my-4 border-zinc-200 md:my-8" {...props} />
	),
	table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
		<div className="w-full my-6 overflow-y-auto">
			<table className={clsx("w-full", className)} {...props} />
		</div>
	),
	tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
		<tr
			className={clsx(
				"m-0 border-t border-zinc-300 p-0 even:bg-zinc-100",
				className,
			)}
			{...props}
		/>
	),
	th: ({ className, ...props }: ComponentWithClassName) => (
		<th
			className={clsx(
				"border border-zinc-200 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	td: ({ className, ...props }: ComponentWithClassName) => (
		<td
			className={clsx(
				"border border-zinc-200 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
				className,
			)}
			{...props}
		/>
	),
	pre: ({ className, ...props }: ComponentWithClassName) => (
		<pre
			className={clsx(
				"mt-6 mb-4 overflow-x-auto rounded-lg bg-zinc-900 py-4",
				className,
			)}
			{...props}
		/>
	),
	code: ({ className, ...props }: ComponentWithClassName) => (
		<code
			className={clsx(
				"relative rounded border bg-zinc-300 bg-opacity-25 py-[0.2rem] px-[0.3rem] font-mono text-sm text-zinc-600",
				className,
			)}
			{...props}
		/>
	),
	Image,
};

// Loading component with animation
const MDXLoading = () => (
	<div className="mdx-loading space-y-4 animate-pulse">
		<div className="h-6 bg-zinc-200 rounded w-3/4"></div>
		<div className="h-4 bg-zinc-200 rounded w-full"></div>
		<div className="h-4 bg-zinc-200 rounded w-5/6"></div>
		<div className="h-4 bg-zinc-200 rounded w-full"></div>
		<div className="h-4 bg-zinc-200 rounded w-4/6"></div>
	</div>
);

// Error component
const MDXError = ({ error }: { error: Error }) => (
	<div className="mdx-error rounded-md bg-red-50 border border-red-200 p-4">
		<h3 className="text-red-800 font-medium">Error loading content</h3>
		<p className="text-red-700 text-sm mt-1">{error.message}</p>
	</div>
);

interface MdxProps {
	code: string;
	content?: string;
}

export function Mdx({ code, content }: MdxProps) {
	const [mdxContent, setMdxContent] = React.useState<any>(null);
	
	React.useEffect(() => {
		async function processContent() {
			try {
				const { serialize } = await import('next-mdx-remote/serialize');
				if (content) {
					const result = await serialize(content);
					setMdxContent(result);
				} else if (code) {
					const result = await serialize(code);
					setMdxContent(result);
				}
			} catch (error) {
				console.error("Error serializing MDX content:", error);
			}
		}
		
		processContent();
	}, [code, content]);
	
	if (!mdxContent) {
		return <MDXLoading />;
	}
	
	try {
		return (
			<div className="mdx prose prose-zinc dark:prose-invert">
				<MDXRemote {...mdxContent} components={components} />
			</div>
		);
	} catch (err) {
		console.error("Error rendering MDX component:", err);
		const error = err instanceof Error ? err : new Error('Failed to render MDX content');
		return <MDXError error={error} />;
	}
}
