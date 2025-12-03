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
  Bell,
  Airplay
} from "lucide-react";
// import { Airplay } from 'lucide-react';  
import { useAuth } from "@/context/AuthContext";

/**
 * Base navigation items (public).
 * We will filter these later depending on user role + loading state.
 */
const navItems = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Jobs", href: "/jobs", Icon: Briefcase },
  { label: "Interviews", href: "/interviews", Icon: Video },
  { label: "Apply", href: "/apply", Icon: Airplay },
  { label: "About", href: "/about", Icon: Info },
  // { label: "Contact", href: "/contact", Icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Mobile drawer open/close
  const [open, setOpen] = useState(false);
  // For avoiding hydration issues with motion
  const [mounted, setMounted] = useState(false);
  // Avatar dropdown state
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Auth info from context (Firebase user, loading, logout helper)
  const { user, loading, logout } = useAuth();

  // ---------- ROLE & DB USER STATE ----------
  // This holds the user document from MongoDB (/api/users/me)
  const [dbUser, setDbUser] = useState(null);
  // Convenience copy of the role (candidate | hr | company | admin | student)
  const [role, setRole] = useState(null);
  // While we are fetching MongoDB user/role, this is true
  const [roleLoading, setRoleLoading] = useState(false);

  // ---------- NOTIFICATION STATE ----------
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Mark when component is mounted (for framer-motion / client things)
  useEffect(() => setMounted(true), []);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  /**
   * Fetch the DB user (and role) from /api/users/me when Firebase user changes.
   * Role is stored in MongoDB as `role: "candidate" | "hr" | "company" | "admin" | "student"`.
   */
  useEffect(() => {
    // If not logged in: clear role & stop loading
    if (!user) {
      setDbUser(null);
      setRole(null);
      setRoleLoading(false);
      return;
    }

    let active = true;

    const fetchDbUser = async () => {
      try {
        setRoleLoading(true);
        const res = await fetch(`/api/users/me?uid=${user.uid}`);
        if (!res.ok) {
          console.error("Failed to load DB user for navbar.");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setDbUser(data);
        setRole(data?.role || null);
      } catch (err) {
        console.error("Error loading DB user:", err);
      } finally {
        if (active) setRoleLoading(false);
      }
    };

    fetchDbUser();

    return () => {
      active = false;
    };
  }, [user]);

  /**
   * Helper: determines if a nav item is active for underline highlight.
   */
  const isActive = (href) =>
    pathname === href ? "text-blue-600" : "text-gray-700";

  /**
   * Display name & avatar helpers
   */
  const displayName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "User");

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarUrl = user?.photoURL || null;

  /**
   * Notification helpers
   */
  const unreadCount = notifications.filter((n) => !n.read).length;
  const lastFiveNotifications = notifications.slice(0, 5);

  /**
   * Logout handler: calls AuthContext.logout, closes menus, routes home.
   */
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

  /**
   * Load notifications for the logged-in user.
   * This hits /api/notifications?email=... and refreshes every 30s.
   */
  useEffect(() => {
    if (!user || loading) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        setNotifLoading(true);
        const res = await fetch(
          `/api/notifications?email=${encodeURIComponent(user.email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        if (isMounted) setNotifLoading(false);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, loading]);

  /**
   * When opening the notification dropdown, mark all as read in DB
   * and update in-memory state.
   */
  const handleToggleNotifications = async () => {
    if (!notifOpen && user && unreadCount > 0) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }

    setNotifOpen((v) => !v);
  };

  /**
   * Handle click on a single notification:
   * - If `notif.link` exists, navigate there.
   */
  const handleNotificationClick = (notif) => {
    if (notif.link) {
      router.push(notif.link);
      setNotifOpen(false);
    }
  };

  /**
   * ROLE-BASED NAVIGATION FILTER (very important for UX & security feel):
   *
   * 1) While `roleLoading === true` (user logged in but Mongo role not loaded yet),
   *    we HIDE sensitive items:
   *      - /jobs
   *      - /apply
   *      - /interviews
   *    so nobody can see them even for 1 second until we know the exact role.
   *
   * 2) Once role is known:
   *    - candidate / student:
   *        show: Jobs, Apply
   *        hide: Interviews
   *    - company:
   *        show: Jobs
   *        hide: Apply, Interviews
   *    - hr:
   *        show: Interviews
   *        hide: Jobs, Apply
   *    - admin:
   *        show everything
   *    - guests (no user, no role):
   *        treat as public user, but we hide Interviews (HR/admin tool).
   */
  const filteredNavItems = navItems.filter(({ href }) => {
    // While role is loading for a logged-in user → hide sensitive items
    if (roleLoading && user) {
      if (href === "/jobs" || href === "/apply" || href === "/interviews") {
        return false;
      }
      return true;
    }

    // If no logged-in user (guest) → show public pages, hide interviews
    if (!user || !role) {
      if (href === "/interviews") return false;
      return true;
    }

    // Role-specific logic after role is known
    if (role === "hr") {
      // HR sees interviews only (plus Home/About/Contact)
      if (href === "/jobs" || href === "/apply") return false;
      return true;
    }

    if (role === "company") {
      // Company only sees Jobs from the sensitive things
      if (href === "/apply" || href === "/interviews") return false;
      return true;
    }

    if (role === "candidate" || role === "student") {
      // Candidates/students see Jobs & Apply but NOT Interviews page
      if (href === "/interviews") return false;
      return true;
    }

    if (role === "admin") {
      // Admin sees everything
      return true;
    }

    // Fallback for unexpected roles: treat like public user, hide interviews
    if (href === "/interviews") return false;
    return true;
  });

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

            {/* Desktop links (top nav) */}
            <div className="hidden md:flex items-center gap-2 relative">
              <AnimatePresence>{/* shared underline container */}</AnimatePresence>
              {filteredNavItems.map(({ label, href, Icon }) => {
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
              {/* Not logged in */}
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

              {/* Logged in user */}
              {!loading && user && (
                <>
                  {/* 🔔 Notification bell */}
                  <div className="relative">
                    <button
                      onClick={handleToggleNotifications}
                      className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 text-gray-700"
                    >
                      <Bell
                        size={20}
                        className={unreadCount > 0 ? "text-blue-600" : ""}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification dropdown */}
                    <AnimatePresence>
                      {notifOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-800">
                              Notifications
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {unreadCount > 0
                                ? `${unreadCount} new`
                                : "All caught up"}
                            </span>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {notifLoading && (
                              <div className="px-3 py-4 text-xs text-gray-500 flex items-center gap-2">
                                <span className="inline-block h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                                Loading...
                              </div>
                            )}

                            {!notifLoading &&
                              lastFiveNotifications.length === 0 && (
                                <div className="px-3 py-4 text-xs text-gray-500">
                                  No notifications yet.
                                </div>
                              )}

                            {!notifLoading &&
                              lastFiveNotifications.map((notif) => (
                                <button
                                  key={notif._id}
                                  onClick={() =>
                                    handleNotificationClick(notif)
                                  }
                                  className={`w-full text-left px-3 py-2 text-xs border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                                    notif.read
                                      ? "text-gray-600"
                                      : "bg-blue-50/60 text-gray-800"
                                  }`}
                                >
                                  <p className="font-semibold truncate">
                                    {notif.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="mt-1 text-[10px] text-gray-400">
                                    {notif.createdAt
                                      ? new Date(
                                          notif.createdAt
                                        ).toLocaleString()
                                      : ""}
                                  </p>
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Avatar dropdown */}
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

                    {/* Avatar menu content */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-xs text-gray-500">
                              Signed in as
                            </p>
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {user.email}
                            </p>
                            {role && (
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Role:{" "}
                                <span className="capitalize font-semibold">
                                  {role}
                                </span>
                              </p>
                            )}
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

                            {/* Candidate / student: show "Application" */}
                            {(role === "candidate" || role === "student") && (
                              <Link
                                href="/application"
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                              >
                                <User size={16} /> Application
                              </Link>
                            )}

                            {/* HR / Company-only: show "Applicant Tracking" */}
                            {(role === "hr" || role === "company") && (
                              <Link
                                href="/applicant_tracking"
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                              >
                                <User size={16} /> Applicant Tracking
                              </Link>
                            )}

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
                </>
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

        {/* Mobile drawer (role-based nav + auth) */}
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
                {/* Mobile user summary */}
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
                      {role && (
                        <span className="text-[11px] text-gray-500">
                          Role:{" "}
                          <span className="capitalize font-semibold">
                            {role}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Top nav items (filtered by role) */}
                {filteredNavItems.map(({ label, href, Icon }) => {
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

                {/* Mobile auth / role-based shortcuts */}
                <div className="mt-3 flex flex-col gap-2">
                  {/* Not logged in */}
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

                  {/* Logged in: show role-based links + logout */}
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

                      {/* Candidate / student Application (mobile) */}
                      {(role === "candidate" || role === "student") && (
                        <Link
                          href="/application"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          <User size={18} /> Application
                        </Link>
                      )}

                      {/* HR / Company-only Applicant Tracking (mobile) */}
                      {(role === "hr" || role === "company") && (
                        <Link
                          href="/applicant_tracking"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          <User size={18} /> Applicant Tracking
                        </Link>
                      )}

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
