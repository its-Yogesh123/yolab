
"use client";
import React from "react";
import { BackgroundBeams } from "./background-beams";

const MainBody=()=>{
  return (
    <div
      className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1
          className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Enjoy Our Services
        </h1>
        <p></p>
        <p
          className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            Turn your ideas into reality with YOLAB’s collection of smart web utilities.
Access tools like QR code generators and URL shorteners in one unified platform.
Fast, secure, and easy to use.
Everything you need to build something great.
        </p>
        <button
          className="text-white text-2xl rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500 
          w-full relative z-10 mt-4  bg-neutral-950 py-1.5
          ">
            Get Started
          </button>
      </div>
      <BackgroundBeams />
    </div>
  );
}


export default MainBody;