import React from "react";

export default function Extras() {
  return (
    <>
      <style>{`
        :root{
          --ps-teal:#2f6f6b; --ps-gold:#e8b22b; --ps-border:#e5e7eb;
          --ps-muted:#6b7280; --ps-max:1180px;
        }
        .psx-section{width:100%;padding:28px 0}
        .psx-narrow{padding:18px 0}
        .psx-container{max-width:1180px;margin:0 auto;padding:0 16px}
        .psx-lead{color:var(--ps-muted);margin:0 0 18px}
        .psx-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border:none;border-radius:8px;font-weight:700;cursor:pointer}
        .psx-btn--dark{background:#111;color:#fff}
        .psx-btn--gold{background:var(--ps-gold);color:#111}
        .psx-card{background:#fff;border:1px solid var(--ps-border);border-radius:12px;overflow:hidden}
        .psx-card .body{padding:14px}
        .psx-img{display:block;width:100%;height:auto}
        .psx-iconCircle{width:96px;height:96px;border-radius:999px;background:#2b7973;color:#fff;display:grid;place-items:center;font-size:38px}
        .psx-cloud{display:flex;flex-wrap:wrap;gap:10px 18px}
        .psx-cloud a{color:#1b4d88;text-decoration:underline}

        /* Promo banner */
        .psx-promoGrid{display:grid;grid-template-columns:1.3fr .7fr;gap:22px;align-items:stretch}
        .psx-badgeFree{position:absolute;left:16px;top:16px;width:110px;height:110px;border-radius:999px;background:#e53935;color:#fff;font-weight:800;display:grid;place-items:center;text-align:center;line-height:1.1;box-shadow:0 8px 24px rgba(0,0,0,.25)}
        .psx-promoImg{position:relative}
        .psx-promoCopy{background:var(--ps-gold);display:flex}
        .psx-copyWrap{padding:24px;display:flex;flex-direction:column;gap:14px}

        /* Info tiles */
        .psx-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}

        /* CTA + Stats */
        .psx-ctaRow{display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
        .psx-stats{display:flex;justify-content:center;gap:46px;flex-wrap:wrap;text-align:center}
        .psx-stat{display:flex;flex-direction:column;align-items:center;gap:10px}
        .psx-kpi{color:#1c3734}

        /* Repair videos */
        .psx-repair{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;background:#f1f3f3;border:1px solid var(--ps-border);border-radius:12px;padding:16px}
        .psx-repairCopy{display:flex;align-items:center}

        /* Social proof + mail */
        .psx-badges{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;text-align:center}
        .psx-stars{color:#f59e0b;font-size:22px}
        .psx-small{color:#374151;font-size:14px}
        .psx-mailHero{background:var(--ps-teal);color:#fff}
        .psx-mailWrap{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;align-items:center}
        .psx-mailForm{display:flex;gap:10px;max-width:520px}
        .psx-mailForm input{flex:1;padding:12px;border-radius:8px;border:none}
        .psx-mailArt{font-size:64px;text-align:right;opacity:.9}

        /* Footer columns */
        .psx-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;border-top:1px solid var(--ps-border);padding-top:18px}
        .psx-cols h4{margin:0 0 10px}
        .psx-cols ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
        .psx-cols a{color:#1b4d88}
        .psx-socialStrip{margin-top:18px;border-top:1px solid var(--ps-border);padding-top:16px;display:flex;flex-direction:column;align-items:center;gap:10px;color:#374151}

        /* Responsive */
        @media (max-width:900px){
          .psx-promoGrid{grid-template-columns:1fr}
          .psx-tiles{grid-template-columns:1fr}
          .psx-repair{grid-template-columns:1fr}
          .psx-mailWrap{grid-template-columns:1fr}
          .psx-mailArt{text-align:center}
          .psx-cols{grid-template-columns:repeat(2,1fr)}
        }
        @media (max-width:560px){
          .psx-cols{grid-template-columns:1fr}
        }
      `}</style>

      <section className="psx-section" aria-label="Water filter promotion">
        <div className="psx-container psx-promoGrid">
          <div className="psx-card psx-promoImg">
            <img
              className="psx-img"
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1400&auto=format&fit=crop"
              alt="Refrigerator water dispenser"
            />
            <div className="psx-badgeFree">FREE<br/>SHIPPING</div>
          </div>
          <div className="psx-card psx-promoCopy">
            <div className="psx-copyWrap">
              <h2>Get <strong>FREE shipping</strong> on Water Filter replacements!</h2>
              <p className="psx-lead">
                That blinking red light can’t wait and neither should you. Get OEM filters
                delivered every 3, 6, or 12 months with no shipping charges.
              </p>
              <button className="psx-btn psx-btn--dark">Find My Filter</button>
            </div>
          </div>
        </div>
      </section>

      <section className="psx-section">
        <div className="psx-container psx-tiles">
          <div className="psx-card">
            <img className="psx-img" alt="Model number locator" src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1400&auto=format&fit=crop"/>
            <div className="body">
              <h3>Model Number Locator</h3>
              <p className="psx-lead">Find your model number quickly with our locator.</p>
            </div>
          </div>
          <div className="psx-card">
            <img className="psx-img" alt="Create account" src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1400&auto=format&fit=crop"/>
            <div className="body">
              <h3>Create an Account</h3>
              <p className="psx-lead">Manage repairs and orders in one place.</p>
            </div>
          </div>
          <div className="psx-card">
            <img className="psx-img" alt="Customer support" src="https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1400&auto=format&fit=crop"/>
            <div className="body">
              <h3>Customer Support</h3>
              <p className="psx-lead">Mon–Sat support by email or phone.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="psx-section psx-narrow">
        <div className="psx-container psx-ctaRow">
          <button className="psx-btn psx-btn--gold">Find Your Model #</button>
          <button className="psx-btn psx-btn--gold">Create Account</button>
          <button className="psx-btn psx-btn--gold">Check Order Status</button>
        </div>
      </section>
      <section className="psx-section psx-narrow">
        <div className="psx-container psx-stats">
          <div className="psx-stat">
            <div className="psx-iconCircle">❓</div>
            <div className="psx-kpi"><strong>120,000+</strong><br/>repair questions answered</div>
          </div>
          <div className="psx-stat">
            <div className="psx-iconCircle">⭐</div>
            <div className="psx-kpi"><strong>70,000+</strong><br/>verified product reviews</div>
          </div>
          <div className="psx-stat">
            <div className="psx-iconCircle">💬</div>
            <div className="psx-kpi"><strong>80,000+</strong><br/>customer install stories</div>
          </div>
        </div>
      </section>

      <section className="psx-section" aria-label="Repair videos">
        <div className="psx-container psx-repair">
          <div className="psx-card">
            <img className="psx-img" alt="Repair videos" src="https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1400&auto=format&fit=crop"/>
          </div>
          <div className="psx-card psx-repairCopy">
            <div className="body">
              <h3>Repair Videos</h3>
              <p className="psx-lead">Clear, easy-to-follow instructions from our experts.</p>
              <button className="psx-btn psx-btn--gold">View Repair Help</button>
            </div>
          </div>
        </div>
      </section>

      <section className="psx-section">
        <div className="psx-container">
          <h3>Popular Part Categories</h3>
          <p className="psx-lead">OEM appliance parts trending with customers:</p>
          <div className="psx-cloud">
            {[
              "Whirlpool Refrigerator","Frigidaire Refrigerator","GE Refrigerator","Whirlpool Dishwasher","Whirlpool Dryer","Whirlpool Washer",
              "Maytag Washer","Kenmore Dryer","GE Dishwasher","Maytag Dryer","GE Range","KitchenAid Dishwasher","Kenmore Refrigerator","GE Washer",
              "GE Dryer","Kenmore Washer","Whirlpool Range","GE Oven","Frigidaire Dishwasher","GE Microwave","Maytag Dishwasher","GE Stove",
              "LG Washer","LG Refrigerator","Whirlpool Stove","Maytag Refrigerator","KitchenAid Refrigerator","Whirlpool Refrigerator Drawers and Glides","LG Dryer"
            ].map((t,i)=> <a key={i} href="#">{t}</a>)}
          </div>
        </div>
      </section>

      <section className="psx-section psx-narrow">
        <div className="psx-container psx-badges">
          <div><div className="psx-stars">★★★★★</div><div className="psx-small">30,000+ Ratings</div></div>
          <div><div className="psx-small">Trustpilot • Verified</div></div>
          <div><div className="psx-small">sitejabber • 4.7/5</div></div>
          <div><div className="psx-small">ResellerRatings • 4.6/5</div></div>
        </div>
      </section>

      <section className="psx-section psx-mailHero" aria-label="Join our mailing list">
        <div className="psx-container psx-mailWrap">
          <div>
            <h2>Join Our Mailing List</h2>
            <p className="psx-lead" style={{color:"#eaf4f3"}}>We’ll send you expert repair help, discounts, and more!</p>
            <form className="psx-mailForm" onSubmit={(e)=>e.preventDefault()}>
              <input placeholder="Enter Email Address" />
              <button className="psx-btn psx-btn--gold">Sign Up</button>
            </form>
          </div>
          <div className="psx-mailArt" aria-hidden>✉️✉️✉️</div>
        </div>
      </section>

      <section className="psx-section psx-narrow">
        <div className="psx-container psx-cols">
          {[
            {title:"PartSelect.com",links:["Contact","About Us","Our History","Help","Privacy Policy","Terms of Use","Careers"]},
            {title:"Free Repair Help",links:["Appliance Repair","Instant Repairman","Dishwasher","Dryer","Microwave","Range / Stove / Oven","Refrigerator","Washing Machine","Find Your Model Number"]},
            {title:"PartSelect Community",links:["X","YouTube Channel","Facebook Page","LinkedIn","Blog","Just For Fun!"]},
            {title:"Why Shop PartSelect",links:["Same Day Shipping","365 Day Returns","Two Million Parts","Secure Shopping","One-Year Warranty","Your Guide to OEM Parts","Price Match Guarantee"]}
          ].map((c, i)=>(
            <div key={i}>
              <h4>{c.title}</h4>
              <ul style={{listStyle:"none", margin:0, padding:0}}>
                {c.links.map((l,idx)=><li key={idx}><a href="#" style={{color:"#1b4d88"}}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="psx-container psx-socialStrip">
          <div>📘 🔗 ✖️ ▶️</div>
          <div>Get the Fix App today • ⬛ App Store ⬛ Google Play</div>
        </div>
      </section>
    </>
  );
}
