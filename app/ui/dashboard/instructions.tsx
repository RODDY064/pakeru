import React from "react";

export default function Instructions() {
  return (
    <div className="flex-1 min-h-30 mt-4 bg-white border border-black/20 rounded-[32px] p-8">
      <div>
        <p className="font-avenir font-[500] text-lg">Product Care</p>
        <textarea
          placeholder="type the product care description here"
          className="w-full border min-h-[90px] max-h-[90px] placeholder:text-black/30 border-black/10 bg-black/5 rounded-2xl mt-2 h-11 p-4 focus:outline-none focus-within:border-black/30"
        />
      </div>
      <div className="mt-4">
        <p className="font-avenir font-[500] text-lg">Instructions</p>
        <div className="flex items-center mt-2 gap-3">
          <input
          placeholder="add instruction"
           className="h-12 bg-black/5 p-3 focus:outline-none focus:border-black/50 rounded-xl border border-black/20 w-full " />
          <div className="h-12 w-[30%] bg-black flex items-center justify-center cursor-pointer rounded-xl">
            <p className="font-avenir text-white text-md">Add</p>
          </div>
        </div>
        <div
          className={`mt-10 p-3 min-h-30 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center `}>
          <span className="text-blue-700 font-aveni">
            No instructions added
          </span>
        </div>
      </div>
    </div>
  );
}
