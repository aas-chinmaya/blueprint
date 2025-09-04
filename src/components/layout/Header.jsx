


'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="w-full py-4 sticky ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
        <div className=" border border-border backdrop-blur-md rounded-[25px] px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="text-2xl font-bold text-blue-700 tracking-wide">BluePrint</div>
          <div className="flex items-center gap-4">
            {/* {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="text-foreground hover:bg-muted"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            )} */}
            <Button className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600" onClick={() => router.push("/login")}>Login</Button>
          </div>
        </div>
      </div>
    </header>
  );
}



