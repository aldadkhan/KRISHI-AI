import express from 'express';

const router = express.Router();

const districts = {
  Alappuzha: [9.4981, 76.3388],
  Ernakulam: [9.9816, 76.2999],
  Idukki: [9.8494, 76.9720],
  Kannur: [11.8745, 75.3704],
  Kasaragod: [12.4996, 74.9869],
  Kollam: [8.8932, 76.6141],
  Kottayam: [9.5916, 76.5222],
  Kozhikode: [11.2588, 75.7804],
  Malappuram: [11.0510, 76.0711],
  Palakkad: [10.7867, 76.6548],
  Pathanamthitta: [9.2648, 76.7870],
  Thiruvananthapuram: [8.5241, 76.9366],
  Thrissur: [10.5276, 76.2144],
  Wayanad: [11.6854, 76.1320]
};

router.get('/', async (req, res) => {
  const district = String(req.query.district || 'Ernakulam');
  const coordinates = districts[district];
  if (!coordinates) {
    return res.status(400).json({ message: 'Choose a valid Kerala district.' });
  }

  const params = new URLSearchParams({
    latitude: String(coordinates[0]),
    longitude: String(coordinates[1]),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    timezone: 'Asia/Kolkata',
    forecast_days: '5'
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      console.error(`Weather provider returned HTTP ${response.status} for ${district}.`);
      return res.status(502).json({ message: 'The weather service is temporarily unavailable.' });
    }

    const forecast = await response.json();
    if (!forecast.current || !Array.isArray(forecast.daily?.time)) {
      console.error(`Weather provider returned an incomplete forecast for ${district}.`);
      return res.status(502).json({ message: 'The weather service returned an incomplete forecast.' });
    }

    res.json({
      district,
      current: forecast.current,
      daily: forecast.daily,
      timezone: forecast.timezone,
      source: 'Open-Meteo'
    });
  } catch (error) {
    console.error(`Unable to retrieve weather for ${district}:`, error);
    res.status(502).json({ message: 'Unable to retrieve the latest forecast. Please try again.' });
  }
});

export default router;
