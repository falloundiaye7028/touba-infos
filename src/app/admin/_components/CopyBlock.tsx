"use client";

import { useState } from "react";
import { Copy, Check, Facebook, Send, Video, Bell, Mail } from "lucide-react";

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="fill-current" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  whatsapp: Send,
  x: XIcon,
  tiktok: Video,
  push: Bell,
  mail: Mail,
};

export default function CopyBlock({
  label,
  text,
  icon,
  max,
}: {
  label: string;
  text: string;
  icon?: keyof typeof ICONS | string;
  max?: number;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = icon ? ICONS[icon] : undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const over = max !== undefined && text.length > max;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-bold text-neutral-800">
          {Icon && <Icon size={16} className="text-green-600" />}
          {label}
        </span>
        <div className="flex items-center gap-3">
          {max !== undefined && (
            <span className={`text-xs font-medium ${over ? "text-red-600" : "text-neutral-400"}`}>
              {text.length}/{max}
            </span>
          )}
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-200"
          >
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-neutral-700">
        {text}
      </pre>
    </div>
  );
}
