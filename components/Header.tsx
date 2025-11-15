"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-purple-600">Quiz System</h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant={
                  isActive("/") && !pathname.startsWith("/admin")
                    ? "primary"
                    : "outline"
                }
                className={
                  isActive("/") && !pathname.startsWith("/admin") ? "" : ""
                }
              >
                User
              </Button>
            </Link>

            <Link href="/admin">
              <Button
                variant={pathname.startsWith("/admin") ? "primary" : "outline"}
              >
                Admin
              </Button>
            </Link>

            <Link href="/admin/create">
              <Button>Create Quiz</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
