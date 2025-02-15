if (module.hot) {
  module.hot.accept();
}

const mapContainer = document.getElementById("map");
const ipAddress = document.querySelector(".ipAddress");
const locationEl = document.querySelector(".location");
const timezone = document.querySelector(".timezone");
const isp = document.querySelector(".isp");
const input = document.querySelector("input");
const send = document.querySelector(".send");

const ipAddressContainer = document.querySelector(".ip--container");
const locationContainer = document.querySelector(".location--container");
const timezoneContainer = document.querySelector(".timezone--container");
const ispContainer = document.querySelector(".isp--container");
const container = document.querySelector(".displayed--information--container");
let paragraph = document.querySelector(".errormsg");

let popup = "Your current location📌";
let lat;
let lng;

const validIpTest = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const validDomainTest = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

const executeCode = () => {
  // remove the container hidden classes
  ipAddressContainer.classList.add("hidden");
  locationContainer.classList.add("hidden");
  timezoneContainer.classList.add("hidden");
  ispContainer.classList.add("hidden");
  paragraph.classList.add("hidden");
  container.classList.remove("h-[100px]");

  const value = input.value;
  if (!value) return;

  if (validIpTest.test(value)) {
    fetchData(value, "");
  } else if (validDomainTest.test(value)) {
    fetchData("", value);
  } else {
    input.style.border = "1px solid red";
    let value = input.value;
    input.value = "Please enter a valid ip address or domain name";
    input.style.color = "red";

    setTimeout(() => {
      input.style.border = "none";
      input.value = value;
      input.style.color = "black";
    }, 3000);
    return;
  }
};

send.addEventListener("click", executeCode);
document.addEventListener("keydown", e => {
  if (e.key === "Enter") executeCode();
});

const type = new Typed(".auto-type", {
  strings: ["please wait...", "hang tight!", "almost there..."],
  typeSpeed: 100,
  backSpeed: 100,
  loop: true,
});

const fetchData = async (value, domain) => {
  try {
    document.querySelector(".loading-element").classList.remove("hidden");

    const baseURL = "https://geo.ipify.org/api/v2/country,city";
    const apiKey = "at_tJ66XQzhcu490QC72T4T9hFmh1IrV"; // Secure this key in backend
    const queryParams = value ? `&ipAddress=${value}` : domain ? `&domain=${domain}` : "";
    const res = await fetch(`${baseURL}?apiKey=${apiKey}${queryParams}`);

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("API Response:", data); // Debugging

    if (!data.location || typeof data.location.lat !== "number" || typeof data.location.lng !== "number") {
      console.error("Invalid location data", data);
      paragraph.textContent = "Location data not available. Please check the input.";
      paragraph.classList.remove("hidden");
      return;
    }

    ipAddressContainer.classList.remove("hidden");
    locationContainer.classList.remove("hidden");
    timezoneContainer.classList.remove("hidden");
    ispContainer.classList.remove("hidden");

    ipAddress.textContent = data.ip;
    locationEl.textContent = `${data.location.city}, ${data.location.country}`;
    timezone.textContent = `UTC${data.location.timezone}`;
    isp.textContent = data.isp;

    popup = `${data.location.city}, ${data.location.country} 📌`;
    lat = data.location.lat;
    lng = data.location.lng;

    mapFunction(lat, lng);
  } catch (err) {
    console.error("Something went wrong:", err.message);
    paragraph.textContent = err.message;
    paragraph.classList.remove("hidden");
  } finally {
    document.querySelector(".loading-element").classList.add("hidden");
  }
};


let map = null;
let mapInitialized = false;

let marker;
const mapFunction = (lat, lng) => {
  if (mapInitialized ? null : (mapInitialized = true)) {
    map = L.map(mapContainer).setView([lat, lng], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapInitialized = true;
  } else {
    map.setView([lat, lng], 15);
  }

  if (marker) map.removeLayer(marker);
  marker = L.marker([lat, lng]).addTo(map).bindPopup(popup).openPopup();
};


navigator.geolocation.getCurrentPosition(
  position => {
    let { latitude, longitude } = position.coords;
    mapFunction(latitude, longitude);
    mapInitialized ? null : (mapInitialized = true);
  },
  error => {
    console.log("something went wrong", error);
  }
);
