"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button 
        type="button"
        onClick={() => setOpen(true)} 
        style={{ 
          background: "none", border: "none", padding: 0,
          color: "var(--fg-muted)", fontSize: "0.85rem", textDecoration: "underline",
          cursor: "pointer", transition: "color 0.2s"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; }}
      >
        Size Guide
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem"
        }}>
          {/* Backdrop */}
          <div 
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} 
            onClick={() => setOpen(false)}
          />
          
          {/* Modal */}
          <div className="animate-fade-up" style={{
            position: "relative", width: "100%", maxWidth: 600,
            background: "var(--bg)", borderRadius: "0", border: "1px solid var(--border)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)" }}>
              <h2 className="t-h2" style={{ fontSize: "1.5rem", fontWeight: 400 }}>Ring Size Guide</h2>
              <button 
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "var(--fg)" }}
              >
                <Icon name="x" size={24} />
              </button>
            </div>
            
            <div style={{ padding: "2rem", maxHeight: "70vh", overflowY: "auto" }}>
              <p style={{ color: "var(--fg-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
                Find your perfect fit. If you are between sizes, we recommend ordering a half size up.
              </p>
              
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-strong)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>Indian Size</th>
                    <th style={{ padding: "0.75rem 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>US Size</th>
                    <th style={{ padding: "0.75rem 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>Diameter (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [10, 5, 15.7],
                    [12, 6, 16.5],
                    [14, 7, 17.3],
                    [16, 8, 18.1],
                    [18, 9, 18.9],
                    [20, 10, 19.8],
                  ].map(([ind, us, mm], i) => (
                    <tr key={ind} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "var(--surface)" : "transparent" }}>
                      <td style={{ padding: "1rem 0", fontWeight: 500 }}>{ind}</td>
                      <td style={{ padding: "1rem 0", color: "var(--fg-muted)" }}>{us}</td>
                      <td style={{ padding: "1rem 0", color: "var(--fg-muted)" }}>{mm} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>How to measure</h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  1. Wrap a piece of string or paper around the base of your finger.<br/>
                  2. Mark the point where the ends meet with a pen.<br/>
                  3. Measure the string or paper with a ruler in millimeters to get the circumference.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
