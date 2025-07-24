"use client";
import { Box, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export const TabBar = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-dvw items-center pl-3 space-x-8 border-b border-slate-300 dark:border-slate-700">
      <a href="/" className={pathname === "/" ? "font-semibold border-b-2 border-indigo-600 flex space-x-1 items-center" :
        "flex space-x-1 items-center"}><Box size={16} /> <p>Data Sources</p></a>
      <a href="/chat" className={pathname === "/chat" ? "flex space-x-1 items-center font-semibold border-b-2 border-indigo-600" :
        "flex space-x-1 items-center"}><Sparkles size={16} /> <p>Chat</p></a>
    </div>

  );
}
