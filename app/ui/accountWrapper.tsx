"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AccountContext, useAccount } from "../(home)/account/account-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBoundStore } from "@/store/store";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "motion/react";
import { capitalize } from "@/libs/functions";

gsap.registerPlugin(ScrollTrigger);

// Separate component that uses useSearchParams
function AccountContent({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState([
    {
      name: "profile",
      label: "MY PROFILE",
      isActive: true,
    },
    {
      name: "orders",
      label: "MY ORDERS",
      isActive: false,
    },
  ]);
  const router = useRouter();
  const pathname = usePathname();
  const { modal, isSearching, modalDisplay, routeChange  } = useBoundStore();
  const navRef = useRef<HTMLDivElement>(null);
  const [navZ, setNavZ] = useState("z-50");
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePage = (pageName: string) => {
    // if not on /account, navigate there
    if (pathname !== "/account") {
      router.push("/account");
    }

    // update active tab
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        isActive: page.name === pageName,
      }))
    );
  };

  useEffect(() => {
    const page = searchParams.get("userPage");

    if (page) {
      handlePage(page);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("userPage");
      router.replace(`?${newParams.toString()}`);
    }
  }, [searchParams, pathname]);

  
  useGSAP(() => {
    if (!navRef.current) return;

    // Hide nav when scrolling down past 50px
    gsap.to(navRef.current, {
      y: -40,
      ease: "power2.out",
      scrollTrigger: {
        trigger: document.body,
        start: "50 top",
        end: "51 top",
        scrub: 0.5,
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname]);

  // Refresh ScrollTrigger when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);


  // Refresh ScrollTrigger when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;


    if (modal || isSearching || routeChange ) {
      setNavZ("z-10");
    } else {
      timer = setTimeout(() => {
        setNavZ("z-50");
      }, 50);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [modal, isSearching, routeChange]);

  return (
    <AccountContext.Provider value={{ pages, handlePage }}>
      <div
        ref={navRef}
        style={{ transform: "translateY(40)" }}
        className={`w-full h-12 md:h-20 px-4 md:px-8 fixed border-t border-b border-black/10 flex ${session?.user.role !== "admin" ? "justify-between " : "justify-end"
        } account-nav  bg-white ${navZ}`}>
        {session?.user.role !== "admin" && (
          <>
            {isMobile ? (
              <>
                <div className="h-full flex  items-center relative md:border-x border-black/10 cursor-pointer ">
                  <p className="font-avenir font-[500] text-sm  md:px-6">
                    {pages[0].isActive && "MY PROFILE"}
                    {pages[1].isActive && "MY ORDERS"}
                  </p>
                </div>
              </>
            ) : (
              <div
                onClick={() => handlePage("profile")}
                className="h-full flex  items-center relative md:border-x border-black/10 cursor-pointer "
              >
                <p className="font-avenir font-[500] text-sm  md:px-6">
                  MY PROFILE
                </p>
                {pages[0].isActive && (
                  <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>
                )}
              </div>
            )}
          </>
        )}
        <div className="flex items-center h-full ">
          <div className="md:flex hidden h-full  ">
            {session?.user.role !== "admin" && (
              <>
                <div
                  onClick={() => handlePage("orders")}
                  className="h-full flex  items-center relative border-x border-black/10 cursor-pointer"
                >
                  <p className="font-avenir font-[500] text-sm px-6">
                    MY ORDER
                  </p>
                  {pages[1].isActive && (
                    <div className="w-full absolute bottom-0 h-[10px] md:bg-black/10"></div>
                  )}
                </div>
              </>
            )}
            <div className="h-full flex px-10 items-center relative border-r border-black/10">
              <div
                onClick={async () => await signOut()}
                className="py-2 px-8 bg-black text-white rounded cursor-pointer"
              >
                Sign out
              </div>
            </div>
          </div>
        </div>
      </div>
      {session?.user.role === "admin" ? (
        <div className="mt-4 min-h-[400px] flex flex-col justify-center">
          <Link href="/admin/orders/unfulfilled">
            <div className="px-6 py-4 bg-black font-avenir text-white cursor-pointer rounded-md">
              GO TO ADMIN DASHBOARD
            </div>
          </Link>
        </div>
      ) : (
        children
      )}
    </AccountContext.Provider>
  );
}

export default function AccountWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center">
          <Image
            src="/icons/loader.svg"
            width={32}
            height={32}
            alt="loading icon"
          />
        </div>
      }>
      <AccountContent>{children}</AccountContent>
    </Suspense>
  );
}
