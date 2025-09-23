import React from "react";
import Navbar from "../ui/dashboard/navbar";
import SideMenu from "../ui/dashboard/side-menu";
import AdminWrapper from "../ui/adminWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminWrapper>
      <div className="bg-[#f2f2f2] min-h-screen m-0 overflow-hidden">
        <Navbar />
        <SideMenu />
        {children}
      </div>
      ;
    </AdminWrapper>
  );
}
