const MOUSER_API_URL = "https://api.mouser.com/api/v2";
const API_KEY = process.env.MOUSER_SECRET;

export async function searchMouserProduct(keyword: string) {
  if (!API_KEY) {
    console.warn("Mouser API key missing");
    return null;
  }

  try {
    const url = `${MOUSER_API_URL}/search/keyword?apiKey=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        SearchByKeywordRequest: {
          keyword: keyword,
          records: 10,
          startingRecord: 0,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Mouser API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.SearchResults?.Parts?.length > 0) {
      return data.SearchResults.Parts.map((part: any) => ({
        symbol: part.MouserPartNumber,
        manufacturer: part.Manufacturer,
        description: part.Description,
        category: part.Category,
        photo: part.ImagePath,
        datasheet: part.DataSheetUrl,
        url: part.ProductDetailUrl,
        price: part.PriceBreaks?.[0]?.Price
      }));
    }
    
    return null;
  } catch (error) {
    console.error("Mouser Search Error:", error);
    return null;
  }
}
