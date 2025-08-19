import React from "react";
import "./Footer.css";

export default function Footer(){
  return (
    <footer className="ps-footer">
      <div className="container row foot">
        <div className="copy">© {new Date().getFullYear()} PartSelect (Demo)</div>
        <div className="links row">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
