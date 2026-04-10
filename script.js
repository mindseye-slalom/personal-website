document.addEventListener('DOMContentLoaded', function () {
    // Rotating text animation
    const rotatingWords = [
        'systems thinker',
        'visual thinker',
        'sketching advocate',
        'workshop facilitator',
        'trail runner',
        'bread baker'
    ];

    let currentWordIndex = 0;
    const rotatingElement = document.querySelector('.rotating-text');

    function rotateText() {
        if (!rotatingElement) return;

        rotatingElement.style.opacity = '0';

        setTimeout(() => {
            currentWordIndex = (currentWordIndex + 1) % rotatingWords.length;
            rotatingElement.textContent = rotatingWords[currentWordIndex];
            rotatingElement.style.opacity = '1';
        }, 300);
    }

    // Start rotation
    if (rotatingElement) {
        setInterval(rotateText, 10000);
    }

    // Navigation active state
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        let currentSection = '';
        let closestSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const distance = sectionTop - window.scrollY;

            // Find section that is in or near the viewport (but not too far above)
            if (distance < window.innerHeight / 2 && distance > -window.innerHeight) {
                if (Math.abs(distance) < closestDistance) {
                    closestDistance = Math.abs(distance);
                    closestSection = section.getAttribute('id');
                }
            }
        });

        // Fallback to first section that's above current scroll
        if (!closestSection) {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    currentSection = section.getAttribute('id');
                }
            });
        } else {
            currentSection = closestSection;
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Update active state after scroll completes
            setTimeout(updateActiveLink, 100);
        });
    });

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();

    // Weather Widget
    const weatherWidget = document.querySelector('.weather-widget');
    const weatherLoading = document.querySelector('.weather-loading');
    const weatherData = document.querySelector('.weather-data');
    const weatherError = document.querySelector('.weather-error');
    const weatherLocation = document.querySelector('.weather-location');
    const weatherTemp = document.querySelector('.weather-temp');
    const weatherCondition = document.querySelector('.weather-condition');

    async function fetchWeather(latitude, longitude, locationOverride = null) {
        try {
            // Show loading state
            weatherLoading.style.display = 'flex';
            weatherData.style.display = 'none';
            weatherError.style.display = 'none';

            // Fetch weather data from Open-Meteo API
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m&temperature_unit=fahrenheit`
            );

            if (!response.ok) {
                throw new Error('Weather API error');
            }

            const data = await response.json();
            const current = data.current;

            // Map WMO weather codes to descriptions and icons
            const weatherMap = {
                0: { description: 'Clear', icon: '☀️' },
                1: { description: 'Mostly Clear', icon: '🌤️' },
                2: { description: 'Partly Cloudy', icon: '⛅' },
                3: { description: 'Overcast', icon: '☁️' },
                45: { description: 'Foggy', icon: '🌫️' },
                48: { description: 'Foggy', icon: '🌫️' },
                51: { description: 'Light Drizzle', icon: '🌧️' },
                53: { description: 'Moderate Drizzle', icon: '🌧️' },
                55: { description: 'Heavy Drizzle', icon: '🌧️' },
                61: { description: 'Light Rain', icon: '🌧️' },
                63: { description: 'Moderate Rain', icon: '🌧️' },
                65: { description: 'Heavy Rain', icon: '⛈️' },
                71: { description: 'Light Snow', icon: '❄️' },
                73: { description: 'Moderate Snow', icon: '❄️' },
                75: { description: 'Heavy Snow', icon: '❄️' },
                80: { description: 'Light Showers', icon: '🌦️' },
                81: { description: 'Moderate Showers', icon: '🌧️' },
                82: { description: 'Heavy Showers', icon: '⛈️' },
                85: { description: 'Light Snow Showers', icon: '🌨️' },
                86: { description: 'Heavy Snow Showers', icon: '🌨️' },
                95: { description: 'Thunderstorm', icon: '⛈️' },
                96: { description: 'Thunderstorm with Hail', icon: '⛈️' },
                99: { description: 'Thunderstorm', icon: '⛈️' }
            };

            const weatherInfo = weatherMap[current.weather_code] || { description: 'Unknown', icon: '🌡️' };
            const condition = weatherInfo.description;
            const icon = weatherInfo.icon;
            const temp = Math.round(current.temperature_2m);
            const feelsLike = Math.round(current.apparent_temperature);
            const humidity = Math.round(current.relative_humidity_2m);

            // Fetch location name using reverse geocoding or use override
            let locationName = locationOverride;
            if (!locationName) {
                const geoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );

                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    locationName = geoData.address?.city || geoData.address?.town || geoData.address?.county || 'Your Location';
                } else {
                    locationName = 'Your Location';
                }
            }
            weatherLocation.textContent = locationName;

            // Update display
            document.querySelector('.weather-icon').textContent = icon;
            weatherTemp.textContent = `${temp}°F`;
            document.querySelector('.weather-feels-like').textContent = `Feels like ${feelsLike}°F`;
            document.querySelector('.weather-humidity').textContent = `${humidity}% humidity`;
            weatherCondition.textContent = condition;
            weatherLoading.style.display = 'none';
            weatherData.style.display = 'flex';
            weatherError.style.display = 'none';
        } catch (error) {
            console.error('Weather fetch error:', error);
            weatherLoading.style.display = 'none';
            weatherData.style.display = 'none';
            weatherError.style.display = 'flex';
        }
    }

    function getWeather() {
        console.log('Weather widget: Initializing...');

        if (!navigator.geolocation) {
            console.error('Geolocation not supported, using IP fallback');
            getWeatherByIP();
            return;
        }

        console.log('Weather widget: Requesting geolocation...');

        // Add a timeout - if geolocation takes more than 5 seconds, use IP fallback
        const geoTimeout = setTimeout(() => {
            console.error('Geolocation timeout - using IP-based fallback');
            getWeatherByIP();
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(geoTimeout);
                console.log('Weather widget: Geolocation granted', position.coords);
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            (error) => {
                clearTimeout(geoTimeout);
                console.error('Geolocation error code:', error.code);
                console.error('Geolocation error message:', error.message);
                // Fallback to IP-based geolocation on any error
                getWeatherByIP();
            },
            { timeout: 4000, enableHighAccuracy: false } // 4 second timeout, don't need high accuracy
        );
    }

    async function getWeatherByIP() {
        console.log('Weather widget: Using IP-based geolocation fallback...');
        try {
            // Try ip-api.com first
            const response = await fetch('https://ip-api.com/json/?fields=lat,lon,city');
            if (response.ok) {
                const data = await response.json();
                console.log('Weather widget: IP geolocation result from ip-api:', data);
                if (data.lat && data.lon && data.city) {
                    fetchWeather(data.lat, data.lon, data.city);
                    return;
                }
            }

            // Fallback to ipify.org for more accurate geo data
            const geoResponse = await fetch('https://geo.ipify.org/api/v2/country,city?apiKey=at_i8gW0H4BZm7pqHdJmN8jJXjN4GxDX');
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                console.log('Weather widget: ipify geolocation result:', geoData);
                if (geoData.location && geoData.city) {
                    fetchWeather(geoData.location.lat, geoData.location.lng, geoData.city);
                    return;
                }
            }

            throw new Error('IP geolocation services unavailable');
        } catch (error) {
            console.error('IP geolocation error:', error);
            // Ultimate fallback: use Roseville, CA coordinates
            console.log('Weather widget: Using fallback location (Roseville, CA)');
            fetchWeather(38.7521, -121.2723, 'Roseville');
        }
    }

    // Initialize weather widget
    weatherLoading.style.display = 'flex';
    getWeather();
});
