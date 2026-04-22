/**
 * HOTEL PLANNER - BROWSER SEEDING SCRIPT
 * ------------------------------------
 */

(async () => {
  const SEED_COUNT = 5000;
  const DATA_URL = "https://raw.githubusercontent.com/Azure-Samples/azure-search-sample-data/main/hotels/HotelsData_toAzureBlobs.json";
  const CHUNK_SIZE = 100; // Sending 100 at a time to avoid timeouts

  console.log("%c🚀 Starting Browser Seeding...", "color: #4f46e5; font-weight: bold; font-size: 1.2rem;");

  try {
    console.log("📡 Fetching data from Azure...");
    const response = await fetch(DATA_URL);
    const sourceHotels = await response.json();
    console.log(`✅ Loaded ${sourceHotels.length} source hotels.`);

    let savedCount = 0;
    let index = 0;
    let batch = [];

    while (savedCount < SEED_COUNT) {
      const template = sourceHotels[index % sourceHotels.length];
      index++;

      // Validation
      const hasName = !!template.HotelName;
      const hasAddress = template.Address && template.Address.StreetAddress && template.Address.City && template.Address.Country;
      const hasPrice = template.Rooms && template.Rooms.length > 0 && typeof template.Rooms[0].BaseRate === 'number';

      if (!hasName || !hasAddress || !hasPrice) continue;

      // Map to Model
      batch.push({
        name: savedCount < sourceHotels.length ? template.HotelName : `${template.HotelName} (${savedCount})`,
        address: `${template.Address.StreetAddress}, ${template.Address.City}, ${template.Address.StateProvince}, ${template.Address.Country}`,
        stars: template.Rating || 3,
        apiReviewCount: 100,
        price: template.Rooms[0].BaseRate,
        amenities: template.Tags || [],
        description: template.Description || "No description available.",
        userRatingAverage: 0,
        userReviewCount: 0
      });

      savedCount++;

      // If batch is full or we reached the target, send it
      if (batch.length === CHUNK_SIZE || savedCount === SEED_COUNT) {
        console.log(`📤 Sending batch: ${savedCount - batch.length + 1} to ${savedCount}...`);
        
        const res = await fetch('/api/admin/seed-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            hotels: batch, 
            clearExisting: (savedCount === batch.length) // Clear only on first batch
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(`Seeding failed: ${err.error || res.statusText}`);
        }

        console.log(`%c✅ Batch Saved. Total: ${savedCount}/${SEED_COUNT}`, "color: #10b981;");
        batch = [];
        
        // Brief pause to avoid rate limits
        await new Promise(r => setTimeout(r, 200));
      }
    }

    console.log("%c🎉 SUCCESS: Seeding Complete!", "color: #4f46e5; font-weight: bold; font-size: 1.5rem;");

  } catch (error) {
    console.error("%c❌ Seeding Failed:", "color: #ef4444; font-weight: bold;", error);
    console.log("%cTIP: Make sure you are logged in as an ADMIN before running this script.", "color: #fbbf24;");
  }
})();
