"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Inventory", href: "/inventory" },
  { name: "Projects", href: "/projects" },
  { name: "TME Store", href: "/store" },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="relative z-[60] p-2 focus:outline-none"
        aria-label="Toggle Menu"
      >
        <div className="flex flex-col gap-1.5 w-8 items-end">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 8, width: "32px" } : { rotate: 0, y: 0, width: "32px" }}
            className="h-1 bg-black block transition-all"
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0, width: "24px" }}
            className="h-1 bg-black block transition-all"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -8, width: "32px" } : { rotate: 0, y: 0, width: "16px" }}
            className="h-1 bg-black block transition-all"
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 mt-20"
            />

            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-20 left-0 right-0 bg-white border-b-4 border-black z-50 flex flex-col p-6 shadow-brutal"
            >
              <nav className="flex flex-col gap-6">
                {menuItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    custom={i}
                    variants={linkVariants}
                  >
                    <Link
                      href={item.href}
                      onClick={toggleMenu}
                      className="text-4xl font-heading font-black uppercase italic tracking-tighter hover:text-brand transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 flex flex-col gap-4"
              >
                <Link href="/register" onClick={toggleMenu}>
                  <Button variant="neo" className="w-full text-lg py-6">Get Started</Button>
                </Link>
                <Link href="/login" onClick={toggleMenu}>
                  <Button variant="outline" className="w-full text-lg py-6 italic font-black">Sign In</Button>
                </Link>
              </motion.div>

              <div className="mt-8 pt-8 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-mono font-bold uppercase text-black/40">
                <span>© 2026 ProtoSpark</span>
                <span>v0.0.1</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
