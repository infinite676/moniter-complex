/**
 * Monitor Complex - Real-Time Meteorological Station Engine
 * Integrates Open-Meteo API, Geocoding Search, Geolocation, UV Index, Wind Compass, and 7-Day Forecast.
 */

class WeatherStation {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.unit = localStorage.getItem('mc_weather_unit') || 'c'; // 'c' or 'f'
        this.currentLocation = {
            name: 'Detecting Location...',
            country: '',
            latitude: null,
            longitude: null
        };
        this.weatherData = null;
        this.isLoading = false;
    }

    setUnit(newUnit) {
        if (this.unit === newUnit) return;
        this.unit = newUnit;
        localStorage.setItem('mc_weather_unit', newUnit);
        if (this.currentLocation.latitude && this.currentLocation.longitude) {
            this.fetchWeather(this.currentLocation.latitude, this.currentLocation.longitude, this.currentLocation.name, this.currentLocation.country);
        }
    }

    async init() {
        // Try saved location first or auto-locate
        const savedLoc = localStorage.getItem('mc_weather_location');
        if (savedLoc) {
            try {
                const loc = JSON.parse(savedLoc);
                if (loc.latitude && loc.longitude) {
                    await this.fetchWeather(loc.latitude, loc.longitude, loc.name, loc.country);
                    return;
                }
            } catch (e) {}
        }
        await this.detectLocation();
    }

    async detectLocation() {
        this.isLoading = true;
        if (this.callbacks.onLoading) this.callbacks.onLoading(true);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    // Reverse geocode via BigDataCloud or Open-Meteo or generic name
                    let cityName = 'Current Location';
                    try {
                        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, { signal: AbortSignal.timeout(3000) });
                        if (geoRes.ok) {
                            const geoData = await geoRes.json();
                            cityName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Your Location';
                            this.currentLocation.country = geoData.countryCode || '';
                        }
                    } catch (e) {
                        cityName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                    }
                    await this.fetchWeather(lat, lon, cityName, this.currentLocation.country);
                },
                async (err) => {
                    console.warn('Geolocation denied or unavailable, falling back to IP lookup:', err.message);
                    await this.fallbackIpLocation();
                },
                { timeout: 8000, enableHighAccuracy: true }
            );
        } else {
            await this.fallbackIpLocation();
        }
    }

    async fallbackIpLocation() {
        try {
            const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
            if (res.ok) {
                const data = await res.json();
                if (data.latitude && data.longitude) {
                    await this.fetchWeather(data.latitude, data.longitude, data.city || 'Detected City', data.country_name || '');
                    return;
                }
            }
        } catch (e) {}
        // Global fallback: Tokyo
        await this.fetchWeather(35.6762, 139.6503, 'Tokyo', 'Japan');
    }

    async searchCity(query) {
        if (!query || query.trim().length < 2) return [];
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            return data.results || [];
        } catch (e) {
            console.error('City search failed:', e);
            return [];
        }
    }

    async fetchWeather(lat, lon, cityName, countryName = '') {
        this.isLoading = true;
        if (this.callbacks.onLoading) this.callbacks.onLoading(true);

        this.currentLocation = {
            latitude: lat,
            longitude: lon,
            name: cityName,
            country: countryName
        };

        // Persist last valid location
        try {
            localStorage.setItem('mc_weather_location', JSON.stringify(this.currentLocation));
        } catch (e) {}

        const tempUnit = this.unit === 'f' ? 'fahrenheit' : 'celsius';
        const windUnit = this.unit === 'f' ? 'mph' : 'kmh';
        const precUnit = this.unit === 'f' ? 'inch' : 'mm';

        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precUnit}&timezone=auto`;

        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
            const data = await res.json();
            this.weatherData = data;
            this.isLoading = false;

            if (this.callbacks.onLoading) this.callbacks.onLoading(false);
            if (this.callbacks.onUpdate) {
                this.callbacks.onUpdate({
                    location: this.currentLocation,
                    unit: this.unit,
                    current: this.parseCurrentWeather(data),
                    hourly: this.parseHourlyWeather(data),
                    daily: this.parseDailyWeather(data),
                    raw: data
                });
            }
        } catch (e) {
            this.isLoading = false;
            console.error('Failed to load weather:', e);
            if (this.callbacks.onLoading) this.callbacks.onLoading(false);
            if (this.callbacks.onError) this.callbacks.onError(e.message);
        }
    }

    parseCurrentWeather(data) {
        const c = data.current;
        const d = data.daily;
        const code = c.weather_code;
        const isDay = c.is_day === 1;
        const meta = this.getWeatherMeta(code, isDay);

        // UV Index (approx from hourly closest to current time)
        let currentUv = 0;
        if (data.hourly && data.hourly.uv_index && data.hourly.time) {
            const nowIso = new Date().toISOString().slice(0, 13);
            const idx = data.hourly.time.findIndex(t => t.startsWith(nowIso));
            if (idx !== -1) currentUv = data.hourly.uv_index[idx] || 0;
        }
        if (!currentUv && d && d.uv_index_max && d.uv_index_max.length > 0) {
            currentUv = isDay ? d.uv_index_max[0] * 0.7 : 0;
        }

        return {
            temperature: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            tempMax: d ? Math.round(d.temperature_2m_max[0]) : null,
            tempMin: d ? Math.round(d.temperature_2m_min[0]) : null,
            humidity: c.relative_humidity_2m,
            pressure: Math.round(c.pressure_msl),
            windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
            windDirection: c.wind_direction_10m,
            windCompass: this.getWindCompass(c.wind_direction_10m),
            windGusts: Math.round(c.wind_gusts_10m * 10) / 10,
            isDay: isDay,
            cloudCover: c.cloud_cover,
            precipitation: c.precipitation,
            uvIndex: Math.round(currentUv * 10) / 10,
            uvCategory: this.getUvCategory(currentUv),
            sunrise: d ? d.sunrise[0] : null,
            sunset: d ? d.sunset[0] : null,
            condition: meta.label,
            icon: meta.icon,
            theme: meta.theme,
            weatherCode: code
        };
    }

    parseHourlyWeather(data) {
        if (!data.hourly || !data.hourly.time) return [];
        const h = data.hourly;
        const now = new Date();
        const currentHourIso = now.toISOString().slice(0, 13);

        let startIndex = h.time.findIndex(t => t.startsWith(currentHourIso));
        if (startIndex === -1) startIndex = 0;

        const list = [];
        const count = Math.min(24, h.time.length - startIndex);

        for (let i = 0; i < count; i++) {
            const idx = startIndex + i;
            const timeStr = h.time[idx];
            const dateObj = new Date(timeStr);
            const hour = dateObj.getHours();
            const ampmHour = hour === 0 ? '12 AM' : (hour < 12 ? `${hour} AM` : (hour === 12 ? '12 PM' : `${hour - 12} PM`));
            const isDay = hour >= 6 && hour < 19;
            const meta = this.getWeatherMeta(h.weather_code[idx], isDay);

            list.push({
                time: i === 0 ? 'Now' : ampmHour,
                temp: Math.round(h.temperature_2m[idx]),
                pop: h.precipitation_probability ? h.precipitation_probability[idx] : 0,
                humidity: h.relative_humidity_2m[idx],
                uv: h.uv_index ? h.uv_index[idx] : 0,
                icon: meta.icon,
                condition: meta.label
            });
        }
        return list;
    }

    parseDailyWeather(data) {
        if (!data.daily || !data.daily.time) return [];
        const d = data.daily;
        const days = [];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < d.time.length; i++) {
            const date = new Date(d.time[i] + 'T00:00:00');
            const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : weekdays[date.getDay()]);
            const meta = this.getWeatherMeta(d.weather_code[i], true);

            days.push({
                day: dayName,
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                tempMax: Math.round(d.temperature_2m_max[i]),
                tempMin: Math.round(d.temperature_2m_min[i]),
                precipitation: d.precipitation_sum ? d.precipitation_sum[i] : 0,
                uvMax: d.uv_index_max ? Math.round(d.uv_index_max[i]) : null,
                icon: meta.icon,
                condition: meta.label
            });
        }
        return days;
    }

    getWindCompass(deg) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const val = Math.floor((deg / 22.5) + 0.5);
        return directions[val % 16];
    }

    getUvCategory(uv) {
        if (uv <= 2) return { text: 'Low', color: '#10b981' };
        if (uv <= 5) return { text: 'Moderate', color: '#f59e0b' };
        if (uv <= 7) return { text: 'High', color: '#f97316' };
        if (uv <= 10) return { text: 'Very High', color: '#ef4444' };
        return { text: 'Extreme', color: '#a855f7' };
    }

    getWeatherMeta(code, isDay) {
        switch (code) {
            case 0:
                return {
                    label: isDay ? 'Clear Sky' : 'Clear Night',
                    icon: isDay ? 'sun' : 'moon',
                    theme: isDay ? 'sunny' : 'night'
                };
            case 1:
            case 2:
                return {
                    label: isDay ? 'Partly Cloudy' : 'Partly Cloudy',
                    icon: isDay ? 'cloud-sun' : 'cloud-moon',
                    theme: 'cloudy'
                };
            case 3:
                return {
                    label: 'Overcast',
                    icon: 'cloud',
                    theme: 'overcast'
                };
            case 45:
            case 48:
                return {
                    label: 'Fog & Mist',
                    icon: 'fog',
                    theme: 'fog'
                };
            case 51:
            case 53:
            case 55:
                return {
                    label: 'Drizzle',
                    icon: 'cloud-drizzle',
                    theme: 'rainy'
                };
            case 61:
            case 63:
            case 65:
                return {
                    label: code === 65 ? 'Heavy Rain' : 'Rain Showers',
                    icon: 'cloud-rain',
                    theme: 'rainy'
                };
            case 71:
            case 73:
            case 75:
            case 77:
                return {
                    label: 'Snowfall',
                    icon: 'snowflake',
                    theme: 'snow'
                };
            case 80:
            case 81:
            case 82:
                return {
                    label: 'Violent Rain Showers',
                    icon: 'cloud-heavy-rain',
                    theme: 'stormy'
                };
            case 85:
            case 86:
                return {
                    label: 'Snow Showers',
                    icon: 'snow-shower',
                    theme: 'snow'
                };
            case 95:
            case 96:
            case 99:
                return {
                    label: 'Thunderstorm',
                    icon: 'cloud-lightning',
                    theme: 'stormy'
                };
            default:
                return {
                    label: 'Mostly Clear',
                    icon: isDay ? 'sun' : 'moon',
                    theme: 'neutral'
                };
        }
    }
}

window.WeatherStation = WeatherStation;
