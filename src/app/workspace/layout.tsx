import ResearchStreamProvider from "@/components/ui/deep-research/ResearchStreamProvider";
import { ReactNode } from "react";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ResearchStreamProvider>{children}</ResearchStreamProvider>;
}
