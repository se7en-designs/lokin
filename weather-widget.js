// OpenWeather API Configuration
const API_KEY = '51a6a262ff836e855113056745aa87c7';

// User location variables
let userLatitude = null;
let userLongitude = null;
let userCity = 'Loading...';
let userCountry = '';

// Check if weather widget elements exist before updating
function updateWeatherElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Weather icon mapping (you can replace these with your own icons)
const weatherIcons = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
};

// Update current time
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    updateWeatherElement('current-time', `${hours}:${minutes}`);
}

// Format time from timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Get user's location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        console.log('Requesting user location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                console.log('Location obtained:', userLatitude, userLongitude);
                resolve({ lat: userLatitude, lon: userLongitude });
            },
            (error) => {
                console.error('Error getting location:', error);
                // Don't use fallback - let the error propagate to show sad dog
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

// Get city name from coordinates
async function getCityFromCoords(lat, lon) {
    try {
        console.log('Getting city name for coordinates:', lat, lon);
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        const data = await response.json();
        
        console.log('Geocoding response:', data);
        
        if (data && data.length > 0) {
            userCity = data[0].name;
            userCountry = data[0].country;
            console.log('Found city:', userCity, 'Country:', userCountry);
            updateWeatherElement('location', userCity);
            return true;
        } else {
            console.log('No city data found in response');
            updateWeatherElement('location', 'Unknown Location');
            return false;
        }
    } catch (error) {
        console.error('Error getting city name:', error);
        updateWeatherElement('location', 'Unknown Location');
        return false;
    }
}

// Update weather data
async function updateWeather() {
    try {
        // Use coordinates if available, otherwise use city name
        let url;
        if (userLatitude && userLongitude) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${userLatitude}&lon=${userLongitude}&appid=${API_KEY}&units=metric`;
        } else {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${userCity}&appid=${API_KEY}&units=metric`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            // Update temperature
            const temp = Math.round(data.main.temp);
            updateWeatherElement('temperature', temp);
            
            // Update weather condition
            const condition = data.weather[0].description;
            updateWeatherElement('weather-condition', condition);
            
            // Update weather icon
            const iconCode = data.weather[0].icon;
            const icon = weatherIcons[iconCode] || '🌤️';
            const weatherIconElement = document.getElementById('weather-icon');
            if (weatherIconElement) {
                weatherIconElement.innerHTML = `<span style="font-size: 24px;">${icon}</span>`;
            }
            
            // Update sunrise and sunset times
            const sunrise = formatTime(data.sys.sunrise);
            const sunset = formatTime(data.sys.sunset);
            updateWeatherElement('sunrise-time', sunrise);
            updateWeatherElement('sunset-time', sunset);
            
            console.log('Weather updated successfully for:', userCity);
            return true;
        } else {
            console.error('Error fetching weather data:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error updating weather:', error);
        return false;
    }
}

// Initialize the widget
async function initWidget() {
    // Update time immediately
    updateTime();
    
    // Show loading states with animations
    showLoadingState();
    
    try {
        // Get user's location
        const coords = await getUserLocation();
        
        // Get city name from coordinates
        const citySuccess = await getCityFromCoords(coords.lat, coords.lon);
        
        // Update weather data
        const weatherSuccess = await updateWeather();
        
        if (citySuccess && weatherSuccess) {
            // Remove loading states
            hideLoadingState();
            console.log('Widget initialized with location:', userCity);
        } else {
            // Show error state if location or weather fetch failed
            showErrorState();
        }
    } catch (error) {
        console.error('Error initializing widget:', error);
        // Show error state with sad dog
        showErrorState();
    }
    
    // Update time every minute
    setInterval(updateTime, 60000);
    
    // Update weather every 30 minutes
    setInterval(updateWeather, 1800000);
}

// Show loading state with animations
function showLoadingState() {
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const weatherCondition = document.getElementById('weather-condition');
    const location = document.getElementById('location');
    const illustrationContainer = document.getElementById('illustration-container');
    const illustrationText = document.getElementById('illustration-text');
    const weatherIllustration = document.getElementById('weather-illustration');
    
    // Hide normal weather elements
    if (weatherIcon) weatherIcon.style.display = 'none';
    if (temperature) temperature.style.display = 'none';
    if (weatherCondition) weatherCondition.style.display = 'none';
    if (location) location.style.display = 'none';
    
    // Show illustration
    if (illustrationContainer) {
        illustrationContainer.style.display = 'block';
        if (illustrationText) illustrationText.textContent = 'Finding your location...';
        if (weatherIllustration) weatherIllustration.src = 'images/dog-evil.png';
    }
}

// Hide loading state
function hideLoadingState() {
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const weatherCondition = document.getElementById('weather-condition');
    const location = document.getElementById('location');
    const illustrationContainer = document.getElementById('illustration-container');
    
    // Show normal weather elements
    if (weatherIcon) weatherIcon.style.display = 'block';
    if (temperature) {
        temperature.style.display = 'block';
        temperature.classList.remove('loading');
    }
    if (weatherCondition) weatherCondition.style.display = 'block';
    if (location) location.style.display = 'block';
    
    // Hide illustration
    if (illustrationContainer) {
        illustrationContainer.style.display = 'none';
    }
}

// Show error state with sad dog
function showErrorState() {
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const weatherCondition = document.getElementById('weather-condition');
    const location = document.getElementById('location');
    const illustrationContainer = document.getElementById('illustration-container');
    const illustrationText = document.getElementById('illustration-text');
    const weatherIllustration = document.getElementById('weather-illustration');
    
    // Hide normal weather elements
    if (weatherIcon) weatherIcon.style.display = 'none';
    if (temperature) temperature.style.display = 'none';
    if (weatherCondition) weatherCondition.style.display = 'none';
    if (location) location.style.display = 'none';
    
    // Show error illustration
    if (illustrationContainer) {
        illustrationContainer.style.display = 'block';
        if (illustrationText) illustrationText.textContent = 'Oh ho!';
        if (weatherIllustration) weatherIllustration.src = 'images/dog-sad.png';
    }
}

// Start the widget when page loads
document.addEventListener('DOMContentLoaded', initWidget); 