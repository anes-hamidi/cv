"use client";

import Link from "next/link";
import { Package2, Home, List, BarChart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "POS", icon: Home },
    { href: "/products", label: "Products", icon: List },
    { href: "/sales", label: "Sales", icon: BarChart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">OfflinePOS</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80 flex items-center",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
