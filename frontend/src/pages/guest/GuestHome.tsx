import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import svgPaths from "../../imports/GuestHomeScreen/svg-eq9xxpekss";
import mapImg from "../../imports/GuestHomeScreen/6454b6fa3f4fe13e283d774a4716bff599b84ee7.png";

/* ───────────────────────────────────────────
   HEADER
─────────────────────────────────────────── */
function Header({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div
      className="absolute top-[48px] left-1/2 -translate-x-1/2 flex items-center justify-between px-2 py-2 w-[calc(100%-48px)] bg-white rounded-full shadow-[0px_4px_10px_rgba(0,0,0,0.08)]"
      style={{ zIndex: 50 }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: "#065f46",
          letterSpacing: "-0.5px",
          marginLeft: 16,
          whiteSpace: "nowrap",
        }}
      >
        JV - Taxi
      </span>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/login')}
          style={{
            background: "#006d37",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 9999,
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ログイン
        </button>
        <button
          onClick={() => navigate('/signup')}
          style={{
            background: "#006d37",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 9999,
            border: "none",
            padding: "8px 16px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          サインアップ
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   LOCATION FAB BUTTON (GPS icon, right side)
─────────────────────────────────────────── */
function LocationFab() {
  return (
    <div className="absolute right-4 bottom-[calc(100%-180px)]" style={{ top: "auto", bottom: "340px", zIndex: 1001 }}>
      <button
        onClick={() => {
          // Logic nhảy về vị trí hiện tại
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              () => { window.location.reload(); }, // Tạm thời reload để trigger lại watchPosition
              () => {}
            );
          }
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: "#fff",
          border: "1px solid #e3eae0",
          boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 21.9 21.9">
          <path d={svgPaths.p3488f2a0} fill="#3D4A3F" />
        </svg>
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────
   MAP BACKGROUND (LEAFLET)
─────────────────────────────────────────── */
// Tạo Icon Marker theo thiết kế Figma
const customIcon = new L.DivIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="position:relative; width:48px; height:48px; transform: translate(-50%, -50%);">
      <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(0,109,55,0.2);"></div>
      <div style="position:absolute; width:24px; height:24px; border-radius:50%; background:#006d37; border:4px solid #fff; box-shadow:0px 4px 8px rgba(0,0,0,0.15); top:12px; left:12px; z-index:1;"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

// Component tự động di chuyển bản đồ theo GPS
function RecenterAutomatically({ location }: { location: {lat: number, lng: number} | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], map.getZoom());
    }
  }, [location, map]);
  return null;
}

function MapBackground({ location }: { location: { lat: number; lng: number } | null }) {
  // Tọa độ mặc định (Trung tâm TP.HCM)
  const defaultCenter = { lat: 10.7769, lng: 106.7009 };
  const center = location || defaultCenter;

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={16}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {location && (
          <Marker position={[location.lat, location.lng]} icon={customIcon} />
        )}
        <RecenterAutomatically location={location} />
      </MapContainer>
      {/* Lớp phủ nhạt để ám xanh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,109,55,0.05)",
          pointerEvents: "none",
          zIndex: 1000, // z-index cao hơn bản đồ Leaflet
        }}
      />
    </div>
  );
}

/* ───────────────────────────────────────────
   GPS PERMISSION MODAL
─────────────────────────────────────────── */
function GpsPermissionModal({ error }: { error: string | null }) {
  if (error !== "PERMISSION_DENIED") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-3xl w-[90%] max-w-[340px] text-center shadow-xl">
        <svg className="mx-auto mb-4" width="48" height="48" fill="none" viewBox="0 0 24 24">
          <path fill="#A7344C" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Yêu cầu quyền vị trí</h3>
        <p className="text-sm text-gray-600 mb-6">
          Vui lòng bật quyền truy cập vị trí (GPS) trong cài đặt thiết bị để có thể sử dụng chức năng gọi xe.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-[#006d37] text-white font-bold py-3 rounded-full"
        >
          Tôi đã bật, tải lại trang
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   BOTTOM SHEET
─────────────────────────────────────────── */
function BottomSheet(props: { navigate: (path: string) => void, gpsLocation: {lat: number, lng: number} | null }) {
  // State quản lý địa điểm đón và điểm đến
  const [pickupLocation, setPickupLocation] = useState("Đang tải vị trí...");
  const [destination, setDestination] = useState("");

  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'pickup' | 'destination' | null>(null);

  // Gọi API reverse geocoding khi gpsLocation thay đổi
  useEffect(() => {
    if (props.gpsLocation && pickupLocation === "Đang tải vị trí...") {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${props.gpsLocation.lat}&lon=${props.gpsLocation.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            const shortName = data.display_name.split(',').slice(0, 2).join(', ');
            setPickupLocation(shortName);
          }
        })
        .catch(() => setPickupLocation("Vị trí của bạn"));
    }
  }, [props.gpsLocation, pickupLocation]);

  // Gọi API gợi ý (qua Backend cục bộ) cho điểm đón
  useEffect(() => {
    if (activeInput === 'pickup' && pickupLocation.length > 2 && pickupLocation !== "Lotte Hotel Saigon") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/locations/search?q=${encodeURIComponent(pickupLocation)}`);
          const data = await res.json();
          setPickupSuggestions(data);
        } catch (e) {
          console.error("Lỗi fetch API", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPickupSuggestions([]);
    }
  }, [pickupLocation, activeInput]);

  // Gọi API gợi ý (qua Backend cục bộ) cho điểm đến
  useEffect(() => {
    if (activeInput === 'destination' && destination.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/locations/search?q=${encodeURIComponent(destination)}`);
          const data = await res.json();
          setDestinationSuggestions(data);
        } catch (e) {
          console.error("Lỗi fetch API", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDestinationSuggestions([]);
    }
  }, [destination, activeInput]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 w-[calc(100%-24px)] mx-auto mb-3"
      style={{
        zIndex: 50,
        background: "#fff",
        borderRadius: "24px",
        boxShadow: "0px -8px 20px rgba(0,0,0,0.08)",
        padding: "16px 16px 20px",
      }}
    >
      {/* Handle */}
      <div
        style={{
          width: 48,
          height: 4,
          borderRadius: 9999,
          background: "#dde5db",
          margin: "0 auto 16px",
        }}
      />

      {/* Pickup Location */}
      <div
        style={{
          background: "#eff6ec",
          borderRadius: 16,
          padding: "14px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {/* Icon + line */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 11.6667 11.6667">
            <path d={svgPaths.p56f580} fill="#006D37" />
          </svg>
          <div style={{ width: 2, height: 16, background: "rgba(188,202,188,0.3)" }} />
        </div>
        {/* Text */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', sans-serif",
              fontWeight: 700,
              fontSize: 10,
              color: "rgba(61,74,63,0.7)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            現在地
          </div>
          <input
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            onFocus={() => setActiveInput('pickup')}
            onBlur={() => setTimeout(() => setActiveInput(null), 300)}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#171d17",
              background: "transparent",
              border: "none",
              outline: "none",
              width: "100%",
            }}
          />
          {/* Dropdown Gợi ý Điểm Đón */}
          {activeInput === 'pickup' && pickupSuggestions.length > 0 && (
            <ul
              className="absolute z-50 w-[120%] -left-4 bg-white shadow-lg rounded-lg mb-2 py-1 max-h-48 overflow-auto"
              style={{ bottom: "100%", border: "1px solid #e5e4e7" }}
            >
              {pickupSuggestions.map((item, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-[#eff6ec] cursor-pointer text-sm border-b border-gray-100 last:border-0"
                  onClick={() => {
                    setPickupLocation(item.display_name);
                    setActiveInput(null);
                  }}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3d4a3f", textAlign: 'left' }}
                >
                  <div className="font-bold truncate">{item.display_name.split(',')[0]}</div>
                  <div className="text-xs opacity-70 truncate">{item.display_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* GPS icon */}
        <svg width="22" height="22" fill="none" viewBox="0 0 21.9 21.9">
          <path d={svgPaths.p3488f2a0} fill="#3D4A3F" />
        </svg>
      </div>

      {/* Destination Search */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "2px solid rgba(0,109,55,0.1)",
          boxShadow: "0px 1px 1px rgba(0,0,0,0.05)",
          padding: "16px 16px 16px 52px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          marginBottom: 20,
        }}
      >
        {/* Pin icon */}
        <div style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)" }}>
          <svg width="16" height="20" fill="none" viewBox="0 0 16 20">
            <path d={svgPaths.p303da380} fill="#A7344C" />
          </svg>
        </div>
        {/* Placeholder text => Changed to input */}
        <input
          type="text"
          placeholder="行き先を入力"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onFocus={() => setActiveInput('destination')}
          onBlur={() => setTimeout(() => setActiveInput(null), 300)}
          style={{
            flex: 1,
            fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#171d17",
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
        {/* Dropdown Gợi ý Điểm Đến */}
        {activeInput === 'destination' && destinationSuggestions.length > 0 && (
          <ul
            className="absolute z-50 w-full left-0 bg-white shadow-lg rounded-lg mb-2 py-1 max-h-48 overflow-auto"
            style={{ bottom: "100%", border: "1px solid #e5e4e7" }}
          >
            {destinationSuggestions.map((item, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-[#eff6ec] cursor-pointer text-sm border-b border-gray-100 last:border-0"
                onClick={() => {
                  setDestination(item.display_name);
                  setActiveInput(null);
                }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#3d4a3f" }}
              >
                <div className="font-bold truncate">{item.display_name.split(',')[0]}</div>
                <div className="text-xs opacity-70 truncate">{item.display_name}</div>
              </li>
            ))}
          </ul>
        )}
        {/* Search icon */}
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <path d={svgPaths.p8a35e00} fill="#3D4A3F" fillOpacity="0.4" />
        </svg>
      </div>

      {/* CTA Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          props.navigate('/guest/search-location');
        }}
        onTouchStart={(e) => {
          // Fix cho một số trình duyệt mobile không nhận onClick
          e.preventDefault();
          props.navigate('/guest/search-location');
        }}
        style={{
          position: "relative",
          zIndex: 100,
          width: "100%",
          background: "linear-gradient(to right, #006d37, #27ae60)",
          border: "none",
          borderRadius: 24,
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: "pointer",
          boxShadow: "0px 20px 25px -5px rgba(0,109,55,0.2), 0px 8px 10px -6px rgba(0,109,55,0.2)",
        }}
      >
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Noto Sans JP', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          今すぐ呼ぶ
        </span>
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path d={svgPaths.p1a406200} fill="#fff" />
        </svg>
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────
   MAIN EXPORT
─────────────────────────────────────────── */
export default function GuestHome() {
  const navigate = useNavigate();
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Trình duyệt không hỗ trợ GPS");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsError(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError("PERMISSION_DENIED");
        } else {
          setGpsError("Không thể lấy vị trí");
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#f4fbf1",
      }}
    >
      {/* Nền bản đồ chiếm toàn bộ màn hình */}
      <MapBackground location={gpsLocation} />
      
      {/* Popup cảnh báo quyền GPS */}
      <GpsPermissionModal error={gpsError} />

      {/* Header cố định phía trên */}
      <Header navigate={navigate} />

      {/* Nút GPS bên phải */}
      <LocationFab />

      {/* Bottom sheet */}
      <BottomSheet navigate={navigate} gpsLocation={gpsLocation} />
    </div>
  );
}