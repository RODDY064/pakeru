import localFont from "next/font/local";

export const avenir = localFont({
  src: [
    { path: "./Avenir-Light.otf", style: "normal", weight: "300" },
    { path: "./Avenir-Medium.otf", style: "normal", weight: "400" },
    { path: "./Avenir-Black.otf", style: "bold", weight: "700" },
  ],
  variable: "--font-avenir",
});



export const blackMango = localFont({
    src:"./black-mango-regular.ttf",
    style:'normal',
    weight:"400",
    variable:"--font-mango"
})