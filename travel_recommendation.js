const DATA_URL = "travel_recommendation_api.json";

let data = null;

// 1) Fetch JSON on page load
async function loadData() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    data = await res.json();

    // Required by task: verify fetch works
    console.log("✅ JSON loaded:", data);
  } catch (err) {
    console.error("❌ Error loading JSON:", err);
    const statusText = document.getElementById("statusText");
    if (statusText) statusText.textContent = "Could not load travel data. Check console.";
  }
}

// 2) Convert your JSON into one searchable list (cities + temples + beaches + countries)
function buildSearchList(json) {
  const items = [];

  // Countries + Cities
  for (const country of json.countries || []) {
    // allow searching by country name too
    items.push({
      type: "country",
      name: country.name,
      imageUrl: "", // countries don't have imageUrl in your JSON
      description: `Explore top destinations in ${country.name}.`,
    });

    for (const city of country.cities || []) {
      items.push({
        type: "city",
        name: city.name,
        imageUrl: city.imageUrl,
        description: city.description,
      });
    }
  }

  // Temples
  for (const temple of json.temples || []) {
    items.push({
      type: "temple",
      name: temple.name,
      imageUrl: temple.imageUrl,
      description: temple.description,
    });
  }

  // Beaches
  for (const beach of json.beaches || []) {
    items.push({
      type: "beach",
      name: beach.name,
      imageUrl: beach.imageUrl,
      description: beach.description,
    });
  }

  return items;
}

// 3) Render cards
function renderResults(results) {
  const resultsDiv = document.getElementById("results");
  const statusText = document.getElementById("statusText");

  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    statusText.textContent = "No results found. Try another keyword.";
    return;
  }

  statusText.textContent = `Found ${results.length} result(s).`;

  for (const item of results) {
    const card = document.createElement("div");
    card.className = "card";

    // If no imageUrl (like country), show placeholder
    const imgHtml = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${item.name}">`
      : `<div style="height:160px; display:flex; align-items:center; justify-content:center; background:#eef2f7;">
           <span style="font-size:12px; color:#555;">No image</span>
         </div>`;

    card.innerHTML = `
      ${imgHtml}
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p style="margin-top:8px; font-size:12px; opacity:0.7;">Type: ${item.type}</p>
      </div>
    `;

    resultsDiv.appendChild(card);
  }
}

// 4) Search handler
function handleSearch() {
    const input = document.getElementById("searchInput");
    const query = input.value.trim().toLowerCase();
    const statusText = document.getElementById("statusText");
  
    if (!query) {
      statusText.textContent = "Please enter a valid search query.";
      renderResults([]);
      return;
    }
  
    if (!data) {
      statusText.textContent = "Data not loaded yet.";
      return;
    }
  
    const items = buildSearchList(data);
  
    let filteredResults = [];
  
    // ===== KEYWORD LOGIC (Task 7) =====
    if (query === "beach" || query === "beaches") {
      filteredResults = items.filter(item => item.type === "beach");
  
    } else if (query === "temple" || query === "temples") {
      filteredResults = items.filter(item => item.type === "temple");
  
    } else if (
      query === "country" ||
      query === "countries"
    ) {
      filteredResults = items.filter(
        item => item.type === "country" || item.type === "city"
      );
  
    } else {
      // General keyword search (city names, descriptions, etc.)
      filteredResults = items.filter(item => {
        const text = `${item.name} ${item.description}`.toLowerCase();
        return text.includes(query);
      });
    }
  
    renderResults(filteredResults);
  }

// 5) Reset handler
function handleReset() {
  document.getElementById("searchInput").value = "";
  document.getElementById("results").innerHTML = "";
  document.getElementById("statusText").textContent = "Type a keyword and click Search.";
}

// Wire it all up
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("resetBtn").addEventListener("click", handleReset);

  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
});
