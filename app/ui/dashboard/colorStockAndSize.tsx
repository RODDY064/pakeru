
import { ProductColor } from '@/app/(dashboard)/admin/store-products/product-actions/action';
import Image from 'next/image';
import React, { useState } from 'react'


export default function ColorStockAndSizes ({
  colors,
  setColors,
  activeColorId,
}: {
  colors: ProductColor[];
  setColors: React.Dispatch<React.SetStateAction<ProductColor[]>>;
  activeColorId: string;
})  {
  const [selectedSize, setSelectedSize] = useState("");
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const activeColor = colors.find((c) => c._id === activeColorId);

  if (!activeColor) return null;

  const updateColorStock = (stock: string) => {
    const stockNumber = parseInt(stock) || 0;
    setColors((prev) =>
      prev.map((color) =>
        color._id === activeColorId ? { ...color, stock: stockNumber } : color
      )
    );
  };

  const addSizeToColor = () => {
    if (selectedSize && !activeColor.sizes.includes(selectedSize)) {
      setColors((prev) =>
        prev.map((color) =>
          color._id === activeColorId
            ? { ...color, sizes: [...color.sizes, selectedSize] }
            : color
        )
      );
      setSelectedSize("");
    }
  };

  const removeSizeFromColor = (sizeToRemove: string) => {
    setColors((prev) =>
      prev.map((color) =>
        color._id === activeColorId
          ? {
              ...color,
              sizes: color.sizes.filter((size) => size !== sizeToRemove),
            }
          : color
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Color Info Display */}

      {/* Stock Management */}
      <div>
        <p className="font-avenir font-[500] text-lg mb-2">Stock Quantity</p>
        <input
          type="number"
          value={activeColor.stock}
          onChange={(e) => updateColorStock(e.target.value)}
          placeholder="0"
          min="0"
          className="focus:outline-none w-full h-12 border border-black/20 rounded-2xl p-3 focus-within:border-black/50"
        />
      </div>

      {/* Size Management */}
      <div>
        <p className="font-avenir font-[500] text-lg mb-2">Available Sizes</p>

        {/* Add Size */}
        <div className="flex items-center w-full h-12 border border-black/20 rounded-2xl p-2 mb-3 focus-within:border-black/50">
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full appearance-none focus:outline-none px-2">
            <option value="">Select size to add</option>
            {availableSizes
              .filter((size) => !activeColor.sizes.includes(size))
              .map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
          </select>
          <button
            onClick={addSizeToColor}
            disabled={!selectedSize}
            className="size-8 border flex-none rounded-full border-black/20 cursor-pointer flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image src="/icons/plus.svg" width={16} height={16} alt="plus" />
          </button>
        </div>

        {/* Current Sizes */}
        <div>
          <p className="text-black/50 text-sm mb-2">Current Sizes</p>
          {activeColor.sizes.length === 0 ? (
            <p className="text-black/40 text-center py-4">No sizes added yet</p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {activeColor.sizes.map((size, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-black/5 border border-black/20 rounded-lg flex items-center gap-2 text-sm font-avenir cursor-pointer"
                >
                  <span>{size}</span>
                  <div
                    onClick={() => removeSizeFromColor(size)}
                    className="w-3 h-3 relative flex items-center justify-center"
                  >
                    <div className="w-[1px] h-[12px] bg-black rotate-45 absolute"></div>
                    <div className="w-[1px] h-[12px] bg-black -rotate-45 absolute"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div
          className={`mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-200 `}
        >
          <div className="flex justify-between text-sm">
            <span className="text-blue-700 font-aveni">Total Stock:</span>
            <span className="font-medium text-blue-800 font-aveni">
              {activeColor.stock} units
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-blue-700 font-aveni">Available Sizes:</span>
            <span className="font-medium text-blue-800 font-avenir">
              {activeColor.sizes.length > 0
                ? activeColor.sizes.join(", ")
                : "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};