"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Camera, Search, User } from "lucide-react"

const navItems = [
  {
    href: "/diary",
    label: "Diary",
    icon: BookOpen,
  },
  {
    href: "/log/photo",
    label: "Photo",
    icon: Camera,
  },
  {
    href: "/log/manual",
    label: "Manual",
    icon: Search,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto max-w-sm">
                <div className="grid h-16 grid-cols-4 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors"
                            >
                                <div
                                    className={
                                        isActive
                                            ? "flex h-9 w-full flex-col items-center justify-center gap-1 rounded-2xl text-accent-foreground"
                                            : "flex h-9 w-full flex-col items-center justify-center gap-1 rounded-2xl text-muted-foreground"
                                    }
                                >
                                    <Icon 
                                        className="h-5 w-5" 
                                    />
                                </div>

                                <span                   
                                    className={
                                        isActive
                                        ? "text-xs font-bold"
                                        : "text-xs font-medium"
                                    }
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div className="absolute left-0 right-0 top-full h-24 bg-background" />
        </nav>
    )
}