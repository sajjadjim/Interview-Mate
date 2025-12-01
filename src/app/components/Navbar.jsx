"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  Video,
  Info,
  Mail,
  LogIn,
  UserPlus,
  Menu,
  X,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Jobs", href: "/jobs", Icon: Briefcase },
  { label: "Interviews", href: "/interviews", Icon: Video },
  { label: "Apply", href: "/apply", Icon: Briefcase },
  { label: "About", href: "/about", Icon: Info },
  { label: "Contact", href: "/contact", Icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, loading, logout } = useAuth();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setOpen(false);        // close drawer on route change
    setUserMenuOpen(false);
  }, [pathname]);

  const isActive = (href) =>
    pathname === href ? "text-blue-600" : "text-gray-700";

  const displayName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "User");

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = user?.photoURL || null;

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50">
      {/* Animated shimmer top line */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />
      <motion.div
        className="backdrop-blur supports-[backdrop-filter]:bg-white/75 bg-white/90 shadow-sm"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.span
                whileHover={{ rotate: 6, scale: 1.04 }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold"
              >
                IM
              </motion.span>
              <motion.span
                className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-blue-700"
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                InterviewMate
              </motion.span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-2 relative">
              <AnimatePresence>{/* shared underline container */}</AnimatePresence>
              {navItems.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition hover:text-blue-600 hover:bg-blue-50 ${isActive(
                      href
                    )}`}
                  >
                    <Icon
                      size={18}
                      className={`${
                        active
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-600"
                      } transition`}
                    />
                    <span>{label}</span>

                    {mounted && active && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-x-2 -bottom-1 h-1 rounded-full bg-blue-600"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop auth / user area */}
            <div className="hidden md:flex items-center gap-3 relative">
              {/* While auth state loading, show nothing (or a small skeleton if you want) */}
              {!loading && !user && (
                <>
                  <motion.div whileHover={{ y: -2 }}>
                    <Link
                      href="/authentication/login"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                    >
                      <LogIn size={18} /> Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }}>
                    <Link
                      href="/authentication/register"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow"
                    >
                      <UserPlus size={18} /> Sign up
                    </Link>
                  </motion.div>
                </>
              )}

              {!loading && user && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1 text-sm">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                          >
                            <Home size={16} /> Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                          >
                            <User size={16} /> Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-red-600"
                          >
                            <LogIn size={16} className="rotate-180" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.96 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="md:hidden border-t border-gray-200 overflow-hidden bg-white/95"
            >
              <div className="px-4 py-3 space-y-1">
                {/* If logged in, show user info at top */}
                {!loading && user && (
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-50">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {displayName}
                      </span>
                      <span className="text-[11px] text-gray-500 truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                )}

                {navItems.map(({ label, href, Icon }) => {
                  const active = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      initial={{ x: -8, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition hover:bg-blue-50 ${isActive(
                          href
                        )}`}
                      >
                        <Icon
                          size={18}
                          className={active ? "text-blue-600" : "text-gray-500"}
                        />
                        <span>{label}</span>
                        {active && (
                          <motion.span
                            layoutId="active-mobile"
                            className="ml-auto h-1 w-6 rounded-full bg-blue-600"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile auth area */}
                <div className="mt-3 flex flex-col gap-2">
                  {!loading && !user && (
                    <div className="flex items-center gap-2">
                      <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                        <Link
                          href="/authentication/login"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                        >
                          <LogIn size={18} /> Login
                        </Link>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                        <Link
                          href="/authentication/register"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow"
                        >
                          <UserPlus size={18} /> Sign up
                        </Link>
                      </motion.div>
                    </div>
                  )}

                  {!loading && user && (
                    <>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        <Home size={18} /> Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        <User size={18} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-gray-50 text-left"
                      >
                        <LogIn size={18} className="rotate-180" /> Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
}
