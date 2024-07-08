import React, { useState, useEffect, createContext, useContext } from "react";
import { fetchWeather } from "./api/fetchWeather";
import "./styles.css"; // Import your CSS file for styling

const UnitContext = createContext();

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState("C"); // 'C' for Celsius, 'F' for Fahrenheit

  useEffect(() => {
    // Load recent searches from localStorage on initial render
    const savedSearches = JSON.parse(localStorage.getItem("recentSearches"));
    if (savedSearches) {
      setRecentSearches(savedSearches);
    }
  }, []);

  const fetchData = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        const data = await fetchWeather(cityName);
        setWeatherData(data);
        setCityName("");
        setError(null);
        // Update recent searches and store in localStorage
        setRecentSearches((prevSearches) => {
          const updatedSearches = [...new Set([cityName, ...prevSearches])].slice(0, 5);
          localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
          return updatedSearches;
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <UnitContext.Provider value={{ unit, setUnit }}>
      <div className="app-container">
        <h1 className="app-title">Weather Application</h1>
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onKeyDown={fetchData}
        />
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {weatherData && <WeatherDisplay data={weatherData} />}
        <RecentSearches searches={recentSearches} onSearch={fetchData} />
        <UnitToggle />
      </div>
    </UnitContext.Provider>
  );
};

const WeatherDisplay = ({ data }) => {
  const { unit } = useContext(UnitContext);
  if (!data) return null;
  const temperature = unit === "C" ? data.current.temp_c : data.current.temp_f;
  return (
    <div className="weather-display">
      <h2 className="weather-city">
        {data.location.name}, {data.location.region}, {data.location.country}
      </h2>
      <p className="weather-temp">
        Temperature: {temperature} °{unit}
      </p>
      <p className="weather-condition">Condition: {data.current.condition.text}</p>
      <img src={data.current.condition.icon} alt={data.current.condition.text} className="weather-icon" />
      <p className="weather-info">
        Humidity: {data.current.humidity} % | Pressure: {data.current.pressure_mb} mb | Visibility: {data.current.vis_km} km
      </p>
    </div>
  );
};

const RecentSearches = ({ searches, onSearch }) => (
  <div className="recent-searches">
    <h2>Recent Searches</h2>
    <ul className="search-list">
      {searches.map((city, index) => (
        <li key={index} onClick={() => onSearch({ key: "Enter" }, city)}>
          {city}
        </li>
      ))}
    </ul>
  </div>
);

const UnitToggle = () => {
  const { unit, setUnit } = useContext(UnitContext);
  return (
    <div className="unit-toggle">
      <button className={unit === "C" ? "active" : ""} onClick={() => setUnit("C")}>
        Celsius
      </button>
      <button className={unit === "F" ? "active" : ""} onClick={() => setUnit("F")}>
        Fahrenheit
      </button>
    </div>
  );
};

export default App;

