// src/app/components/Navbar.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown } from "lucide-react";

// Renders either a styled Link or a styled <button>
const NavItem = ({ href, children, isButton, onClick }) => {
  const base = "px-2 py-1 whitespace-nowrap";
  const linkStyle = "hover:underline";
  
  // Style variants
  const blueBtn = "bg-blue-500 text-white rounded hover:bg-blue-600";
  const redBtn = "bg-red-500 text-white rounded hover:bg-red-600";

  // Apply red style only if it's a button and labeled "Logout"
  const isLogout = children === "Logout" && isButton;
  const classes = `${base} ${isButton ? (isLogout ? redBtn : blueBtn) : linkStyle}`;

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
};

function ResponsiveNav({ session, showLogout, onLogout }) {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const [overflowing, setOverflowing] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Build your nav items array
  const allLinks = [
    { label: "Home", href: "/" },
    ...(session ? [{ label: "Dashboard", href: "/dashboard" }] : []),
    ...(session ? [{ label: "Finance Information", href: "/userSetup" }] : []),

    // Only show Settings if NOT on /settings
    ...(session && !showLogout
      ? [{ label: "Settings", href: "/settings", isButton: true }]
      : []),

    // On /settings, swap in a Logout button
    ...(session && showLogout
      ? [{ label: "Logout", onClick: onLogout, isButton: true }]
      : []),

    // If no session, show auth links
    ...(!session
      ? [
          { label: "Login", href: "/login" },
          { label: "Register", href: "/login/register" },
        ]
      : []),
  ];

  // Measure & overflow logic (unchanged)
  const recompute = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      if (window.innerWidth >= 768) {
        setHiddenIndices([]);
        setOverflowing(false);
        return;
      }

      let used = 0;
      const hidden = [];
      itemsRef.current.forEach((el, idx) => {
        if (!el) return;
        const w = el.offsetWidth;
        if (used + w > container.clientWidth - 50) hidden.push(idx);
        else used += w;
      });
      setHiddenIndices(hidden);
      setOverflowing(hidden.length > 0);
    });
  };

  useEffect(() => {
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [session, showLogout]);

  useEffect(() => {
    const closeOnClickAway = (e) => {
      if (
        menuOpen &&
        !e.target.closest("[data-overflow-menu]") &&
        !e.target.closest("[data-overflow-button]")
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", closeOnClickAway);
    return () => document.removeEventListener("click", closeOnClickAway);
  }, [menuOpen]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <div className="flex overflow-hidden flex-nowrap">
        {allLinks.map((ln, idx) => {
          const hidden = hiddenIndices.includes(idx);
          return (
            <div
              key={idx}
              ref={(el) => (itemsRef.current[idx] = el)}
              className={hidden ? "hidden" : "block"}
            >
              <NavItem
                href={ln.href}
                isButton={ln.isButton}
                onClick={ln.onClick}
              >
                {ln.label}
              </NavItem>
            </div>
          );
        })}
      </div>

      {overflowing && (
        <div className="relative ml-1" data-overflow-menu>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            data-overflow-button
            aria-label="More"
            className="flex items-center px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none"
            type="button"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow z-20">
              {allLinks.map((ln, idx) => {
                if (!hiddenIndices.includes(idx)) return null;
                if (ln.onClick) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        ln.onClick();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 whitespace-nowrap"
                    >
                      {ln.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={idx}
                    href={ln.href}
                    className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 whitespace-nowrap"
                    onClick={() => setMenuOpen(false)}
                  >
                    {ln.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // If user is on /settings, we swap Settings → Logout
  const showLogout = Boolean(session && pathname === "/settings");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">Finance Visualiser</div>
      <ResponsiveNav
        session={session}
        showLogout={showLogout}
        onLogout={handleLogout}
      />
    </div>
  );
}
