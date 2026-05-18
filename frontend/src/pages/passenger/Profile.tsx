import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { socketService } from "../../services/socketService";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    // Ngắt socket trước khi xóa thông tin user
    socketService.disconnect();
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
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
            <p className="text-[#171d17] font-medium">{user.email || '未設定'}</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3d4a3f] uppercase tracking-wider">電話番号</label>
            <p className="text-[#171d17] font-medium">{user.phone || '未設定'}</p>
          </div>

          <div className="pt-4 space-y-3">
            <label className="text-xs font-bold text-[#3d4a3f] uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} /> お支払い方法
            </label>
            <div className="bg-gradient-to-br from-[#171d17] to-[#3d4a3f] p-5 rounded-2xl text-white shadow-md relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-yellow-400/20 p-2 rounded-lg">
                    <div className="w-8 h-6 bg-yellow-500/50 rounded-sm"></div>
                  </div>
                  <span className="text-xs font-bold tracking-widest opacity-80 italic">VISA</span>
                </div>
                <div className="text-lg font-mono tracking-[0.2em] mb-4">
                  4242 4242 4242 4242
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[8px] uppercase opacity-50 mb-1">カード名義人</div>
                    <div className="text-xs font-bold uppercase tracking-wider">{user.fullName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] uppercase opacity-50 mb-1">有効期限</div>
                    <div className="text-xs font-bold">12/30</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
            </div>
            <button className="text-[#006d37] text-sm font-bold flex items-center gap-1 hover:underline">
              カード情報を更新する
            </button>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              ログアウト
            </button>
            
            <button 
              onClick={() => navigate('/passenger')}
              className="w-full mt-4 py-4 text-[#3d4a3f] font-bold hover:bg-[#f4fbf1] rounded-2xl transition-all"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
