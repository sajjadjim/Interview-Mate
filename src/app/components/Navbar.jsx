"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Briefcase, Video, Info, Mail, LogIn, UserPlus, Menu, X,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Jobs", href: "/jobs", Icon: Briefcase },
  { label: "Interviews", href: "/interviews", Icon: Video },
  { label: "About", href: "/about", Icon: Info },
  { label: "Contact", href: "/contact", Icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]); // close drawer on route change

  const isActive = (href) =>
    pathname === href ? "text-blue-600" : "text-gray-700";

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
              {/* shared underline for active link */}
              <AnimatePresence>
                {/* This invisible container allows the shared layoutId underline to animate */}
              </AnimatePresence>
              {navItems.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition hover:text-blue-600 hover:bg-blue-50 ${isActive(href)}`}
                  >
                    <Icon
                      size={18}
                      className={`${active ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"} transition`}
                    />
                    <span>{label}</span>

                    {/* Animated underline pill (shared layout) */}
                    {mounted && active && (
                      <motion.span
                        layoutId="active-pill"
                        className="absolute inset-x-2 -bottom-1 h-1 rounded-full bg-blue-600"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
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
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition hover:bg-blue-50 ${isActive(href)}`}
                      >
                        <Icon size={18} className={active ? "text-blue-600" : "text-gray-500"} />
                        <span>{label}</span>
                        {active && (
                          <motion.span
                            layoutId="active-mobile"
                            className="ml-auto h-1 w-6 rounded-full bg-blue-600"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="mt-3 flex items-center gap-2">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
}
