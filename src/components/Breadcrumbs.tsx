import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/schema-org";

// Visible breadcrumb trail. Pairs with breadcrumbSchema() so the on-page UI and
// the structured data always agree (Google cross-checks them).
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <li key={item.path} className="flex gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {i === items.length - 1 ? (
              <span className="text-zinc-700">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:underline">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
