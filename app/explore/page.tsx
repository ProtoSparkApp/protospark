import { auth } from "@/auth";
import { ExploreView } from "@/components/social/explore-view";

export default async function ExplorePage() {
  const session = await auth();
  return (
    <ExploreView sessionUser={session?.user} />
  );
}
