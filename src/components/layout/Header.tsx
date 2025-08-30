
"use client";

import Link from "next/link";
import { Package2, Home, List, BarChart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "POS", icon: Home },
  { href: "/products", label: "Products", icon: List },
  { href: "/sales", label: "Sales", icon: BarChart },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">Liveryly</span>
        </Link>
        <nav className="flex items-center space-x-1 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              <span className="relative z-10 flex items-center">
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </span>
              {pathname === link.href && (
                <motion.div
                  layoutId="active-nav-link"
                  className="absolute inset-0 rounded-md bg-accent"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
