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

    async function fetchWeather(latitude, longitude) {
        try {
            // Show loading state
            weatherLoading.style.display = 'flex';
            weatherData.style.display = 'none';
            weatherError.style.display = 'none';

            // Fetch weather data from Open-Meteo API
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
            );

            if (!response.ok) {
                throw new Error('Weather API error');
            }

            const data = await response.json();
            const current = data.current;

            // Map WMO weather codes to descriptions
            const weatherDescriptions = {
                0: 'Clear',
                1: 'Mostly Clear',
                2: 'Partly Cloudy',
                3: 'Overcast',
                45: 'Foggy',
                48: 'Foggy',
                51: 'Light Drizzle',
                53: 'Moderate Drizzle',
                55: 'Heavy Drizzle',
                61: 'Light Rain',
                63: 'Moderate Rain',
                65: 'Heavy Rain',
                71: 'Light Snow',
                73: 'Moderate Snow',
                75: 'Heavy Snow',
                80: 'Light Showers',
                81: 'Moderate Showers',
                82: 'Heavy Showers',
                85: 'Light Snow Showers',
                86: 'Heavy Snow Showers',
                95: 'Thunderstorm',
                96: 'Thunderstorm with Hail',
                99: 'Thunderstorm'
            };

            const condition = weatherDescriptions[current.weather_code] || 'Unknown';
            const temp = Math.round(current.temperature_2m);

            // Fetch location name using reverse geocoding (simple approach)
            const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                const locationName = geoData.address?.city || geoData.address?.town || geoData.address?.county || 'Your Location';
                weatherLocation.textContent = locationName;
            } else {
                weatherLocation.textContent = 'Your Location';
            }

            // Update display
            weatherTemp.textContent = `${temp}°F`;
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
        if (!navigator.geolocation) {
            weatherError.style.display = 'flex';
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
            },
            (error) => {
                // User denied location or error occurred
                console.log('Geolocation error:', error.message);
                weatherLoading.style.display = 'none';
                weatherData.style.display = 'none';
                weatherError.style.display = 'flex';
            }
        );
    }

    // Initialize weather widget
    getWeather();
});
