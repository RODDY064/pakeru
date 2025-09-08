import Image from 'next/image';
import React, { useEffect, useState } from 'react'


export default function ProductTags  ({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log(tags);
  }, [tags]);

  const addTag = () => {
    if (input.trim() && !tags?.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="mt-4">
      <p className="font-avenir font-[500] text-lg">Product Tags</p>

      <div className="flex items-center w-full h-12 border border-black/20 rounded-2xl p-2 mt-2 focus-within:border-black/50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter tag"
          className="w-full h-full p-2 focus:outline-none"
        />
        <div
          onClick={addTag}
          className="size-8 border flex-none rounded-full border-black/20 cursor-pointer flex items-center justify-center hover:bg-black/5"
        >
          <Image src="/icons/plus.svg" width={16} height={16} alt="plus" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-black/50">Tags</p>
        <div className="mt-2 flex gap-2 flex-wrap ">
          {tags?.map((tag, idx) => (
            <div
              key={idx}
              className="px-3 py-1 bg-black rounded-full flex items-center gap-2 text-white text-sm font-avenir cursor-pointer"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="w-3 h-3 relative flex items-center justify-center"
              >
                <div className="w-[1px] h-[12px] bg-white rotate-45 absolute"></div>
                <div className="w-[1px] h-[12px] bg-white -rotate-45 absolute"></div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};