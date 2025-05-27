"use client"
import Container from "../ui/container";
import Nav from "../ui/nav";

export default function SmoothLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <Container children={children}/>
  );
}
