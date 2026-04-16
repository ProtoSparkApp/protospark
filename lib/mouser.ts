const MOUSER_API_URL = "https://api.mouser.com/api/v2";
const API_KEY = process.env.MOUSER_SECRET;

export async function searchMouserProduct(keyword: string, categoryHint?: string) {
  if (!API_KEY) {
    console.warn("Mouser API key missing");
    return null;
  }

  try {
    let searchString = keyword;
    if (categoryHint === "Resistor" && !searchString.toLowerCase().includes("fixed")) {
      searchString += " Fixed Resistor";
    }

    const url = `${MOUSER_API_URL}/search/keyword?apiKey=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        SearchByKeywordRequest: {
          keyword: searchString,
          records: 30,
          startingRecord: 0,
          searchOptions: "Text",
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Mouser API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.SearchResults?.Parts?.length > 0) {
      let parts = data.SearchResults.Parts.map((part: any) => ({
        symbol: part.MouserPartNumber,
        manufacturer: part.Manufacturer,
        description: part.Description,
        category: part.Category,
        photo: part.ImagePath,
        datasheet: part.DataSheetUrl,
        url: part.ProductDetailUrl,
        price: part.PriceBreaks?.[0]?.Price
      }));

      if (categoryHint === "Resistor") {
        const filtered = parts.filter((p: any) =>
          p.category?.toLowerCase().includes("fixed resistor") ||
          (p.category?.toLowerCase().includes("resistor") &&
            !p.category?.toLowerCase().includes("potentiometer") &&
            !p.category?.toLowerCase().includes("variable") &&
            !p.description?.toLowerCase().includes("trimmer"))
        );
        if (filtered.length > 0) parts = filtered;
      }

      const finalParts = parts.filter((p: any) =>
        p.manufacturer?.toLowerCase() !== 'unknown' &&
        p.symbol?.toLowerCase() !== 'unknown'
      );

      return finalParts.length > 0 ? finalParts : parts;
    }

    return null;
  } catch (error) {
    console.error("Mouser Search Error:", error);
    return null;
  }
}
