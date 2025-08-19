import React from "react";
import "./Categories.css";

const CATS = [
  { key:"dishwasher", label:"Dishwasher", icon:"🧼" },
  { key:"dryer", label:"Dryer", icon:"🌀" },
  { key:"stove", label:"Stove", icon:"🍳" },
  { key:"refrigerator", label:"Refrigerator", icon:"🧊" },
  { key:"washer", label:"Washer", icon:"🧺" },
];

export default function Categories(){
  return (
    <section className="container cats">
      <h3>Genuine OEM parts</h3>
      <p className="muted">The leading online retailer of appliance parts and lawn equipment parts. We have over 2 million repair parts and carry all major brands.</p>
      <div className="cat-grid">
        {CATS.map(c=>(
          <a key={c.key} className="cat" href="#">
            <div className="ico">{c.icon}</div>
            <div className="lbl">{c.label}</div>
          </a>
        ))}
        <a className="view-all" href="#">View All Products ▸</a>
      </div>
    </section>
  );
}
