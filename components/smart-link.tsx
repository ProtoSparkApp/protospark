"use client";

import Link, { LinkProps } from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { 
  getExploreProjects, 
  getTopProjects, 
  getBlogPosts, 
  getUserLibrary 
} from "@/lib/actions/social";
import { getInventory } from "@/lib/actions/inventory";
import { ReactNode } from "react";

interface SmartLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export function SmartLink({ href, children, className, ...props }: SmartLinkProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    const path = typeof href === 'string' ? href : href.pathname;

    if (path === "/inventory") {
      queryClient.prefetchQuery({
        queryKey: ["inventory", { page: 1, search: "", category: undefined }],
        queryFn: () => getInventory({ page: 1, search: "", category: undefined }),
      });
    }

    if (path === "/explore") {
      queryClient.prefetchQuery({
        queryKey: ["explore-projects"],
        queryFn: () => getExploreProjects(),
      });
      queryClient.prefetchQuery({
        queryKey: ["top-projects"],
        queryFn: () => getTopProjects(),
      });
    }

    if (path === "/blog") {
      queryClient.prefetchQuery({
        queryKey: ["blog-posts"],
        queryFn: () => getBlogPosts(),
      });
    }

    if (path === "/projects") {
      queryClient.prefetchQuery({
        queryKey: ["user-library"],
        queryFn: () => getUserLibrary(),
      });
    }
  };

  return (
    <Link 
      href={href} 
      className={className} 
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}
