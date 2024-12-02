//env file
PORT=8000
WEATHER_API_URL = https://api.open-meteo.com/v1/forecast



//sample query foro fetching weather data

latitude=35.6895
longitude=139.6917
start=2024-12-01
end=2024-12-02

// Also I have logged that when the data is being provided from cached data or from the api response.

// I have made on helper function for api call only which takes the query parameter and request the api using axios.