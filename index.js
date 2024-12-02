const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL: 10 minutes
const PORT = 8000;

// Weather API Base URL
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper function to fetch weather data from the API
const fetchWeatherData = async (latitude, longitude, start, end) => {
    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                latitude,
                longitude,
                start_date: start,
                end_date: end,
                hourly: 'temperature_2m,precipitation',
            },
        });
        return response.data.hourly; // Return hourly weather data
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Failed to fetch weather data');
    }
};

// health route for checking status of our application
app.get('/health', (req, res) => {
    res.status(200).json({ message: "Application is working fine!" })
})

// API endpoint to fetch weather data
app.get('/weather', async (req, res) => {
    const { latitude, longitude, start, end } = req.query;

    // Validate query parameters
    if (!latitude || !longitude || !start || !end) {
        return res.status(400).json({ error: 'Latitude, longitude, start, and end are required' });
    }

    const cacheKey = `weather-${latitude}-${longitude}-${start}-${end}`;
    const cachedData = cache.get(cacheKey);

    // Added log when data comes from cache or from the response itself
    if (cachedData) {
        // this log proves that the response that I am returning is from cached data only, no need to call api again as the data is already being cached in the memory for fast retrieval of data.
        console.log(`Cache hit for ${cacheKey}`);
        return res.json({ latitude, longitude, start, end, data: cachedData });
    }

    // if the data is not cached then this log will appear in the terminal that the data is not being cached yet, and coming from the response.
    console.log(`Cache miss for ${cacheKey}`);

    // if data is not being cached then we need to call the api and get the data from the api response.
    try {
        const data = await fetchWeatherData(latitude, longitude, start, end);
        cache.set(cacheKey, data); // Cache the response
        res.json({ latitude, longitude, start, end, data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// running the server in port 8000
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
