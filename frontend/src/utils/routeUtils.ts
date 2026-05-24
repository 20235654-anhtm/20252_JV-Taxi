export interface LatLng {
  lat: number;
  lng: number;
}

// Tính khoảng cách Haversine giữa 2 điểm (mét)
export function distanceBetween(p1: LatLng, p2: LatLng): number {
  const R = 6371e3; // Bán kính trái đất (m)
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Tìm đoạn vuông góc từ 1 điểm đến 1 đoạn thẳng, trả về khoảng cách và hình chiếu
function pointToLineDistance(
  p: LatLng,
  a: LatLng,
  b: LatLng
): { distance: number; projection: LatLng } {
  const distAB = distanceBetween(a, b);
  if (distAB === 0) return { distance: distanceBetween(p, a), projection: a };

  // Khoảng cách theo x, y tương đối để tính tỉ lệ projection t
  const x0 = p.lng,
    y0 = p.lat;
  const x1 = a.lng,
    y1 = a.lat;
  const x2 = b.lng,
    y2 = b.lat;

  // Tính t (tỉ lệ chiếu của P lên AB).
  // Vì không gian là mặt cầu, việc dùng toạ độ phẳng chỉ đúng với khoảng cách nhỏ (local).
  // Do các điểm OSRM rất gần nhau, xấp xỉ này là chấp nhận được.
  const dotProduct = (x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1);
  const lineLenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  const t = Math.max(0, Math.min(1, dotProduct / lineLenSq));

  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);

  const projection = { lat: projY, lng: projX };
  const distance = distanceBetween(p, projection);

  return { distance, projection };
}

// Tìm điểm gần nhất trên polyline, trả về index của điểm bắt đầu của đoạn đó
export function nearestPointOnPolyline(
  point: LatLng,
  polyline: [number, number][]
): { distance: number; segmentIndex: number; projection: LatLng } {
  let minDistance = Infinity;
  let bestSegmentIndex = 0;
  let bestProjection = { lat: polyline[0][0], lng: polyline[0][1] };

  for (let i = 0; i < polyline.length - 1; i++) {
    const a = { lat: polyline[i][0], lng: polyline[i][1] };
    const b = { lat: polyline[i + 1][0], lng: polyline[i + 1][1] };
    const { distance, projection } = pointToLineDistance(point, a, b);

    if (distance < minDistance) {
      minDistance = distance;
      bestSegmentIndex = i;
      bestProjection = projection;
    }
  }

  return { distance: minDistance, segmentIndex: bestSegmentIndex, projection: bestProjection };
}

// Xoá các điểm đã đi qua dựa trên vị trí hiện tại của tài xế
export function trimPassedSegments(
  polyline: [number, number][],
  driverPos: LatLng
): [number, number][] {
  if (polyline.length < 2) return polyline;

  const { segmentIndex, projection } = nearestPointOnPolyline(driverPos, polyline);

  // Giữ lại từ điểm chiếu, sau đó nối với các điểm phía trước
  const remainingPolyline = polyline.slice(segmentIndex + 1);
  
  // Trả về polyline bắt đầu chính xác từ vị trí tài xế
  return [[driverPos.lat, driverPos.lng], ...remainingPolyline];
}
