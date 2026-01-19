const DATA_URL = "travel_recommendation_api.json";

let data = null;

// 1) Fetch JSON on page load
async function loadData() {
  try {
    console.log("📥 Attempting to load data from:", DATA_URL);
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    data = await res.json();

    // Required by task: verify fetch works
    console.log("✅ JSON loaded successfully:", data);
    console.log("📊 Data structure:", {
      countries: data.countries?.length || 0,
      temples: data.temples?.length || 0,
      beaches: data.beaches?.length || 0
    });
    
    const statusText = document.getElementById("statusText");
    if (statusText && statusText.textContent.includes("Could not load")) {
      statusText.textContent = "Type a keyword and click Search.";
    }
    
    return data;
  } catch (err) {
    console.error("❌ Error loading JSON:", err);
    console.error("Error details:", err.message);
    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.textContent = `Could not load travel data: ${err.message}. Make sure you're running via a local server (not file://).`;
    }
    throw err;
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
      imageUrl: country.imageUrl || "", // countries now have imageUrl
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
  console.log("🎨 Rendering results:", results.length);
  const resultsDiv = document.getElementById("results");
  const statusText = document.getElementById("statusText");

  if (!resultsDiv) {
    console.error("❌ Results div not found!");
    return;
  }

  if (!statusText) {
    console.error("❌ Status text not found!");
    return;
  }

  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    statusText.textContent = "No results found. Try another keyword.";
    console.log("⚠️ No results to display");
    return;
  }

  statusText.textContent = `Found ${results.length} result(s).`;
  console.log("✅ Rendering", results.length, "cards");

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
  
  console.log("✅ Cards rendered successfully");
}

// 4) Search handler
function handleSearch() {
    console.log("🔍 Search triggered");
    const input = document.getElementById("searchInput");
    if (!input) {
      console.error("❌ Search input not found");
      return;
    }
    
    const query = input.value.trim().toLowerCase();
    console.log("📝 Search query:", query);
    const statusText = document.getElementById("statusText");
  
    if (!query) {
      if (statusText) statusText.textContent = "Please enter a valid search query.";
      renderResults([]);
      return;
    }
  
    if (!data) {
      console.warn("⚠️ Data not loaded yet, retrying...");
      if (statusText) statusText.textContent = "Data not loaded yet. Please wait...";
      // Try loading again
      loadData().then(() => {
        setTimeout(() => handleSearch(), 500);
      });
      return;
    }
  
    console.log("✅ Data available, building search list...");
    const items = buildSearchList(data);
    console.log("📦 Total items:", items.length);
  
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
      // Return only countries (not cities) to meet rubric requirement
      filteredResults = items.filter(item => item.type === "country");
  
    } else {
      // General keyword search (city names, descriptions, etc.)
      filteredResults = items.filter(item => {
        const text = `${item.name} ${item.description}`.toLowerCase();
        return text.includes(query);
      });
    }
  
    console.log("🎯 Filtered results:", filteredResults.length, filteredResults);
    renderResults(filteredResults);
    
    // Scroll to results section
    const resultsSection = document.getElementById("recommendations");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

// 5) Reset handler
function handleReset() {
  document.getElementById("searchInput").value = "";
  document.getElementById("results").innerHTML = "";
  document.getElementById("statusText").textContent = "Type a keyword and click Search.";
}

// Wire it all up
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded, initializing...");
  
  loadData().then(() => {
    console.log("✅ Data loaded successfully");
  }).catch((err) => {
    console.error("❌ Failed to load data:", err);
  });

  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");
  const searchInput = document.getElementById("searchInput");

  console.log("🔍 Elements found:", {
    searchBtn: !!searchBtn,
    resetBtn: !!resetBtn,
    searchInput: !!searchInput
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      console.log("🖱️ Search button clicked");
      e.preventDefault();
      handleSearch();
    });
  } else {
    console.error("❌ Search button not found");
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleReset);
  } else {
    console.error("❌ Reset button not found");
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        console.log("⌨️ Enter key pressed");
        e.preventDefault();
        handleSearch();
      }
    });
  } else {
    console.error("❌ Search input not found");
  }

  // Check for search query in URL (for redirects from other pages)
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");
  if (searchQuery && searchInput) {
    searchInput.value = searchQuery;
    // Wait a bit for data to load, then search
    setTimeout(() => {
      handleSearch();
    }, 1000);
  }
});
