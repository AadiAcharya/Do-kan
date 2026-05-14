import React from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import BiggestSale from "../components/BiggestSale";
import FlashSale from "../components/FlashSale";
import Categories from "../components/Categories";
import GrabDealByBrands from "../components/GrabDealByBrands";
import FlashDealsGadgets from "../components/FlashDealsGadgets";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div className="bg-gray-50">
      <Header />
      <Banner />
      <BiggestSale />
      <FlashSale />
      <Categories />
      <GrabDealByBrands />
      <FlashDealsGadgets />
      <Footer />
    </div>
  );
}

export default HomePage;
