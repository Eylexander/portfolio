"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      components={{
        pre({ children, ...props }) {
          return (
            <div className="relative group not-prose my-6">
              <pre {...props} className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono text-foreground">
                {children}
              </pre>
              <CopyButton text={extractTextFromNode(children)} />
            </div>
          );
        },
        code({ inline, className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
          if (inline) {
            return (
              <code className="text-primary bg-secondary px-1.5 py-0.5 rounded text-sm font-normal" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={className} {...props}>
              {String(children).replace(/\n$/, "")}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join("");
  if (React.isValidElement(node)) return extractTextFromNode(node.props.children);
  return "";
}
