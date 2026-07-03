// Admin user guide, written in Gujarati, so a non-technical shop owner can run
// the whole panel confidently. Pure static content (no DB).
export const dynamic = "force-static";

export const metadata = { title: "માર્ગદર્શિકા (Guide)" };

export default function AdminGuidePage() {
  return (
    <div style={{ maxWidth: 820, lineHeight: 1.8 }}>
      <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", marginBottom: "0.25rem" }}>
        માર્ગદર્શિકા
      </h1>
      <p style={{ color: "#78716c", marginBottom: "1.5rem" }}>
        આ એડમિન પેનલ કેવી રીતે વાપરવું — સરળ ગુજરાતીમાં. (How to use this admin panel.)
      </p>

      <Note>
        💡 <b>સૌથી અગત્યની વાત:</b> તમે અહીં જે પણ ફેરફાર <b>Save</b> કરો છો, એ તરત જ તમારી
        લાઇવ વેબસાઇટ પર દેખાય છે. કોઈ અલગથી “publish” કરવાની જરૂર નથી.
      </Note>

      <Section n="1" title="ડેશબોર્ડ (Dashboard)">
        <p>લોગિન કર્યા પછી પહેલું પેજ. અહીં કુલ કેટલી પ્રોડક્ટ, કૅટેગરી અને કલેક્શન છે એ દેખાય છે.
          કોઈ પણ કાર્ડ પર ક્લિક કરીને એ વિભાગમાં જઈ શકો છો.</p>
      </Section>

      <Section n="2" title="પ્રોડક્ટ્સ (Products) — સૌથી વધુ વપરાતો વિભાગ">
        <ul style={ul}>
          <li>નવી પ્રોડક્ટ ઉમેરવા ઉપર <b>“+ New product”</b> દબાવો.</li>
          <li><b>Name</b> (નામ) ફરજિયાત છે. <b>Slug</b> ખાલી છોડો તો નામ પરથી આપોઆપ બની જશે.</li>
          <li style={{ color: "#b45309", fontWeight: 600 }}>
            ⚠️ કિંમત <u>પૈસા (paise)</u> માં ભરવી. ₹1 = 100 પૈસા. એટલે કે ₹279 માટે <b>27900</b> લખો, ₹1499 માટે <b>149900</b>.
          </li>
          <li><b>Category</b> પસંદ કરવી ફરજિયાત. <b>Brand</b> મરજિયાત.</li>
          <li><b>In stock</b> ની ✓ કાઢી નાખો તો પ્રોડક્ટ સાઇટ પર <b>નહીં</b> દેખાય (સ્ટોક ખતમ).</li>
          <li><b>Sizes</b> અને <b>Tags</b>: અલ્પવિરામ (comma) થી અલગ કરો — દા.ત. <code style={code}>10, 11, 12</code> અથવા <code style={code}>Best Seller, New Arrival</code>.</li>
          <li><b>Gemstones / Certifications</b>: આ થોડું ટેક્નિકલ છે — બોક્સ નીચે આપેલા ઉદાહરણ (JSON) પ્રમાણે જ ભરો, નહીંતર ખાલી છોડો.</li>
          <li>જૂની પ્રોડક્ટ બદલવા એના <b>નામ પર ક્લિક</b> કરો → ફેરફાર કરો → <b>Save</b>.</li>
          <li>કાઢી નાખવા <b>“Delete”</b> દબાવો — ખાતરી (confirm) પૂછશે.</li>
        </ul>
      </Section>

      <Section n="3" title="કૅટેગરી (Categories)">
        <ul style={ul}>
          <li>ડાબી બાજુના ફોર્મથી નવી કૅટેગરી ઉમેરો, પછી <b>“Add category”</b>.</li>
          <li><b>Parent</b> પસંદ કરો તો એ <b>સબ-કૅટેગરી</b> બને. દા.ત. “Engagement Rings” ને Parent = “Rings” આપો.</li>
          <li>જમણી બાજુ યાદીમાં દરેક કૅટેગરીમાં કેટલી પ્રોડક્ટ છે એ દેખાય.</li>
          <li>જે કૅટેગરીમાં પ્રોડક્ટ હોય એ <b>ડિલીટ થઈ શકતી નથી</b> — પહેલા એ પ્રોડક્ટ્સ બીજી કૅટેગરીમાં ખસેડો.</li>
        </ul>
      </Section>

      <Section n="4" title="કલેક્શન (Collections) — SEO પેજ">
        <ul style={ul}>
          <li>આ “Best Diamond Rings under ₹50,000” જેવા ખાસ પેજ છે જે Google માં રેન્ક થવા બને છે.</li>
          <li><b>Filter</b> (category / color / max price) નક્કી કરે છે કે એ પેજ પર કઈ પ્રોડક્ટ દેખાશે.</li>
          <li><b>Intro</b> ઓછામાં ઓછું <b>120 અક્ષર</b> નું અને પેજ પર ઓછામાં ઓછી <b>3 પ્રોડક્ટ</b> હોય તો જ
            Google માં index થાય — યાદીમાં <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ Indexed</span> દેખાશે.
            નહીંતર <span style={{ color: "#d97706", fontWeight: 600 }}>noindex</span> (પેજ ચાલુ રહેશે પણ Google માં નહીં દેખાય).</li>
        </ul>
      </Section>

      <Section n="5" title="જાહેરાત (Ads) — ચાલુ / બંધ કરવી">
        <ul style={ul}>
          <li>સૌથી ઉપર <b>“Ads enabled”</b> એ મુખ્ય સ્વિચ છે. એ <b>બંધ</b> હોય તો સાઇટ પર કોઈ જાહેરાત નહીં દેખાય.</li>
          <li>પછી દરેક જગ્યા માટે અલગ સ્વિચ છે — <b>Header</b> (ઉપર), <b>Product ઉપર/નીચે</b>, <b>Footer</b> (નીચે).</li>
          <li>Google AdSense (કે બીજી) જાહેરાતનો <b>કોડ</b> એ જગ્યાના બોક્સમાં પેસ્ટ કરો, એ સ્વિચ ✓ ચાલુ કરો, અને <b>Save</b> દબાવો.</li>
          <li>જાહેરાત ત્યારે જ દેખાશે જ્યારે — મુખ્ય સ્વિચ ✓ + એ જગ્યાની સ્વિચ ✓ + કોડ ભરેલો હોય.</li>
        </ul>
      </Section>

      <Section n="6" title="એંગેજમેન્ટ (Engagement) — advanced">
        <p>પોપઅપ, “કોઈએ હમણાં ખરીદ્યું” ટોસ્ટ, ફ્રી-શિપિંગ બાર, ઓફર વગેરે. આ થોડું આગળનું છે —
          જરૂર પડ્યે જ અડો.</p>
      </Section>

      <Section n="7" title="સુરક્ષા (Security)">
        <ul style={ul}>
          <li>કામ પૂરું થાય એટલે નીચે <b>“Sign out”</b> દબાવો.</li>
          <li>તમારો એડમિન <b>પાસવર્ડ કોઈને ના આપો</b>.</li>
        </ul>
      </Section>

      <Note>
        કોઈ પણ મૂંઝવણ થાય તો ડરવાની જરૂર નથી — ખોટું સેવ થાય તો પણ એ જ પેજ પર પાછા આવીને
        સુધારી શકાય છે. 🙂
      </Note>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: "50%", background: "#1c1917", color: "#d4af37", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>{n}</span>
        {title}
      </h2>
      <div style={{ color: "#44403c", fontSize: "0.95rem" }}>{children}</div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", color: "#78350f", fontSize: "0.95rem" }}>
      {children}
    </div>
  );
}

const ul: React.CSSProperties = { margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" };
const code: React.CSSProperties = { background: "#f5f5f4", padding: "0.1rem 0.35rem", borderRadius: 4, fontSize: "0.85em" };
