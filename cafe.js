// ===============================
//  API CONFIG
// ===============================
const apiKey = "AIzaSyDBn0cmohok7vTZfJsCecPAdBsAVikVDx8";
const useProxy = true;
const proxyUrl = "https://cors-anywhere.herokuapp.com/";


// ===============================
//  GET LOCATION
// ===============================
function getLocation() {
    const cache = JSON.parse(localStorage.getItem("cachedLocation") || "{}");
    const now = Date.now();

    if (cache.timestamp && now - cache.timestamp < 10 * 60 * 1000) {
        useLocation(cache.lat, cache.lng);
    } else {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                localStorage.setItem(
                    "cachedLocation",
                    JSON.stringify({ lat, lng, timestamp: now })
                );

                useLocation(lat, lng);
            },
            () => alert("Location access denied or unavailable.")
        );
    }
}


// ===============================
//  FETCH CAFES (5km radius)
// ===============================
async function useLocation(lat, lng) {
    const endpoint =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=cafe&key=${apiKey}`;

    const url = useProxy ? proxyUrl + endpoint : endpoint;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("Places status:", data.status);
        console.log("Cafes found:", data.results?.length);

        if (!data.results || data.results.length === 0) {
            alert("No cafes found.");
            return;
        }

        displayCards(data.results);
    } catch (e) {
        console.error("Error fetching Places API:", e);
        alert("Error fetching cafes.");
    }
}


// ===============================
//  DISPLAY MULTIPLE CARDS (LIST)
// ===============================
function displayCards(cafes) {
    const container = document.querySelector(".cards");
    container.innerHTML = "";

    cafes.forEach(cafe => {
        const card = document.createElement("div");
        card.className = "location-card";

        // Photo (NOT proxied)
        let imgUrl = "https://via.placeholder.com/400x250?text=No+Image";
        if (cafe.photos?.[0]?.photo_reference) {
            imgUrl =
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400` +
                `&photoreference=${cafe.photos[0].photo_reference}` +
                `&key=${apiKey}`;
        }

        const cafeData = {
            name: cafe.name,
            place_id: cafe.place_id,
            photo: imgUrl,
            rating: cafe.rating || "N/A",
        };

        card.innerHTML = `
            <img src="${imgUrl}" alt="${cafe.name}">
            <div class="card-content">
                <div class="card-row">
                    <h3>${cafe.name}</h3>
                    <p>⭐ ${cafe.rating || "N/A"}</p>
                </div>
                <button class="save-btn">Save 💖</button>
            </div>
        `;

        // Save button
        card.querySelector(".save-btn").addEventListener("click", () => {
            saveCafe(JSON.stringify(cafeData));
        });

        container.appendChild(card);
    });
}


// ===============================
//  SAVE CAFE
// ===============================
function saveCafe(cafeJSON) {
    const cafe = JSON.parse(cafeJSON);
    let saved = JSON.parse(localStorage.getItem("savedCafes") || "[]");

    if (!saved.some(item => item.place_id === cafe.place_id)) {
        saved.push(cafe);
        localStorage.setItem("savedCafes", JSON.stringify(saved));
        alert(`${cafe.name} saved! 💖`);
    } else {
        alert(`${cafe.name} is already saved.`);
    }
}


// ===============================
//  SHOW SAVED CAFES
// ===============================
function showSaved() {
    const container = document.querySelector(".cards");
    container.innerHTML = "";

    const saved = JSON.parse(localStorage.getItem("savedCafes") || "[]");

    if (saved.length === 0) {
        container.innerHTML = "<p>No saved cafes yet 😢</p>";
        return;
    }

    saved.forEach(cafe => {
        const card = document.createElement("div");
        card.className = "location-card";

        card.innerHTML = `
            <img src="${cafe.photo}" alt="${cafe.name}">
            <div class="card-content">
                <div class="card-row">
                    <h3>${cafe.name}</h3>
                    <p>⭐ ${cafe.rating}</p>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
