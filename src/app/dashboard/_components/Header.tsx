"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BrainCircuit } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="flex p-4 items-center justify-between bg-secondary shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="logo" width={32} height={32} />
        <span className="font-bold text-xl text-primary">Logoipsum</span>
      </Link>

      <ul className="hidden md:flex gap-6 items-center">
        {[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Questions", href: "/dashboard/questions" },
          { label: "Upgrade", href: "/dashboard/upgrade" },
        ].map((item) => (
          <Link href={item.href} key={item.href}>
            <li
              className={`hover:text-primary hover:font-bold transition-all cursor-pointer
              ${pathname === item.href ? "text-primary font-bold" : ""}
              `}
            >
              {item.label}
            </li>
          </Link>
        ))}
      </ul>

      <UserButton />
    </div>
  );
}
