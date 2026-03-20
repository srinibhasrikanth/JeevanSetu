const mapsService = require('../services/mapsService');

// Mock any external fetch calls if necessary (mapsService uses basic logic, we check for return values)
describe('Maps Service Tests', () => {
  const mockLat = 12.9716;
  const mockLng = 77.5946;

  it('should return null if GOOGLE_MAPS_API_KEY is not defined (triggering controller fallback)', async () => {
    // Save current key if any
    const oldKey = process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.GOOGLE_MAPS_API_KEY;

    const res = await mapsService.getRealEmergencyContext(mockLat, mockLng);

    expect(res).toBeNull();

    // Restore key
    process.env.GOOGLE_MAPS_API_KEY = oldKey;
  });

  it('should return null or mock if lat/lng are missing', async () => {
    const res = await mapsService.getRealEmergencyContext(null, null);
    expect(res).toBeNull();
  });
});
