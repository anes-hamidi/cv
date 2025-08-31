
"use client";

import Link from "next/link";
import { Package2, Home, List, BarChart, Menu, Settings, Users, LineChart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const mainLinks = [
  { href: "/", label: "POS", icon: Home },
  { href: "/products", label: "Products", icon: List },
  { href: "/sales", label: "Sales", icon: BarChart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/analysis", label: "Analysis", icon: LineChart },
];

const settingsLink = { href: "/settings", label: "Settings", icon: Settings };

const allLinks = [...mainLinks];

const NavLink = ({ link, pathname }: { link: {href: string, label: string, icon: any}, pathname: string}) => (
  <Link
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
)

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="hidden font-bold font-headline md:inline">Liveryly</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-1 text-sm font-medium md:flex flex-1">
          {mainLinks.map((link) => <NavLink key={link.href} link={link} pathname={pathname} />)}
          
          <div className="flex-grow" />
          <NavLink link={settingsLink} pathname={pathname} />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex-1 md:hidden flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {allLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className={cn(pathname === link.href && "bg-accent")}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href={settingsLink.href} className={cn(pathname === settingsLink.href && "bg-accent")}>
                    <settingsLink.icon className="mr-2 h-4 w-4" />
                    {settingsLink.label}
                  </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
