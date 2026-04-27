import { auth } from "@/auth";
import { getBlogPosts, getTopContributors } from "@/lib/actions/social";
import { BlogClient } from "@/components/social/blog-client";

export default async function BlogPage(props: {
  searchParams: Promise<{ page?: string; search?: string; difficulty?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  
  const { data: posts, total, totalPages, currentPage } = await getBlogPosts({ 
    page, 
    limit 
  });
  
  const topContributors = await getTopContributors();
  const session = await auth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Field <br />
              <span className="text-brand">Logs</span>
            </h1>
            <p className="font-medium text-xl max-w-md">
              The central hub for all your silicon. Sort, scan, and track your components with industrial precision.
            </p>
          </div>
        </div>

        <BlogClient 
          initialPosts={posts} 
          sessionUser={session?.user} 
          topContributors={topContributors}
          pagination={{
            total,
            totalPages,
            currentPage
          }}
        />
      </main>
    </div>
  );
}
