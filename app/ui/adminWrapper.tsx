"use client";

import { useEffect } from "react";

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) { 
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
            <h1> Admin requires at least a tablet screen (≥768px)</h1>
          </div>`;
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return <>{children}</>;
}
