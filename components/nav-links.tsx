"use client";

import { SmartLink } from "./smart-link";

export function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-8 font-heading font-bold uppercase text-sm">
      <SmartLink href="/inventory" className="hover:text-brand transition-colors">Inventory</SmartLink>
      <SmartLink href="/projects" className="hover:text-brand transition-colors">Projects</SmartLink>
      <SmartLink href="/explore" className="hover:text-brand transition-colors">Explore</SmartLink>
      <SmartLink href="/blog" className="hover:text-brand transition-colors">Blog</SmartLink>
    </nav>
  );
}
