import React from "react";
import "./HeroSearch.css";

export default function HeroSearch(){
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-left">
          <h1>Find Your Part</h1>
          <form className="hero-search" onSubmit={(e)=>e.preventDefault()}>
            <input placeholder="Search model # or part #"/>
            <button>SEARCH</button>
          </form>
          <a href="#" className="model-help">🧭 Need help finding your model number?</a>
        </div>

        <div className="hero-right">
          <ul>
            <li>Genuine OEM parts guaranteed to fit</li>
            <li>Free manuals and guides</li>
            <li>Repair instructions and videos</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
