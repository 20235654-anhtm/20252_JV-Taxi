import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-[#f4fbf1] min-h-screen p-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-[rgba(0,109,55,0.1)]">
        <div className="bg-gradient-to-r from-[#006d37] to-[#27ae60] p-8 text-center">
          <div className="size-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-[#006d37]">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <h1 className="text-white text-2xl font-bold">{user.fullName}</h1>
          <p className="text-white/80 text-sm">{user.role}</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3d4a3f] uppercase tracking-wider">Email</label>
            <p className="text-[#171d17] font-medium">{user.email || 'Chưa cập nhật'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3d4a3f] uppercase tracking-wider">Số điện thoại</label>
            <p className="text-[#171d17] font-medium">{user.phone || 'Chưa cập nhật'}</p>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              Đăng xuất
            </button>
            
            <button 
              onClick={() => navigate('/passenger')}
              className="w-full mt-4 py-4 text-[#3d4a3f] font-bold hover:bg-[#f4fbf1] rounded-2xl transition-all"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
