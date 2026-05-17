import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const getCurrentWeather = async (city = "Seoul") => {
  const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      q: city,
      appid: API_KEY,
      units: "metric",
      lang: "ko",
    },
  });
  return response.data;
};

export const getWeatherByCoords = async (lat, lon) => {
  const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
      lang: "ko",
    },
  });
  return response.data;
};

const getKoreanCityName = async (lat, lon) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', 'accept-language': 'ko' },
      headers: { 'Accept-Language': 'ko' },
    });
    const addr = res.data.address;
    return addr.city ?? addr.town ?? addr.county ?? addr.state ?? null;
  } catch {
    return null;
  }
};

export const getWeatherByLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getCurrentWeather("Seoul"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const [weather, koreanName] = await Promise.all([
          getWeatherByCoords(lat, lon),
          getKoreanCityName(lat, lon),
        ]);
        resolve({ ...weather, name: koreanName ?? weather.name });
      },
      () => resolve(getCurrentWeather("Seoul")),
      { timeout: 5000 },
    );
  });