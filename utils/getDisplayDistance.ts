// Helper function to format the distance
export const getDisplayDistance = (dist_km : number) => {
  // If 1km or more, show in kilometers (e.g., "1.2 km")
  if (dist_km >= 1) {
    return `${dist_km.toFixed(1)} km`;
  }
  // If less than 1km, show in meters (e.g., "350 m")
  if (dist_km > 0) {
    return `${(dist_km * 1000).toFixed(0)} m`;
  }
  // If 0 or not available
  return 'Nearby';
};