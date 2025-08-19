import React from "react";
import "./Header.css";

export default function Header(){
  return (
    <header className="ps-header">
      <div className="ps-utility">
        <div className="container row util-left">
          <div className="brand">
            <span className="house" aria-hidden>🏠</span>
            <strong>PartSelect</strong>
            <span className="since">Here to help since 1999</span>
          </div>
          <div className="util-right">
            <a href="#">1-866-319-8402</a>
            <span className="muted">Mon-Sat • 8am-8pm EST</span>
            <a href="#" className="util-link">Order Status</a>
            <a href="#" className="util-link">Your Account ▾</a>
            <a href="#" className="util-link cart">🛒</a>
          </div>
        </div>
      </div>

      <nav className="ps-nav">
        <div className="container row nav-row">
          <div className="menu row">
            <a className="menu-link" href="#">Find by Brand ▾</a>
            <a className="menu-link" href="#">Find by Product ▾</a>
            <a className="menu-link" href="#">Find by Symptom ▾</a>
            <a className="menu-link" href="#">Contact</a>
            <a className="menu-link" href="#">Blog</a>
            <a className="menu-link" href="#">Repair Help</a>
            <a className="menu-link" href="#">Water Filters</a>
          </div>
          <form className="global-search" onSubmit={(e)=>e.preventDefault()}>
            <input placeholder="Search model or part number" />
            <button aria-label="Search">🔍</button>
          </form>
        </div>
    
        <div className="assurance-bar">
          <div className="container row assure">
            <div className="badge"><span>💲</span>Price Match Guarantee</div>
            <div className="badge"><span>🚚</span>Same-day Shipping</div>
            <div className="badge"><span>🏷️</span>All Original Manufacturer Parts</div>
            <div className="badge"><span>🛡️</span>1 Year Warranty</div>
          </div>
        </div>
      </nav>
    </header>
  );
}
