import React, { useEffect, useState, useRef } from 'react';
import { Polyline } from 'react-leaflet';
import { getRouteWithDuration } from '../../hooks/useLocationSuggestions';
import { distanceBetween, nearestPointOnPolyline, trimPassedSegments } from '../../utils/routeUtils';

interface LatLng {
  lat: number;
  lng: number;
}

interface SmartMapRouteProps {
  driverPosition: LatLng | null;
  destination: LatLng | null;
  color?: string;
  outlineColor?: string;
}

const DEVIATION_THRESHOLD = 50; // Lệch 50m là vẽ lại
const FASTER_ROUTE_THRESHOLD = 120; // Nhanh hơn 2 phút thì đổi đường

export const SmartMapRoute: React.FC<SmartMapRouteProps> = ({ driverPosition, destination, color = '#0f4c3a', outlineColor }) => {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const currentDurationRef = useRef<number>(Infinity);
  
  // Lưu driverPosition cũ để tránh tính toán liên tục nếu không di chuyển
  const prevDriverPosRef = useRef<LatLng | null>(null);

  // 1. Fetch lộ trình lần đầu
  useEffect(() => {
    let isMounted = true;
    const fetchInitialRoute = async () => {
      if (driverPosition && destination && positions.length === 0) {
        const { coords, duration } = await getRouteWithDuration(driverPosition, destination);
        if (isMounted && coords.length > 0) {
          setPositions(coords);
          currentDurationRef.current = duration;
        }
      }
    };
    fetchInitialRoute();
    return () => { isMounted = false; };
  }, [driverPosition, destination]);

  // 2. Xử lý khi GPS cập nhật (Case 1 & 3)
  useEffect(() => {
    let isMounted = true;

    const processGPSUpdate = async () => {
      if (!driverPosition || !destination || positions.length === 0) return;
      
      // Nếu không di chuyển đáng kể, bỏ qua (tối ưu hiệu năng)
      const prevPos = prevDriverPosRef.current;
      if (prevPos && distanceBetween(prevPos, driverPosition) < 2) return;
      prevDriverPosRef.current = driverPosition;

      // Tìm điểm gần nhất trên polyline hiện tại
      const { distance } = nearestPointOnPolyline(driverPosition, positions);

      // Case 1: Lệch route > 50m
      if (distance > DEVIATION_THRESHOLD) {
        console.log(`[SmartRoute] Bị lệch ${Math.round(distance)}m. Đang tính lại đường...`);
        const { coords, duration } = await getRouteWithDuration(driverPosition, destination);
        if (isMounted && coords.length > 0) {
          setPositions(coords);
          currentDurationRef.current = duration;
        }
      } else {
        // Case 3: Không lệch, tiến hành cắt đoạn đường đã đi qua
        const trimmed = trimPassedSegments(positions, driverPosition);
        if (trimmed.length !== positions.length) {
          setPositions(trimmed);
        }
      }
    };

    processGPSUpdate();
    return () => { isMounted = false; };
  }, [driverPosition, destination]); // Cập nhật khi driverPosition đổi

  // 3. Định kỳ kiểm tra đường tốt hơn (Case 2)
  useEffect(() => {
    const checkBetterRoute = async () => {
      if (!driverPosition || !destination || positions.length === 0) return;
      
      try {
        const { coords, duration } = await getRouteWithDuration(driverPosition, destination);
        if (coords.length > 0) {
          // Tính thời gian hiện tại còn lại xấp xỉ (nếu đi tiếp con đường cũ)
          // Rất khó để tính chính xác duration của đoạn route bị cắt, nên ta so sánh với currentDurationRef
          // Ở mức cơ bản, nếu OSRM tìm ra đường mới nhanh hơn 120s so với tổng thời gian route cũ 
          // thì ta ưu tiên đường mới. (Thực tế nên tính ETA lại của đường cũ, nhưng ở đây ta simplify)
          
          if (currentDurationRef.current - duration > FASTER_ROUTE_THRESHOLD) {
            console.log(`[SmartRoute] Tìm thấy đường nhanh hơn ${Math.round((currentDurationRef.current - duration) / 60)} phút. Cập nhật route!`);
            setPositions(coords);
            currentDurationRef.current = duration;
          } else if (duration > currentDurationRef.current + 30) {
            // Cập nhật lại duration tham chiếu nếu đường đi dài hơn (do kẹt xe)
            // nhưng không đổi polyline để tránh giật
            currentDurationRef.current = duration;
          }
        }
      } catch (err) {
        console.error('Check better route error', err);
      }
    };

    // Chạy mỗi 30 giây
    const interval = setInterval(checkBetterRoute, 30000);
    return () => clearInterval(interval);
  }, [driverPosition, destination, positions.length]);

  if (positions.length === 0) return null;

  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#006d37" />
          </linearGradient>
        </defs>
      </svg>
      {outlineColor && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: outlineColor,
            weight: 8,
            opacity: 1,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
      )}
      <Polyline
        positions={positions}
        pathOptions={{
          color: color,
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round'
        }}
      />
      {!outlineColor && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: color,
            weight: 10,
            opacity: 0.2,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
      )}
    </>
  );
};
