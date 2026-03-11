import axios from "axios";

const BASE = "https://api.openweathermap.org/data/2.5";
// const key = process.env.WEATHER_KEY;
const key = "dd036165d2fcc36586779bf2cbf994d3";

export const fetchCurrentWeather = async(lat, lon) => {
    const {data} = await axios.get(`${BASE}/weather`, {
        params:{
            lat,
            lon,
            appid:key,
            units: "metric"
        },
        timeout: 8000
    });
    return {
        city: data.name,
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        windDeg: data.wind.deg,
        rain1h: data.rain?.["1h"] ?? 0,
        clouds: data.clouds.all,
        visibility: data.visibility
    };
};

export const fetchForecast = async(lat,lon) => {
    const {data} = await axios.get(`${BASE}/forecast`, {
        params: {
            lat,
            lon,
            appid: key,
            units: "metric"
        },
        timeout: 8000,
    });
    const daily = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if(!daily[date]) {
            daily[date] ={
                date,
                temps: [],
                humidity: [],
                rain: 0,
                description: [],
            };
        };
        daily[date].temps.push(item.main.temp);
        daily[date].humidity.push(item.main.humidity);
        daily[date].rain += item.rain?.["3h"] ?? 0;
        daily[date].description.push(item.weather[0].description);
    });
    return Object.values(daily).map(d => ({
        date: d.date,
        tempMin: Math.min(...d.temps).toFixed(1),
        tempMax: Math.max(...d.temps).toFixed(1),
        tempAvg: (d.temps.reduce((a, b) => a+b,0) / d.temps.length).toFixed(1),
        humidityAvg: (d.humidity.reduce((a,b) => a + b,0)/d.humidity.length).toFixed(1),
        totalRain: d.rain.toFixed(1),
        condition: mostFrequent(d.description)
    }));
};

export const getWeatherSummary = async(lat , lon) => {
    const [current, forecast] = await Promise.all([fetchCurrentWeather(lat,lon), fetchForecast(lat,lon)]);
    return {current, forecast};
};

const mostFrequent = (arr) => {
  const freq = {};
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
};