import Link from "next/link";
import { getTopCategories, getCollections, getInStockProducts, reviews } from "@/data/store";
import { ProductCard } from "@/components/ProductCard";
import { SmartImage } from "@/components/SmartImage";
import { Icon } from "@/components/Icon";

export default function HomePage() {
  const categories = getTopCategories();
  const collections = getCollections(3);
  const featured = getInStockProducts().slice(0, 4);
  const gifting = getInStockProducts().filter((p) => p.priceInPaise <= 20000).slice(0, 4);
  const homeReviews = reviews.slice(0, 3);

  const catImages: Record<string, string> = {
    "rings":       "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80&fit=crop&auto=format",
    "necklaces":   "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80&fit=crop&auto=format",
    "earrings":    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80&fit=crop&auto=format",
    "bracelets":   "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80&fit=crop&auto=format",
    "bangles":     "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80&fit=crop&auto=format",
    "pendants":    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80&fit=crop&auto=format",
    "mangalsutra": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80&fit=crop&auto=format",
    "gifts":       "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80&fit=crop&auto=format",
  };

  return (
    <div className="animate-fade-up">
      {/* ── 1. Cinematic Hero (Full Viewport) ── */}
      <section className="hero-section" style={{
        position:"relative", height:"85vh", minHeight:"600px", width:"100vw",
        marginLeft:"calc(-50vw + 50%)", marginRight:"calc(-50vw + 50%)", 
        marginBottom:"var(--space-10)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"#fff", overflow:"hidden"
      }}>
        {/* Background Image */}
        <div style={{ position:"absolute", inset:0, zIndex:-2 }}>
          <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=2000&q=85&fit=crop&auto=format" alt="Bridal Jewellery Edit" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        </div>
        
        {/* Cinematic Gradient Overlay */}
        <div style={{ position:"absolute", inset:0, zIndex:-1, background:"linear-gradient(to top, rgba(28,25,23,0.8) 0%, rgba(28,25,23,0.3) 50%, rgba(28,25,23,0.1) 100%)" }} />

        <div className="container" style={{ position:"relative", zIndex:1, width:"100%", textAlign:"center", paddingBottom:"2rem" }}>
          <span className="eyebrow" style={{ color:"var(--gold-soft)", marginBottom:"var(--space-4)" }} data-reveal>The 2026 Bridal Edit</span>
          <h1 className="t-display" style={{ marginBottom:"var(--space-5)" }} data-reveal>
            Jewellery made<br />to be inherited.
          </h1>
          <p className="t-lead" style={{ color:"#fff", opacity:0.9, maxWidth:560, margin:"0 auto var(--space-6) auto" }} data-reveal>
            18K solid gold, platinum, and brilliant hand-set stones. Crafted to look far beyond their price.
          </p>
          <div style={{ display:"flex", justifyContent:"center" }} data-reveal>
            <Link href="/c/best-diamond-engagement-rings" className="btn-primary" style={{ minWidth:"240px", padding:"1.25rem 2.5rem" }}>
              Explore The Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Brand Pillars (Trust) ── */}
      <section className="container" style={{ marginBottom:"var(--space-10)" }} data-reveal>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:"2rem", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"3rem 0" }}>
          {[
            ["shield-check","BIS Hallmarked","Certified quality you can trust."],
            ["tag","Transparent Pricing","No hidden making charges."],
            ["exchange","Lifetime Exchange","Because true value never fades."],
            ["lock","Insured Shipping","Safe delivery across India."]
          ].map(([icon, title, desc])=>(
            <div key={title} style={{ textAlign:"center" }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:48, height:48, borderRadius:"50%", background:"var(--surface-2)", color:"var(--accent-dark)", marginBottom:"1rem" }}>
                <Icon name={icon} size={20} />
              </div>
              <h3 className="font-display" style={{ fontSize:"1.2rem", fontWeight:500, marginBottom:"0.5rem" }}>{title}</h3>
              <p style={{ fontSize:"0.85rem", color:"var(--fg-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Shop by Category ── */}
      <section className="container" style={{ marginBottom:"var(--space-12)" }} data-reveal>
        <div className="section-head" style={{ textAlign:"center" }}>
          <span className="eyebrow">Explore</span>
          <h2 className="t-h2">Shop by Category</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1.5rem" }}>
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} href={`/${c.slug}`} style={{ textDecoration:"none", color:"inherit" }}>
              <div className="card" style={{ position:"relative", aspectRatio:"4/5", overflow:"hidden" }}>
                {catImages[c.slug] && (
                  <img src={catImages[c.slug]} alt={c.name} className="product-img" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                )}
                {/* Gradient for legibility */}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)" }} />
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1.5rem", color:"#fff" }}>
                  <h3 className="font-display" style={{ fontSize:"1.4rem", fontWeight:500, letterSpacing:"0.02em" }}>{c.name}</h3>
                  <span style={{ fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, color:"var(--gold-soft)", marginTop:"0.25rem", display:"inline-block" }}>Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Featured Collection (Asymmetric Editorial Grid) ── */}
      <section style={{ backgroundColor:"var(--surface)", marginLeft:"calc(-50vw + 50%)", marginRight:"calc(-50vw + 50%)", padding:"var(--space-10) 0" }}>
        <div className="container" data-reveal>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"var(--space-8)" }}>
            <div>
              <span className="eyebrow">The Signature Selection</span>
              <h2 className="t-h2">Modern Heirlooms</h2>
            </div>
            <Link href="/rings" className="btn-outline">Shop All</Link>
          </div>
          
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── 5. The Aurelia Gift Edit ── */}
      {gifting.length > 0 && (
        <section className="container" style={{ margin:"var(--space-12) auto" }} data-reveal>
          <div style={{ textAlign:"center", marginBottom:"var(--space-8)" }}>
            <span className="eyebrow">Gifts to remember</span>
            <h2 className="t-h2">The Gift Edit</h2>
            <p style={{ color:"var(--fg-muted)", marginTop:"0.75rem" }}>Curated pieces under ₹20,000</p>
          </div>
          <div className="product-grid">
            {gifting.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign:"center", marginTop:"var(--space-6)" }}>
            <Link href="/gifts" className="btn-outline">View All Gifts</Link>
          </div>
        </section>
      )}

      {/* ── 6. Testimonials / Social Proof ── */}
      <section className="container" style={{ marginBottom:"var(--space-12)" }} data-reveal>
        <div style={{ textAlign:"center", marginBottom:"var(--space-8)" }}>
          <span className="eyebrow">Real Stories</span>
          <h2 className="t-h2">Loved by thousands</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"2rem" }}>
          {homeReviews.map(r => (
            <div key={r.id} style={{ background:"var(--surface-2)", padding:"2.5rem 2rem", border:"1px solid var(--border)", textAlign:"center" }}>
              <div style={{ color:"var(--accent-dark)", fontSize:"1.2rem", marginBottom:"1rem", letterSpacing:"2px" }}>
                {"★".repeat(r.rating)}
              </div>
              <p className="font-display" style={{ fontSize:"1.2rem", lineHeight:1.6, marginBottom:"1.5rem", fontStyle:"italic" }}>
                "{r.body}"
              </p>
              <p style={{ fontSize:"0.8rem", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600 }}>— {r.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Newsletter ── */}
      <section style={{ backgroundColor:"var(--primary)", color:"#fff", marginLeft:"calc(-50vw + 50%)", marginRight:"calc(-50vw + 50%)", padding:"var(--space-10) 0", textAlign:"center" }} data-reveal>
        <div className="container" style={{ maxWidth:600 }}>
          <h2 className="font-display" style={{ fontSize:"2.4rem", fontWeight:400, marginBottom:"1rem" }}>Join the Circle</h2>
          <p style={{ color:"rgba(255,255,255,0.7)", marginBottom:"2rem", lineHeight:1.7 }}>
            Subscribe to our newsletter for early access to new collections, private sales, and insider styling tips. Plus, receive 10% off your first order.
          </p>
          <form style={{ display:"flex", gap:"0.5rem" }}>
            <input type="email" placeholder="Email Address" required style={{ flex:1, padding:"1rem 1.5rem", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", outline:"none" }} />
            <button type="button" className="btn-accent" style={{ background:"var(--accent)", color:"var(--primary)", borderColor:"var(--accent)" }}>Subscribe</button>
          </form>
        </div>
      </section>

      {/* Mobile/Tablet Overrides specifically for this page */}
      <style>{`
        .hero-section {
          margin-top: calc(-1.5rem - 80px) !important;
          padding-top: 80px !important;
        }
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .hero-section {
            margin-top: calc(-1.5rem - 64px) !important;
            padding-top: 64px !important;
          }
          h1.t-display { font-size: clamp(2.8rem, 10vw, 4rem) !important; }
        }
      `}</style>
    </div>
  );
}
