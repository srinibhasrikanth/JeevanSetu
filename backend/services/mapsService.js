/**
 * Service to fetch real-world data from Google Maps APIs.
 * Requires GOOGLE_MAPS_API_KEY in .env
 */

const getRealEmergencyContext = async (lat, lng) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_')) {
    console.warn('[Maps] ⚠️  GOOGLE_MAPS_API_KEY not configured. Falling back to mock data.');
    return null;
  }

  try {
    // 1. Fetch nearby hospitals using Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=hospital&key=${apiKey}`;
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    if (placesData.status !== 'OK' || !placesData.results || placesData.results.length === 0) {
      console.warn(`[Maps] ⚠️  Places API returned status: ${placesData.status}`);
      return null;
    }

    // Take top 4 hospitals
    const topHospitals = placesData.results.slice(0, 4);

    // 2. Fetch traffic and routing data using Google Distance Matrix API
    const destinations = topHospitals.map(h => `place_id:${h.place_id}`).join('|');
    const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${encodeURIComponent(destinations)}&departure_time=now&key=${apiKey}`;
    
    const matrixRes = await fetch(matrixUrl);
    const matrixData = await matrixRes.json();

    if (matrixData.status !== 'OK') {
      console.warn(`[Maps] ⚠️  Distance Matrix API returned: ${matrixData.status}`);
      return null;
    }

    const hospitals = [];
    const traffic = {
      summary: "Real-time traffic fetched from Google Maps",
      routes: []
    };

    topHospitals.forEach((hospital, index) => {
      const element = matrixData.rows?.[0]?.elements?.[index];
      
      if (element && element.status === 'OK') {
        const distanceStr = element.distance.text;
        const durNormal = element.duration.value; // seconds
        const durTraffic = element.duration_in_traffic ? element.duration_in_traffic.value : durNormal;
        
        let congestion = "Low";
        if (durTraffic > durNormal * 1.3) congestion = "High";
        else if (durTraffic > durNormal * 1.1) congestion = "Moderate";

        hospitals.push({
          name: hospital.name,
          distance: distanceStr,
          // Google doesn't surface deep medical specialties easily in basic Nearby Search,
          // so we provide the raw types Google categorizes them under for the AI to interpret.
          specialties: hospital.types.filter(t => t !== 'point_of_interest' && t !== 'establishment')
        });

        traffic.routes.push({
          destination: hospital.name,
          ETA: element.duration_in_traffic ? element.duration_in_traffic.text : element.duration.text,
          congestion_level: congestion,
          normal_time: element.duration.text
        });
      }
    });

    return { hospitals, traffic };
  } catch (error) {
    console.error('[Maps] ❌  Error fetching from Google Maps APIs:', error.message);
    return null;
  }
};

module.exports = {
  getRealEmergencyContext,
};
