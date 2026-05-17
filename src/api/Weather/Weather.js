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

export const getWeatherByLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getCurrentWeather("Seoul"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(getWeatherByCoords(coords.latitude, coords.longitude)),
      () => resolve(getCurrentWeather("Seoul")),
      { timeout: 5000 },
    );
  });