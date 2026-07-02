import { WishlistClient } from "@/components/WishlistClient";

export const metadata = {
  title: "Wishlist | Aurelia",
  description: "View your saved fine jewellery on Aurelia.",
};

export default function WishlistPage() {
  return (
    <div className="animate-fade-up">
      <WishlistClient />
    </div>
  );
}
