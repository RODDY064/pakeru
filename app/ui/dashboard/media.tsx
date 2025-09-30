import React, { useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { ProductImage, ProductColor } from "./zodSchema";


const MIN_IMAGES = 3;
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];


const ImgDiv = React.memo<{
  image: ProductImage;
  onRemove: (id: string) => void;
}>(({ image, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove(image._id);
  }, [image._id, onRemove]);

  return (
    <div className="w-[220px] md:w-[200px] h-[300px] bg-white flex-shrink-0 lg:w-[25%] md:h-full relative border border-black/20 rounded-[20px] inline-block overflow-hidden">
      <div
        className="absolute top-[6px] right-[6px] z-20 size-6 border border-black/20 rounded-full flex items-center justify-center cursor-pointer"
        onClick={handleRemove}
      >
        <div className="w-[60%] h-[1px] bg-black rotate-45 absolute"></div>
        <div className="w-[60%] h-[1px] bg-black rotate-[-45deg]"></div>
      </div>
      <Image
        src={typeof image?.url === "string" ? image.url : "/images/image-fallback.png"}
        fill
        alt={image.name}
        className="object-cover transition-transform duration-200"
      />
    </div>
  );
});

ImgDiv.displayName = "ImgDiv";

// Memoized ColorButton component
const ColorButton = React.memo<{
  color: ProductColor;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}>(({ color, isActive, onSelect, onRemove }) => {
  const handleSelect = useCallback(() => {
    onSelect(color._id);
  }, [color._id, onSelect]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(color._id);
  }, [color._id, onRemove]);

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`flex justify-between gap-2 px-1 sm:px-3 cursor-pointer py-0.5 sm:py-1 rounded-[24px] ${
        isActive
          ? "bg-black/20 border border-black/20"
          : "bg-black/2 border border-black/10"
      }`}
    >
      <div className="flex items-center gap-1">
        <div
          style={{ backgroundColor: color.hex }}
          className="size-4.5 border border-black/30 rounded-full"
        />
        <p className="font-avenir uppercase pt-1 sm:pt-[0.4px] text-[11px] sm:text-sm">
          {color.name}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 mt-[2px]">
          <span className="text-[10px] opacity-60">
            {color.images.length}/{MAX_IMAGES}
          </span>
          {color.images.length >= MIN_IMAGES && (
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          )}
        </div>
        <div
          onClick={handleRemove}
          className="relative z-20 size-5 border border-black/20 rounded-full flex items-center justify-center cursor-pointer"
        >
          <div className="w-[60%] h-[1px] bg-red-500 rotate-45 absolute"></div>
          <div className="w-[60%] h-[1px] bg-red-500 rotate-[-45deg]"></div>
        </div>
      </div>
    </button>
  );
});

ColorButton.displayName = "ColorButton";

