import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Scan | ProtoSpark",
  description: "Connect your mobile device to scan components directly into your project.",
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
