"use client";
import React from "react";
import NavigationMenu from "./Navigation";
import Footer from "./Footer";
import MainBody from "./mainBody";
export function LandingPage() {
  return (
    <div >
      <NavigationMenu currentPage="home"/>
      <div>
        <MainBody />
      </div>
      <Footer />
    </div>
  );
}
