const API_KEY = "dfb87daf459dbf1de719aff024d36421"; // Your API Key

let liveLocationSet = false;  // Flag to ensure live location doesn't change after city is entered

// Function to fetch coordinates from city name
async function getCoordinates(city) {
    const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
    try {
        const response = await fetch(geoURL);
        if (!response.ok) throw new Error("City not found!");
        const data = await response.json();
        if (data.length === 0) throw new Error("City not found!");

        const { lat, lon } = data[0];
        getWeatherData(lat, lon, city);
    } catch (error) {
        console.error(error);
        updateUIError("Invalid city name.");
    }
}

// Function to fetch Air Quality & Weather data
async function getWeatherData(lat, lon, city) {
    const airURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    try {
        const [airResponse, weatherResponse] = await Promise.all([fetch(airURL), fetch(weatherURL)]);
        if (!airResponse.ok || !weatherResponse.ok) throw new Error("Failed to fetch data.");

        const airData = await airResponse.json();
        const weatherData = await weatherResponse.json();

        const aqi = airData.list[0].main.aqi; 
        const temp = weatherData.main.temp;
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        const pressure = weatherData.main.pressure;
        const uvIndex = Math.floor(Math.random() * 11); // Simulated UV Index
        const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

        updateUI(city, aqi, temp, humidity, windSpeed, pressure, uvIndex, sunrise, sunset);
    } catch (error) {
        console.error(error);
        updateUIError("Could not fetch data.");
    }
}

// Function to update UI with fetched data
function updateUI(city, aqi, temp, humidity, windSpeed, pressure, uvIndex, sunrise, sunset) {
    const { status, color } = getAQIStatus(aqi);

    document.getElementById("location").innerText = `📍 ${city}`;
    document.getElementById("aqi").innerText = aqi;
    document.getElementById("aqi-status").innerText = status;
    document.getElementById("aqi-status").style.color = color;
    document.getElementById("temperature").innerText = `🌡️ Temperature: ${temp}°C`;
    document.getElementById("humidity").innerText = `💧 Humidity: ${humidity}%`;
    document.getElementById("wind").innerText = `🌬️ Wind Speed: ${windSpeed} kph`;
    document.getElementById("pressure").innerText = `🌡️ Pressure: ${pressure} mBar`;
    document.getElementById("uv-index").innerText = `☀️ UV Index: ${uvIndex} (Approx.)`;
    document.getElementById("sunrise").innerText = `🌅 Sunrise: ${sunrise}`;
    document.getElementById("sunset").innerText = `🌇 Sunset: ${sunset}`;
}

// Function to update live location and AQI on the right side
async function updateLiveLocation(lat, lon) {
    const airURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const geoURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;

    try {
        const airResponse = await fetch(airURL);
        const geoResponse = await fetch(geoURL);
        
        const airData = await airResponse.json();
        const geoData = await geoResponse.json();

        const aqi = airData.list[0].main.aqi;
        const cityName = geoData.length > 0 ? geoData[0].name : "Unknown City";
        
        const { status, color } = getAQIStatus(aqi);

        document.getElementById("live-location").innerText = `Live Location: ${cityName} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
        document.getElementById("live-aqi").innerText = `AQI: ${aqi}`;
        document.getElementById("live-aqi-status").innerText = status;
        document.getElementById("live-aqi-status").style.color = color;
    } catch (error) {
        console.error("Error fetching live location data:", error);
    }
}

// Function to determine air quality health status
function getAQIStatus(aqi) {
    if (aqi === 1) return { status: "Good 😊", color: "green" };
    if (aqi === 2) return { status: "Fair 🙂", color: "yellow" };
    if (aqi === 3) return { status: "Moderate 😐", color: "orange" };
    if (aqi === 4) return { status: "Poor 😷", color: "red" };
    return { status: "Very Poor ☠️", color: "purple" };
}

// Function to handle errors in UI
function updateUIError(message) {
    document.getElementById("location").innerText = "⚠ Error";
    document.getElementById("aqi").innerText = "--";
    document.getElementById("aqi-status").innerText = message;
    document.getElementById("temperature").innerText = "--";
    document.getElementById("humidity").innerText = "--";
    document.getElementById("wind").innerText = "--";
    document.getElementById("pressure").innerText = "--";
    document.getElementById("uv-index").innerText = "--";
    document.getElementById("sunrise").innerText = "--";
    document.getElementById("sunset").innerText = "--";
}

// Event listener for user input
document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) getCoordinates(city);
});

// Function to get the live location
function getLiveLocation() {
    if (navigator.geolocation && !liveLocationSet) {  // Only update live location once
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            updateLiveLocation(latitude, longitude);
            liveLocationSet = true;  // Mark live location as set
        }, (error) => {
            console.error(error);
        });
    } else {
        console.log("Live location already set, won't update after city search.");
    }
}

// Call the live location function when the page loads
getLiveLocation();
