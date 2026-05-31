import prisma from '../config/db';

async function getRouteFromOSRM(startLng: number, startLat: number, endLng: number, endLat: number) {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.routes && data.routes[0]) {
      const coordinates = data.routes[0].geometry.coordinates;
      return coordinates.map((coord: number[]) => [coord[1], coord[0]]); // [lat, lng]
    }
  } catch (error) {
    console.error('OSRM API Error:', error);
  }
  return null;
}

// Hàm thêm nhiễu để đường đi trông có vẻ như xe đi thật (lạng lách nhẹ)
function addNoiseToPath(path: [number, number][]) {
  return path.map((point, index) => {
    // Không làm nhiễu điểm đầu và cuối
    if (index === 0 || index === path.length - 1) return point;
    const noiseLat = (Math.random() - 0.5) * 0.0003;
    const noiseLng = (Math.random() - 0.5) * 0.0003;
    return [point[0] + noiseLat, point[1] + noiseLng];
  });
}

async function main() {
  console.log('Fetching completed rides without actualPath...');
  const rides = await prisma.ride.findMany({
    where: {
      status: 'COMPLETED',
      actualPath: null
    }
  });

  console.log(`Found ${rides.length} rides to process.`);

  for (const ride of rides) {
    console.log(`Processing ride ${ride.id}...`);
    // Lấy toạ độ từ PostGIS
    const coords: any[] = await prisma.$queryRaw`
      SELECT 
        ST_X(start_location::geometry) as start_lng,
        ST_Y(start_location::geometry) as start_lat,
        ST_X(end_location::geometry) as end_lng,
        ST_Y(end_location::geometry) as end_lat
      FROM "rides"
      WHERE "id" = ${ride.id}::uuid
    `;

    if (coords && coords.length > 0) {
      const { start_lng, start_lat, end_lng, end_lat } = coords[0];
      const idealPath = await getRouteFromOSRM(start_lng, start_lat, end_lng, end_lat);
      if (idealPath) {
        const actualPath = addNoiseToPath(idealPath);
        await prisma.ride.update({
          where: { id: ride.id },
          data: { actualPath: JSON.stringify(actualPath) }
        });
        console.log(`Updated ride ${ride.id} with realistic mock actual path!`);
      }
    }
    // Tránh rate limit OSRM
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
