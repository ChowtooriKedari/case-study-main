import React from "react";
import "./theme.css";
import Header from "./components/Header";
import HeroSearch from "./components/HeroSearch";
import Categories from "./components/Categories";
import Brands from "./components/Brands";
import Footer from "./components/Footer";
import FloatingChat from "./components/FloatingChat";
import Extras from "./components/Extras";
export default function App(){
  return (
    <>
      <Header />
      <HeroSearch />
      <Categories />
      <Brands />
      <Extras />
      <Footer />
      <FloatingChat />
    </>
  );
}
