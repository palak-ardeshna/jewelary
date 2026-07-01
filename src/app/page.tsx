import Link from "next/link";
import Image from "next/image";
import { getTopCategories, getCollections, getInStockProducts } from "@/data/store";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  const categories = getTopCategories();
  const collections = getCollections(3);
  const featured = getInStockProducts().slice(0, 8);
  const gifting = getInStockProducts().filter((p) => p.priceInPaise <= 5000000).slice(0, 4);

  // Placeholder imagery (Unsplash) keyed by jewellery category slug.
  const catImages: Record<string, string> = {
    "rings":       "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80&fit=crop&auto=format",
    "necklaces":   "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80&fit=crop&auto=format",
    "earrings":    "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80&fit=crop&auto=format",
    "bracelets":   "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80&fit=crop&auto=format",
    "bangles":     "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&q=80&fit=crop&auto=format",
    "pendants":    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80&fit=crop&auto=format",
    "mangalsutra": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&q=80&fit=crop&auto=format",
    "gifts":       "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80&fit=crop&auto=format",
  };

  return (
    <div className="animate-fade-up">
      {/* ── Hero ── */}
      <section className="hero-section" style={{
        background:"linear-gradient(135deg,#1c1917 0%,#2a2420 55%,#3d342a 100%)",
        borderRadius:"var(--radius-lg)", padding:"5rem 2rem", marginBottom:"3.5rem",
        color:"#faf8f5", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url(https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&q=60&fit=crop&auto=format)", backgroundSize:"cover", backgroundPosition:"center", opacity:0.22 }} />
        <div style={{ position:"relative", maxWidth:640 }}>
          <span className="eyebrow" style={{ color:"var(--gold-soft)", display:"inline-block", marginBottom:"1.25rem" }}>The 2026 Bridal Edit</span>
          <h1 className="font-display" style={{ fontSize:"clamp(2.5rem,6vw,4rem)", fontWeight:500, lineHeight:1.05, marginBottom:"1.25rem", letterSpacing:"0.01em" }}>
            Jewellery made<br />to be inherited
          </h1>
          <p style={{ fontSize:"1.05rem", opacity:0.85, marginBottom:"2.25rem", lineHeight:1.7, maxWidth:480 }}>
            BIS-hallmarked gold and platinum, set with IGI &amp; GIA-certified diamonds. A transparent price breakup, lifetime exchange, and craftsmanship built to last generations.
          </p>
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
            <Link href="/c/best-diamond-engagement-rings" className="btn-accent" style={{ textDecoration:"none" }}>Explore Engagement Rings →</Link>
            <Link href="/rings" style={{ textDecoration:"none", background:"rgba(250,248,245,0.12)", color:"#faf8f5", padding:"0.75rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, backdropFilter:"blur(4px)", border:"1px solid rgba(250,248,245,0.25)" }}>
              Shop All Jewellery
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center", marginBottom:"3.5rem" }}>
        {[["✔","BIS Hallmarked & Certified"],["₹","Transparent Price Breakup"],["↻","Lifetime Exchange"],["🔒","Insured Free Shipping"]].map(([icon,text])=>(
          <div key={text} style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.6rem 1.15rem", background:"var(--surface)", borderRadius:"99px", border:"1px solid var(--border)", fontSize:"0.85rem", fontWeight:500 }}>
            <span style={{ color:"var(--accent-dark)", fontWeight:700 }}>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>

      {/* ── Shop by Category ── */}
      <section style={{ marginBottom:"3.5rem" }}>
        <h2 className="font-display" style={{ fontSize:"1.9rem", fontWeight:500, marginBottom:"1.25rem", textAlign:"center" }}>Shop by Category</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"1rem" }}>
          {categories.map((c) => (
            <Link key={c.id} href={`/${c.slug}`} style={{ textDecoration:"none", color:"inherit" }}>
              <div className="card" style={{ overflow:"hidden", textAlign:"center" }}>
                <div style={{ aspectRatio:"1/1", background:"var(--surface-2)", position:"relative", overflow:"hidden" }}>
                  {catImages[c.slug] && (
                    <Image src={catImages[c.slug]} alt={c.name} fill style={{ objectFit:"cover" }} sizes="180px" />
                  )}
                </div>
                <div style={{ padding:"0.7rem 0.5rem", fontWeight:500, fontSize:"0.9rem", letterSpacing:"0.02em" }}>{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Gifting ── */}
      {gifting.length > 0 && (
        <section style={{ marginBottom:"3.5rem" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.25rem" }}>
            <h2 className="font-display" style={{ fontSize:"1.9rem", fontWeight:500 }}>
              Gifts Under ₹50,000
            </h2>
            <Link href="/gifts" style={{ fontSize:"0.85rem", color:"var(--accent-dark)", textDecoration:"none", fontWeight:600 }}>View all →</Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
            {gifting.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Featured ── */}
      <section style={{ marginBottom:"3.5rem" }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"1.25rem" }}>
          <h2 className="font-display" style={{ fontSize:"1.9rem", fontWeight:500 }}>The Signature Selection</h2>
          <Link href="/rings" style={{ fontSize:"0.85rem", color:"var(--accent-dark)", textDecoration:"none", fontWeight:600 }}>Shop all →</Link>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Curated Collections ── */}
      <section>
        <h2 className="font-display" style={{ fontSize:"1.9rem", fontWeight:500, marginBottom:"1.25rem", textAlign:"center" }}>Curated Collections</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"1rem" }}>
          {collections.filter(c => c.intro).map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} style={{ textDecoration:"none" }}>
              <div className="card" style={{ padding:"1.75rem" }}>
                <p className="font-display" style={{ fontWeight:600, fontSize:"1.35rem", marginBottom:"0.5rem", color:"var(--primary)", lineHeight:1.2 }}>{c.title}</p>
                {c.intro && <p style={{ fontSize:"0.875rem", color:"var(--fg-muted)", lineHeight:1.6, display:"-webkit-box", overflow:"hidden", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>{c.intro}</p>}
                <span style={{ display:"inline-block", marginTop:"0.9rem", fontSize:"0.85rem", color:"var(--accent-dark)", fontWeight:600 }}>Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
