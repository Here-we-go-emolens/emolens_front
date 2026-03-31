import { useEffect, useState } from "react";
import { getCurrentWeather } from "@/api/Weather/Weather";
import {
  WiDaySunny, WiDayCloudy, WiCloud, WiCloudy,
  WiRain, WiShowers, WiThunderstorm, WiSnow, WiFog,
} from "react-icons/wi";

function getWeatherIcon(id, size) {
  if (id >= 200 && id < 300) return <WiThunderstorm size={size} color="#7c6fcd" />;
  if (id >= 300 && id < 400) return <WiShowers size={size} color="#7c6fcd" />;
  if (id >= 500 && id < 600) return <WiRain size={size} color="#7c6fcd" />;
  if (id >= 600 && id < 700) return <WiSnow size={size} color="#7c6fcd" />;
  if (id >= 700 && id < 800) return <WiFog size={size} color="#9088a8" />;
  if (id === 800) return <WiDaySunny size={size} color="#f5a623" />;
  if (id === 801) return <WiDayCloudy size={size} color="#7c6fcd" />;
  if (id === 802) return <WiCloud size={size} color="#9088a8" />;
  return <WiCloudy size={size} color="#9088a8" />;
}

export default function WeatherCard({ size = 44 }) {
  const [weatherId, setWeatherId] = useState(null);

  useEffect(() => {
    getCurrentWeather("Seoul")
      .then(data => setWeatherId(data.weather[0].id))
      .catch(console.error);
  }, []);

  if (!weatherId) return null;
  return <>{getWeatherIcon(weatherId, size)}</>;
}
