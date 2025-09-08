"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

// Singleton pattern for styles to prevent duplicates
let stylesInjected = false;

const injectStyles = () => {
  if (stylesInjected) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "quill-custom-styles"; // Add ID to prevent duplicates
  styleSheet.textContent = `
    .ql-toolbar.ql-snow {
      border: 1px solid rgba(0, 0, 0, 0.2) !important;
      border-bottom: none !important;
      border-radius: 20px 20px 0 0 !important;
      background-color: rgba(0, 0, 0, 0.05) !important;
      padding: 8px 12px !important;
    }
    .ql-container.ql-snow {
      border: 1px solid rgba(0, 0, 0, 0.2) !important;
      border-top: none !important;
      border-radius: 0 0 20px 20px !important;
    }
    .ql-editor {
      background-color: rgba(0, 0, 0, 0.05) !important;
      padding: 10px 12px !important;
      border-radius: 0 0 20px 20px !important;
      border-top: 1px solid rgba(0, 0, 0, 0.2) !important;
    }
  `;

  document.head.appendChild(styleSheet);
  stylesInjected = true;
};

export default function Editor({
  onChange,
  value,
}: {
  onChange: any;
  value: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<any>(null);
  const isInitializing = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSettingValue = useRef<boolean>(false); // Flag to prevent onChange during setValue

  // Memoized content change handler
  const handleTextChange = useCallback(() => {
    if (!editorRef.current || isSettingValue.current) return;
    const html = editorRef.current.querySelector(".ql-editor")?.innerHTML;
    onChange(html || "");
  }, [onChange]);

  // Optimized initialization with guards
  const initializeQuill = useCallback(async () => {
    // Multiple guards to prevent double initialization
    if (
      !editorRef.current ||
      quillInstance.current ||
      isInitializing.current ||
      isInitialized.current
    ) {
      return;
    }

    isInitializing.current = true;

    try {
      // Inject styles first
      injectStyles();

      // Dynamic import of Quill
      const { default: Quill } = await import("quill");

      // Final check before creating instance
      if (quillInstance.current || isInitialized.current) {
        return;
      }

      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Start typing...",
        modules: {
          toolbar: [
            [{ header: [2, false] }],
            ["bold", "italic", "underline"],
            ["link"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
      });

      // Attach event listener
      quillInstance.current.on("text-change", handleTextChange);

      // Set initial value if provided
      if (value && value.trim() !== "") {
        isSettingValue.current = true;
        quillInstance.current.clipboard.dangerouslyPasteHTML(value);
        isSettingValue.current = false;
      }

      isInitialized.current = true;
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to initialize Quill:", error);
    } finally {
      isInitializing.current = false;
    }
  }, [handleTextChange, value]);

  useEffect(() => {
    // Use setTimeout to ensure DOM is ready and avoid double calls
    const timeoutId = setTimeout(() => {
      initializeQuill();
    }, 0);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);

      if (quillInstance.current) {
        try {
          quillInstance.current.off("text-change", handleTextChange);
        } catch (error) {
          // Ignore cleanup errors
        }
        quillInstance.current = null;
      }

      isInitialized.current = false;
      isInitializing.current = false;
    };
  }, []); // Empty dependency array - initialize only once

  // Fixed value setting effect
  useEffect(() => {
    if (quillInstance.current && isLoaded && value !== undefined) {
      const editor = quillInstance.current;
      const currentHtml = editor.root.innerHTML;
      
      // Normalize both values for comparison (remove extra whitespace/formatting)
      const normalizeHtml = (html: string) => html.replace(/\s+/g, ' ').trim();
      const normalizedValue = normalizeHtml(value || "");
      const normalizedCurrent = normalizeHtml(currentHtml || "");

      if (normalizedValue !== normalizedCurrent) {
        isSettingValue.current = true;
        
        if (value === "" || value === null) {
          // Clear the editor content
          editor.setContents([]);
        } else {
          // Set the HTML content
          editor.clipboard.dangerouslyPasteHTML(value);
        }
        
        // Use setTimeout to reset flag after Quill processes the change
        setTimeout(() => {
          isSettingValue.current = false;
        }, 0);
      }
    }
  }, [value, isLoaded]);

  return (
    <div className="w-full font-avenir">
      <div className="h-[250px] md:h-[200px] rounded-[20px] overflow-hidden pb-20 md:pb-12">
        {!isLoaded && (
          <div className="flex items-center justify-center h-full text-black/50 bg-black/5 rounded-[20px]">
            Loading editor...
          </div>
        )}
        <div ref={editorRef} className="h-full" />
      </div>
    </div>
  );
}