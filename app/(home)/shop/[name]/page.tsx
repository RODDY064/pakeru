import ProductContainer from "@/app/ui/productContainer";
import Image from "next/image";
import React, { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCategoriesServer, fetchProductsServer } from "@/libs/data-fetcher";
import { capitalize } from "@/libs/functions";

function extractTextFromHtml(html: string): string {
  if (!html) return "";

  let text = html.replace(/<[^>]*>/g, "").trim();

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name: nameID } = await params;

  const res = await fetchProductsServer();
  const catRes = await fetchCategoriesServer()
  const singleProduct = res.find((item) => item._id === nameID);
  const catData =  catRes.find((cat)=> cat._id === singleProduct?.category)
  // console.log(catRes,"new data ")
  // console.log(singleProduct, "product")

  if (!singleProduct) {
    return {
      title: "Product not found",
      description: "This product does not exist.",
      keywords: [],
    };
  }



  // Prefer SEO values, fallback to product fields
  const seoTitle = singleProduct.seo?.title || capitalize(singleProduct.name);
  const seoDescription = singleProduct.seo?.description
    ? extractTextFromHtml(singleProduct.seo.description)
    : extractTextFromHtml(singleProduct?.description as string);
  const seoKeywords = singleProduct.seo?.keywords || [];

  return {
    title: `${seoTitle} | ${capitalize(catData?.name)}`,
    description: seoDescription,
    keywords: seoKeywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: singleProduct.mainImage?.url ? [singleProduct.mainImage.url] : [],
    },
  };
}

export default async function SingleProduct({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return (
    <>
      <Suspense
        fallback={
          <div className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center">
            <Image
              src="/icons/loader.svg"
              width={34}
              height={34}
              alt="loader"
            />
          </div>
        }>
        <ProductContainer nameID={name} />
      </Suspense>
    </>
  );
}
