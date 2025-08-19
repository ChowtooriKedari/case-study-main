import React from "react";
import "./Brands.css";

const BRANDS = ["GE Appliances","Whirlpool","Frigidaire","Samsung","KitchenAid","LG"];

export default function Brands(){
  return (
    <section className="brands">
      <div className="container brands-row">
        {BRANDS.map((b,i)=>(
          <div key={i} className="brand-card">{b}</div>
        ))}
      </div>
    </section>
  );
}