const Media = React.memo(({
  variants,
  setVariants,
  activeColorId,
  setActiveColorId,
}: {
  variants: ProductColor[];
  setVariants: React.Dispatch<React.SetStateAction<ProductColor[]>>;
  activeColorId: string | null;
  submitError?: string;
  setActiveColorId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [newColor, setNewColor] = useState({
    name: "",
    color: "#000000",
    hex: "#000000",
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Memoized computed values
  const activeColor = useMemo(
    () => variants.find((variant) => variant._id === activeColorId),
    [variants, activeColorId]
  );

  const canAddImages = useMemo(
    () => activeColor && activeColor.images.length < MAX_IMAGES,
    [activeColor]
  );

  const needsMoreImages = useMemo(
    () => activeColor && activeColor.images.length < MIN_IMAGES,
    [activeColor]
  );

  // Memoized callbacks to prevent recreation on every render
  const handleColorChange = useCallback((colorValue: string) => {
    setNewColor((prev) => ({
      ...prev,
      color: colorValue,
      hex: colorValue
    }));
  }, []);

  const handleHexChange = useCallback((hexValue: string) => {
    const cleanHex = hexValue.toUpperCase();
    if (/^[0-9A-F]{0,6}$/i.test(cleanHex)) {
      const fullHex = `#${cleanHex.padEnd(6, "0")}`;
      setNewColor((prev) => ({
        ...prev,
        color: cleanHex.length === 6 ? fullHex : prev.color,
        hex: cleanHex,
      }));
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only PNG and JPEG files are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 10MB`;
    }
    return null;
  }, []);

  const addColor = useCallback(() => {
    if (!newColor.name.trim()) {
      setUploadError("Color name is required");
      return;
    }

    if (variants.some((variant) => variant.name.toLowerCase() === newColor.name.toLowerCase())) {
      setUploadError("Color name already exists");
      return;
    }

    const newId = String(Date.now());
    setVariants((prev) => [
      ...prev,
      {
        _id: newId,
        name: newColor.name.trim(),
        color: newColor.color,
        hex: newColor.hex,
        images: [],
        stock: 0,
        sizes: [],
        isActive: false,
      },
    ]);

    setActiveColorId(newId);
    setNewColor({ name: "", color: "#000000", hex: "#000000" });
    setShowColorPopup(false);
    setUploadError("");
  }, [newColor, variants, setVariants, setActiveColorId]);

  const removeColor = useCallback((id: string) => {
    if (variants.length <= 1) {
      setUploadError("Must have at least one color");
      return;
    }

    setVariants((prev) => {
      const filtered = prev.filter((variant) => variant._id !== id);
      if (activeColorId === id && filtered.length > 0) {
        setActiveColorId(filtered[0]._id);
      } else if (filtered.length === 0) {
        setActiveColorId(null);
      }
      return filtered;
    });
    setUploadError("");
  }, [variants.length, activeColorId, setVariants, setActiveColorId]);

  const selectColor = useCallback((id: string) => {
    setActiveColorId(id);
    setUploadError("");
  }, [setActiveColorId]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (!activeColor) {
      setUploadError("Please select a color first");
      return;
    }

    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - activeColor.images.length;

    if (fileArray.length > remainingSlots) {
      setUploadError(`Can only add ${remainingSlots} more image(s) to this color`);
      return;
    }

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join(". "));
      return;
    }

    // Process valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: ProductImage = {
            _id: String(Date.now() + Math.random()),
            url: e.target.result,
            name: file.name,
            file: file,
          };

          setVariants((prev) =>
            prev.map((color) =>
              color._id === activeColorId
                ? { ...color, images: [...color.images, newImage] }
                : color
            )
          );
        }
      };
      reader.readAsDataURL(file);
    });

    setUploadError("");
  }, [activeColor, activeColorId, validateFile, setVariants]);

  const removeImage = useCallback((imageId: string) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant._id === activeColorId
          ? {
              ...variant,
              images: variant.images.filter((img) => img._id !== imageId),
            }
          : variant
      )
    );
  }, [activeColorId, setVariants]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const triggerFileSelect = useCallback(() => {
    if (!activeColor) {
      setUploadError("Please add and select a color first");
      return;
    }
    fileInputRef.current?.click();
  }, [activeColor]);

  const toggleColorPopup = useCallback(() => {
    setShowColorPopup((prev) => !prev);
  }, []);

  const closeColorPopup = useCallback(() => {
    setShowColorPopup(false);
  }, []);

  const handleNewColorNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor((prev) => ({ ...prev, name: e.target.value }));
  }, []);

  // Color popup form component - memoized to prevent re-renders
  const ColorPopupForm = useMemo(() => (
    <div className="absolute w-[180px] h-fit pb-4 bg-white shadow-2xl border border-black/20 rounded-2xl bottom-6 right-4 p-3 z-50">
      <p className="font-avenir text-lg">Color name</p>
      <input
        value={newColor.name}
        onChange={handleNewColorNameChange}
        placeholder="Enter color name"
        className="w-full border placeholder:text-black/30 text-sm border-black/10 bg-black/5 rounded-lg mt-2 h-8 p-2 focus:outline-none focus-within:border-black/30"
      />
      <input
        type="color"
        value={newColor.color}
        onChange={(e) => handleColorChange(e.target.value)}
        className="w-full mt-2 h-10"
      />
      <div className="flex justify-end mt-2">
        <div className="flex items-center justify-end gap-2">
          <p className="text-xs">HEX</p>
          <input
            value={newColor.hex}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="000000"
            className="w-[60%] border placeholder:text-black/30 text-sm border-black/10 h-8 p-2 focus:outline-none focus-within:border-black/30"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4 w-full font-avenir">
        <button
          type="button"
          onClick={closeColorPopup}
          className="w-full px-3 py-0.5 text-sm border border-black/20 rounded-md hover:bg-black/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={addColor}
          className="w-full px-3 py-0.5 text-sm bg-black text-white rounded-md hover:bg-black/80 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  ), [newColor, handleColorChange, handleHexChange, handleNewColorNameChange, addColor, closeColorPopup]);

  return (
    <>
      {/* Mobile color selector */}
      <div className="mb-3 mt-6 w-full p-2 md:hidden">
        <div className="w-full mini-h-24 bg-white border border-black/20 rounded-2xl p-2 flex flex-col items-end">
          <div className="relative">
            <div
              onClick={toggleColorPopup}
              className="size-8 bg-black rounded-full items-center justify-center cursor-pointer flex"
            >
              <Image src="/icons/plus-w.svg" width={18} height={18} alt="plus" />
            </div>
            {showColorPopup && ColorPopupForm}
          </div>
          <div className="w-full">
            {variants.length === 0 && (
              <p className="w-full text-center text-md p-2 text-black/70 font-avenir">
                Click the plus to add color
              </p>
            )}

            <div className="w-[80%] mx-2 grid grid-cols-2 gap-2 pb-2">
              {variants.map((variant) => (
                <ColorButton
                  key={variant._id}
                  color={variant}
                  isActive={activeColorId === variant._id}
                  onSelect={selectColor}
                  onRemove={removeColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main media upload area */}
      <div className="w-full min-h-[390px] md:h-[420px] bg-white border border-black/20 rounded-[35px] inline-block self-start p-2 md:mt-6 cursor-pointer">
        <div className="w-full h-full flex-1 bg-black/5 border border-dashed border-black/20 rounded-3xl p-2 relative">
          <div className="flex justify-between items-center">
            {/* Desktop color selector */}
            <div className="items-center gap-3 sm:flex hidden">
              {variants.map((variant) => (
                <ColorButton
                  key={variant._id}
                  color={variant}
                  isActive={activeColorId === variant._id}
                  onSelect={selectColor}
                  onRemove={removeColor}
                />
              ))}
            </div>
            
            <div className="items-center gap-2 relative hidden sm:flex">
              <p className="font-avenir font-[500] text-sm sm:text-sm">Add Color</p>
              <div
                onClick={toggleColorPopup}
                className="size-8 bg-black rounded-full items-center justify-center cursor-pointer flex"
              >
                <Image src="/icons/plus-w.svg" width={18} height={18} alt="plus" />
              </div>
              {showColorPopup && ColorPopupForm}
            </div>
          </div>

          {/* Upload error display */}
          {uploadError && (
            <div className="flex items-center justify-center">
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-full px-6">
                <p className="text-red-700 text-sm font-avenir">{uploadError}</p>
              </div>
            </div>
          )}

          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileSelect}
            className="w-full min-h-[300px] md:h-[300px] flex items-center flex-col justify-center gap-2 relative overflow-hidden"
          >
            {!activeColor ? (
              <div className="text-center">
                <p className="text-xl font-avenir text-black/50">
                  Add a color first to start
                  <br />
                  uploading images
                </p>
              </div>
            ) : activeColor.images.length === 0 ? (
              <div className="text-center cursor-pointer">
                <p className="text-xl font-avenir text-black/50">
                  Click to select or drag
                  <br />
                  and drop product images
                </p>
                <p className="text-xs font-avenir text-black/30 mt-2">
                  MAX SIZE 10MB (PNG, JPEG) • {MIN_IMAGES}-{MAX_IMAGES} images per color
                </p>
                {needsMoreImages && (
                  <p className="text-sm font-avenir text-orange-600 mt-2">
                    Need {MIN_IMAGES - activeColor.images.length} more image(s) minimum
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-full p-2 grid-cols-1 grid md:flex gap-2 overflow-x-auto scrollbar-hide">
                {activeColor.images.map((image) => (
                  <ImgDiv key={image._id} image={image} onRemove={removeImage} />
                ))}
                {canAddImages && (
                  <div
                    className="w-[220px] h-[300px] md:w-[200px] flex-shrink-0 lg:min-w-[25%] md:h-full border-2 border-dashed border-black/30 rounded-[20px] flex items-center justify-center cursor-pointer hover:border-black/50 hover:bg-black/5 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileSelect();
                    }}>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Image
                          src="/icons/plus-w.svg"
                          width={20}
                          height={20}
                          alt="Add"
                          className="invert opacity-60"
                        />
                      </div>
                      <p className="text-sm text-black/60">Add Image</p>
                      <p className="text-xs text-black/40">
                        {MAX_IMAGES - activeColor.images.length} remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeColor && activeColor.images.length > 0 && (
            <div className="absolute bottom-5 w-full justify-center hidden sm:flex">
              <div className="flex items-center gap-6">
                <Image
                  src="/icons/arrow.svg"
                  width={14}
                  height={14}
                  alt="Previous"
                  className="rotate-90 cursor-pointer hover:opacity-60 transition-opacity"
                />
                <div className="flex items-center gap-2">
                  {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-6 h-2 rounded-full transition-all duration-200 ${
                        index < activeColor.images.length
                          ? index < MIN_IMAGES
                            ? "bg-green-500"
                            : "bg-black/60"
                          : "bg-black/20"
                      }`}
                    />
                  ))}
                </div>
                <Image
                  src="/icons/arrow.svg"
                  width={14}
                  height={14}
                  alt="Next"
                  className="rotate-[-90deg] cursor-pointer hover:opacity-60 transition-opacity"
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
});

Media.displayName = "Media";

export default Media;