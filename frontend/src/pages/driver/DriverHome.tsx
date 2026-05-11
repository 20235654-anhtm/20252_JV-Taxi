import { useNavigate } from "react-router-dom";

export default function DriverHome() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-[#171d17] min-h-screen text-white p-6">
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-[#2a362b] rounded-3xl p-8 border border-[rgba(255,255,255,0.1)] shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-16 bg-[#27ae60] rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.fullName?.charAt(0) || 'D'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.fullName || 'Tài xế'}</h1>
              <p className="text-gray-400 text-sm">Chế độ Tài xế • Đang hoạt động</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1b251c] p-4 rounded-2xl">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Thu nhập</p>
              <p className="text-lg font-bold">0đ</p>
            </div>
            <div className="bg-[#1b251c] p-4 rounded-2xl">
              <p className="text-gray-500 text-xs uppercase font-bold mb-1">Cuốc xe</p>
              <p className="text-lg font-bold">0</p>
            </div>
          </div>

          <button className="w-full py-4 bg-[#27ae60] rounded-2xl font-bold text-white mb-4 hover:brightness-110 transition-all">
            Bắt đầu nhận cuốc
          </button>

          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-transparent border border-gray-700 rounded-2xl font-bold text-gray-400 hover:bg-gray-800 transition-all"
          >
            Đăng xuất
          </button>
        </div>
        
        <p className="text-center mt-8 text-gray-600 text-sm italic">
          JV-Taxi • Driver Mode v1.0
        </p>
      </div>
    </div>
  );
}
