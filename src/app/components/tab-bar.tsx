"use client";
import { Box, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-dvw items-center pl-3 pb-1 space-x-8 border-b border-slate-300 dark:border-slate-700">
      <a href="/" className={pathname === "/" ? "font-semibold flex space-x-1 items-start" :
        "flex space-x-1 items-start"}><Box size={20} /> <p>Data Sources</p></a>
      <a href="/chat" className={pathname === "/chat" ? "flex space-x-1 items-start font-semibold" :
        "flex space-x-1 items-start"}><Sparkles size={20} /> <p>Chat</p></a>
    </div>

  );
}
