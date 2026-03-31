import axios from "axios";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const getCurrentWeather = async (city = "Seoul") => {
  const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      q: city,
      appid: API_KEY,
      units: "metric", // 섭씨
      lang: "ko",      // 한국어 설명
    },
  });

  return response.data;
};