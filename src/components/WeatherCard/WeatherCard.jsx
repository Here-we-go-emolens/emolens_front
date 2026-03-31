import { useEffect, useState } from "react";
import { getCurrentWeather } from "@/api/Weather/Weather";

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getCurrentWeather("Seoul");
        setWeather(data);
      } catch (err) {
        console.error(err);
        setError("날씨 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <div>날씨 불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "12px" }}>
      <h2>{weather.name} 현재 날씨</h2>
      <p>온도: {weather.main.temp}°C</p>
      <p>체감온도: {weather.main.feels_like}°C</p>
      <p>날씨: {weather.weather[0].description}</p>
      <p>습도: {weather.main.humidity}%</p>
      <p>풍속: {weather.wind.speed} m/s</p>
    </div>
  );
}