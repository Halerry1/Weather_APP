import axios from "axios";

const URL = "http://api.weatherapi.com/v1/current.json";
const API_KEY = "e0d8b97eaaad4ac592e122549242406";

export const fetchWeather = async (cityName) => {
  const { data } = await axios.get(URL, {
    params: {
      q: cityName,
      key: API_KEY,
    },
  });

  return data;
};
