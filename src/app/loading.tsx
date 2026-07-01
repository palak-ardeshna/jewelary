import { ListingSkeleton } from "@/components/Skeletons";

// Shown during client-side route transitions (App Router streaming). Keeps the
// layout stable so navigation never flashes blank.
export default function Loading() {
  return <ListingSkeleton count={8} />;
}
