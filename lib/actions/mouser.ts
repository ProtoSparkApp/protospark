"use server";

import { searchMouserProduct } from "@/lib/mouser";

export async function lookupMouserProduct(symbol: string, category?: string) {
  try {
    const products = await searchMouserProduct(symbol, category);
    if (!products || products.length === 0) return { error: "Product not found in Mouser catalog" };
    
    return { 
      success: true, 
      products: products.map((p: any) => ({
        name: p.symbol,
        description: p.description,
        category: p.category,
        producer: p.manufacturer,
        photo: p.photo,
        datasheet: p.datasheet,
        url: p.url,
        price: p.price
      }))
    };
  } catch (error) {
    return { error: "Failed to connect to Mouser API" };
  }
}
