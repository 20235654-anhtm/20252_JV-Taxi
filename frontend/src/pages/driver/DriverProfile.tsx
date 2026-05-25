import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import svgPaths from "./svg-paths";
import { API_BASE_URL } from "../../config/api";
import { BottomNavBar } from "../../components/layout/BottomNavBar";
import { showToast } from "../../components/ui/Toast";
import { getCache, setCache, clearAllCache, CACHE_KEYS } from "../../services/cacheService";

const imgDriverProfile = "https://i.pravatar.cc/150?img=12";
const imgVehicleHero = "/bmw_car.png";

function HeaderTopAppBar({ avatarUrl }: { avatarUrl?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-[64px] bg-[rgba(244,251,241,0.8)] backdrop-blur-[6px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex justify-center z-[1000]">
      <div className="w-full max-w-[480px] flex items-center justify-between px-[24px]">
        <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#166534] text-[20px] tracking-[-0.5px]">JV - Taxi</div>
        <div className="size-[40px] rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
          <img src={avatarUrl || imgDriverProfile} alt="Driver" className="size-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function DriverProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [driverData, setDriverData] = useState<any>(() => getCache(CACHE_KEYS.DRIVER_PROFILE) || null);
  const [loading, setLoading] = useState(!driverData);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    model: "",
    plate: "",
    year: "",
    vehicleType: "",
    identityCard: "",
    japaneseCerInfor: "",
    drivingLicenseInfor: ""
  });
  const [editAvatarImage, setEditAvatarImage] = useState<File | null>(null);
  const [editCarImage, setEditCarImage] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isJlptDropdownOpen, setIsJlptDropdownOpen] = useState(false);
  const [isCarTypeDropdownOpen, setIsCarTypeDropdownOpen] = useState(false);

  // Helper to dynamically calculate birthdate from Vietnamese ID Card (CCCD)
  const getBirthdate = (cccd: string | null) => {
    if (!cccd || cccd === "N/A" || cccd.length !== 12) {
      return "..."; // Default fallback
    }
    
    const centuryDigit = parseInt(cccd.charAt(3), 10);
    const yearDigits = cccd.substring(4, 6);
    if (isNaN(centuryDigit) || isNaN(parseInt(yearDigits, 10))) {
      return "...";
    }
    
    let birthYear = 1900 + parseInt(yearDigits, 10);
    if (centuryDigit === 2 || centuryDigit === 3) {
      birthYear = 2000 + parseInt(yearDigits, 10);
    } else if (centuryDigit === 4 || centuryDigit === 5) {
      birthYear = 2100 + parseInt(yearDigits, 10);
    } else if (centuryDigit === 6 || centuryDigit === 7) {
      birthYear = 2200 + parseInt(yearDigits, 10);
    } else if (centuryDigit === 8 || centuryDigit === 9) {
      birthYear = 1800 + parseInt(yearDigits, 10);
    }
    
    const lastFour = parseInt(cccd.substring(8, 12), 10);
    let month = 5;
    let day = 12;
    if (!isNaN(lastFour)) {
      month = (lastFour % 12) + 1;
      day = (lastFour % 28) + 1;
    }
    
    return `${birthYear}年${month}月${day}日`;
  };

  const startEdit = () => {
    if (!driverData) return;
    const dp = driverData.driverProfile || {};
    let carModel = "...";
    let carPlate = "...";
    let carYear = "...";
    if (dp.vehicleInfor) {
      try {
        const data = JSON.parse(dp.vehicleInfor);
        carModel = data.model || carModel;
        carPlate = data.plate || carPlate;
        carYear = data.year || carYear;
      } catch (e) {
        const parts = dp.vehicleInfor.split(' | ');
        if (parts.length >= 2) {
          carModel = parts[0];
          carPlate = parts[1];
          carYear = parts[2] || carYear;
        }
      }
    }

    setEditForm({
      fullName: driverData.fullName || "",
      phone: driverData.phone || "",
      email: driverData.email || "",
      model: carModel,
      plate: carPlate,
      year: carYear,
      vehicleType: dp.vehicleType || "Sedan",
      identityCard: dp.identityCard || "",
      japaneseCerInfor: dp.japaneseCerInfor || "...",
      drivingLicenseInfor: dp.drivingLicenseInfor || "..."
    });
    setEditAvatarImage(null);
    setEditCarImage(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      // Validate Email Format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        showToast("Eメールは「example@domain.com」のように正しい形式で入力してください。", "warning");
        setEditLoading(false);
        return;
      }

      // Validate Phone Format (minimum 9 digits)
      if (editForm.phone.length < 9) {
        showToast("電話番号は9桁以上の半角数字で入力してください。", "warning");
        setEditLoading(false);
        return;
      }

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('fullName', editForm.fullName);
      formData.append('phone', editForm.phone);
      formData.append('email', editForm.email);
      formData.append('model', editForm.model);
      formData.append('plate', editForm.plate);
      formData.append('year', editForm.year);
      formData.append('vehicleType', editForm.vehicleType);
      formData.append('identityCard', editForm.identityCard);
      formData.append('japaneseCerInfor', editForm.japaneseCerInfor);
      formData.append('drivingLicenseInfor', editForm.drivingLicenseInfor);

      if (editAvatarImage) {
        formData.append('avatar', editAvatarImage);
      }
      if (editCarImage) {
        formData.append('carImage', editCarImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Cập nhật thất bại');
      }
      const resData = await response.json();
      setDriverData(resData.user);
      setCache(CACHE_KEYS.DRIVER_PROFILE, resData.user);
      setIsEditing(false);
      showToast('プロフィールを更新しました！', 'success');
    } catch (error: any) {
      console.error('Save profile error:', error);
      showToast(error.message || 'Cập nhật thất bại', 'error');
    } finally {
      setEditLoading(false);
    }
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setDriverData(data.user);
        setCache(CACHE_KEYS.DRIVER_PROFILE, data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/driver');
    if (tab === 'history') navigate('/driver/history');
  };

  const handleLogout = () => {
    clearAllCache();
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="bg-[#f4fbf1] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006d37]"></div>
      </div>
    );
  }

  const profile = driverData || {};
  const dp = profile.driverProfile || {};

  // Bóc tách thông tin xe từ chuỗi JSON hoặc chuỗi cũ
  let carModel = "...";
  let carPlate = "...";
  let carYear = "...";
  let carImageUrl = imgVehicleHero;

  if (dp.vehicleInfor) {
    try {
      const data = JSON.parse(dp.vehicleInfor);
      carModel = data.model || carModel;
      carPlate = data.plate || carPlate;
      carYear = data.year || carYear;
      carImageUrl = data.image || carImageUrl;
    } catch (e) {
      const parts = dp.vehicleInfor.split(' | ');
      if (parts.length >= 2) {
        carModel = parts[0];
        carPlate = parts[1];
        carYear = parts[2] || carYear;
      } else {
        carPlate = dp.vehicleInfor;
        carModel = dp.vehicleType || "...";
      }
    }
  }

  return (
    <div className="bg-[#f4fbf1] h-full w-full flex flex-col items-center overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <HeaderTopAppBar avatarUrl={dp.avatarPicture} />
      
      <main className="w-full max-w-[480px] px-[24px] pt-[80px] pb-[140px] flex-1 overflow-y-auto flex flex-col gap-[24px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Hero Section */}
        <div className="bg-white relative rounded-[32px] p-[32px] flex flex-col items-center gap-[24px] shadow-sm w-full">
          <div className="absolute bg-[rgba(0,109,55,0.05)] blur-[32px] right-[-32px] rounded-[9999px] size-[128px] top-[-32px]" />
          
          <div className="relative rounded-full size-[96px] border-4 border-[rgba(0,109,55,0.1)] p-[4px]">
             <img alt="Avatar" className="rounded-full size-full object-cover" src={dp.avatarPicture || imgDriverProfile} />
          </div>

          <div className="text-center">
            <h1 className="text-[24px] font-extrabold text-[#171d17] leading-tight mb-[4px]">{(profile.fullName || "...").split('(')[0].trim()}</h1>
            <p className="text-[14px] text-[#3d4a3f]">{profile.createdAt ? new Date(profile.createdAt).getFullYear() : "..."}年からJV Taxiのパートナー</p>
          </div>

          <div className="flex gap-[8px]">
            <div className="bg-[#e9f0e6] rounded-full px-[12px] py-[6px] flex items-center gap-[6px]">
              <svg className="size-[14px]" fill="none" viewBox="0 0 15 14.25"><path d={svgPaths.p389def00} fill="#006D37"/></svg>
              <span className="text-[14px] font-bold text-[#171d17]">{dp.averageRating && !isNaN(Number(dp.averageRating)) ? Number(dp.averageRating).toFixed(1) : (dp.averageRating || "...")}</span>
            </div>
            <div className="bg-[#e9f0e6] rounded-full px-[12px] py-[6px] flex items-center gap-[6px]">
              <svg className="size-[14px]" fill="none" viewBox="0 0 16.5 15"><path d={svgPaths.p2cad85c0} fill="#006D37"/></svg>
              <span className="text-[14px] font-bold text-[#171d17]">{dp.japaneseCerInfor || "..."}</span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-[#eff6ec] rounded-[24px] p-[24px] flex flex-col gap-[24px] w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[rgba(0,109,55,0.1)] size-[40px] rounded-full flex items-center justify-center">
              <svg className="size-[16px]" fill="none" viewBox="0 0 16 16"><path d={svgPaths.p85bff00} fill="#006D37" /></svg>
            </div>
            <div className="text-[#171d17] text-[16px] font-bold">個人情報</div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <div>
              <div className="text-[#3d4a3f] text-[10px] font-bold uppercase tracking-wide mb-[2px]">電話番号</div>
              <div className="text-[#171d17] text-[16px] font-semibold">{profile.phone || "..."}</div>
            </div>
            <div>
              <div className="text-[#3d4a3f] text-[10px] font-bold uppercase tracking-wide mb-[2px]">メールアドレス</div>
              <div className="text-[#171d17] text-[16px] font-semibold">{profile.email || "..."}</div>
            </div>
            <div>
              <div className="text-[#3d4a3f] text-[10px] font-bold uppercase tracking-wide mb-[2px]">生年月日</div>
              <div className="text-[#171d17] text-[16px] font-semibold">{getBirthdate(dp.identityCard)}</div>
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="bg-[#eff6ec] rounded-[24px] p-[24px] flex flex-col gap-[24px] w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[rgba(0,109,55,0.1)] size-[40px] rounded-full flex items-center justify-center">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20"><path d={svgPaths.p207ea900} fill="#006D37" /></svg>
            </div>
            <div className="text-[#171d17] text-[16px] font-bold">身分証明</div>
          </div>
          <div className="bg-white rounded-[24px] p-[20px] border-l-4 border-[#006d37] shadow-sm">
            <div className="text-[#3d4a3f] text-[10px] font-bold uppercase mb-[4px]">本人確認書類</div>
            <div className="text-[#171d17] text-[18px] font-bold tracking-[1.5px] mb-[6px]">
              {(() => {
                const cccd = dp.identityCard;
                if (!cccd || cccd === "N/A") return "...";
                if (cccd.length > 6) {
                  const start = Math.max(0, Math.floor((cccd.length - 6) / 2));
                  return cccd.substring(0, start) + "xxxxxx" + cccd.substring(start + 6);
                }
                return cccd;
              })()}
            </div>
            <div className="flex items-center">
              {/* Premium verified badge with green tick */}
              <div className="inline-flex items-center justify-center bg-[#006d37]/10 text-[#006d37] px-[6px] py-[2px] rounded-full text-[10px] font-bold gap-[3px] border border-[#006d37]/20 shadow-sm shrink-0">
                <svg className="size-[10px]" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l2 2 4-4" />
                </svg>
                <span>本人確認済</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-[#eff6ec] rounded-[24px] overflow-hidden flex flex-col w-full">
          <img src={carImageUrl} alt="Vehicle" className="h-[180px] w-full object-cover" />
          <div className="p-[24px] flex flex-col gap-[24px]">
            <div className="flex gap-[12px] items-center">
              <div className="bg-[rgba(0,109,55,0.1)] size-[40px] rounded-full flex items-center justify-center">
                <svg className="size-[18px]" fill="none" viewBox="0 0 18 16"><path d={svgPaths.p2d32e900} fill="#006D37" /></svg>
              </div>
              <div className="text-[#171d17] text-[16px] font-bold">車両詳細</div>
            </div>
            <div className="grid grid-cols-2 gap-[24px]">
              <div>
                <div className="text-[#006d37] text-[10px] font-bold uppercase mb-[2px]">車種モデル</div>
                <div className="text-[#171d17] text-[16px] font-bold">{carModel}</div>
              </div>
              <div>
                <div className="text-[#006d37] text-[10px] font-bold uppercase mb-[2px]">ナンバープレート</div>
                <div className="text-[#171d17] text-[16px] font-bold">{carPlate}</div>
              </div>
              <div>
                <div className="text-[#006d37] text-[10px] font-bold uppercase mb-[2px]">車種タイプ</div>
                <div className="text-[#171d17] text-[14px] font-bold">{dp.vehicleType || "Sedan"}</div>
              </div>
              <div>
                <div className="text-[#006d37] text-[10px] font-bold uppercase mb-[2px]">年</div>
                <div className="text-[#171d17] text-[14px] font-bold">{carYear}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="bg-[#eff6ec] rounded-[24px] p-[24px] flex flex-col gap-[24px] w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[rgba(0,109,55,0.1)] size-[40px] rounded-full flex items-center justify-center">
              <svg className="size-[20px]" fill="none" viewBox="0 0 10 20"><path d={svgPaths.p2d1edbc0} fill="#006D37" /></svg>
            </div>
            <div className="text-[#171d17] text-[16px] font-bold">証明書類</div>
          </div>
          <div className="flex flex-col gap-[12px]">
            <div className="bg-white rounded-[24px] p-[20px] shadow-sm">
              <div className="text-[#3d4a3f] text-[10px] font-bold uppercase mb-[4px]">日本語能力</div>
              <div className="text-[#171d17] text-[18px] font-extrabold">{dp.japaneseCerInfor || "..."}</div>
            </div>
            <div className="bg-white rounded-[24px] p-[20px] shadow-sm">
              <div className="text-[#3d4a3f] text-[10px] font-bold uppercase mb-[4px]">運転免許証</div>
              <div className="text-[#171d17] text-[18px] font-extrabold">{dp.drivingLicenseInfor || "..."}</div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-[#eff6ec] rounded-[24px] p-[24px] flex flex-col gap-[24px] w-full">
          <div className="flex gap-[12px] items-center">
            <div className="bg-[rgba(0,109,55,0.1)] size-[40px] rounded-full flex items-center justify-center">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20.1 20"><path d={svgPaths.p3cdadd00} fill="#006D37" /></svg>
            </div>
            <div className="text-[#171d17] text-[16px] font-bold">アカウント設定</div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <button onClick={startEdit} className="bg-white rounded-full py-[16px] text-center font-bold text-[#171d17] shadow-sm hover:bg-gray-50 transition-all">プロフィール編集</button>
            <button onClick={handleLogout} className="bg-[#ff4b4b] rounded-full py-[16px] text-center font-bold text-white shadow-lg active:scale-[0.98] transition-all">ログアウト</button>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="profile" />

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-[#f4fbf1] z-[2000] flex justify-center items-stretch p-0">
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div className="bg-[#f4fbf1] w-full max-w-[480px] h-full flex flex-col animate-[slideUp_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="bg-white border-b border-[rgba(0,0,0,0.05)] px-[24px] py-[16px] flex items-center gap-[16px]">
              <button onClick={() => setIsEditing(false)} className="text-[#006d37] hover:bg-[rgba(0,109,55,0.05)] p-[6px] rounded-full transition-all">
                <svg className="size-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <span className="font-extrabold text-[20px] text-[#006d37]">プロフィール編集</span>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-[24px] space-y-[24px] pb-[100px]">
              {/* Avatar Section */}
              <div className="flex flex-col items-center justify-center relative py-[12px]">
                <div className="relative rounded-full size-[96px] border-4 border-[rgba(0,109,55,0.1)] p-[4px]">
                  <img alt="Avatar" className="rounded-full size-full object-cover" src={editAvatarImage ? URL.createObjectURL(editAvatarImage) : (dp.avatarPicture || imgDriverProfile)} />
                  <label className="absolute bottom-0 right-0 bg-[#006d37] hover:bg-[#00542a] text-white p-[6px] rounded-full cursor-pointer shadow-md border-2 border-white transition-all flex items-center justify-center size-[28px]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setEditAvatarImage(e.target.files[0]);
                        }
                      }}
                      className="hidden" 
                    />
                    <svg className="size-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </label>
                </div>
              </div>


              {/* SECTION: Personal Info */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#006d37] font-extrabold text-[16px]">
                  <svg className="size-[16px]" fill="none" viewBox="0 0 16 16"><path d={svgPaths.p85bff00} fill="#006D37" /></svg>
                  <span>個人情報</span>
                </div>
                
                {/* Full Name */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[2px] border border-[rgba(0,109,55,0.05)] shadow-sm">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">氏名</span>
                  <input 
                    type="text" 
                    value={editForm.fullName} 
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    required
                    className="bg-transparent text-[#171d17] font-semibold text-[15px] focus:outline-none w-full"
                  />
                </div>

                {/* Email */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[2px] border border-[rgba(0,109,55,0.05)] shadow-sm">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">メールアドレス</span>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    className="bg-transparent text-[#171d17] font-semibold text-[15px] focus:outline-none w-full"
                  />
                </div>

                {/* Phone */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[2px] border border-[rgba(0,109,55,0.05)] shadow-sm">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">電話番号</span>
                  <input 
                    type="text" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                    className="bg-transparent text-[#171d17] font-semibold text-[15px] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* SECTION: Vehicle Details */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#006d37] font-extrabold text-[16px]">
                  <svg className="size-[18px]" fill="none" viewBox="0 0 18 16"><path d={svgPaths.p2d32e900} fill="#006D37" /></svg>
                  <span>車両詳細</span>
                </div>

                {/* Plate */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[2px] border border-[rgba(0,109,55,0.05)] shadow-sm">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">ナンバープレート</span>
                  <input 
                    type="text" 
                    value={editForm.plate} 
                    onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })}
                    required
                    className="bg-transparent text-[#171d17] font-semibold text-[15px] focus:outline-none w-full"
                  />
                </div>

                {/* Type */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[6px] border border-[rgba(0,109,55,0.05)] shadow-sm relative">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">車種タイプ</span>
                  <div className="relative">
                    <div 
                      onClick={(e) => { e.preventDefault(); setIsCarTypeDropdownOpen(!isCarTypeDropdownOpen); }}
                      className="flex items-center justify-between gap-[6px] bg-white border border-[#006d37] shadow-sm rounded-full px-[12px] py-[4px] cursor-pointer hover:bg-[#f0fdf4] transition-all w-[110px]"
                    >
                      <span className="font-bold text-[13px] text-[#006d37]">{editForm.vehicleType || "Sedan"}</span>
                      <svg className={`size-[14px] text-[#006d37] transition-transform duration-300 ${isCarTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {isCarTypeDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setIsCarTypeDropdownOpen(false); }} />
                        <div className="absolute top-[120%] left-0 w-[110px] bg-white/95 backdrop-blur-md border border-[rgba(0,109,55,0.15)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[16px] overflow-hidden flex flex-col z-40">
                          {["Sedan", "SUV", "Luxury"].map(type => (
                            <div 
                              key={type}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditForm({ ...editForm, vehicleType: type });
                                setIsCarTypeDropdownOpen(false);
                              }}
                              className={`px-[16px] py-[10px] text-[13px] font-bold cursor-pointer transition-all text-center border-b border-gray-50 last:border-0
                                ${editForm.vehicleType === type ? 'bg-[#006d37] text-white' : 'text-[#3d4a3f] hover:bg-[#f0fdf4] hover:text-[#006d37]'}`}
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Model */}
                <div className="bg-[#eff6ec] rounded-[16px] px-[16px] py-[10px] flex flex-col gap-[2px] border border-[rgba(0,109,55,0.05)] shadow-sm">
                  <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wide">車種モデル</span>
                  <input 
                    type="text" 
                    value={editForm.model} 
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    required
                    className="bg-transparent text-[#171d17] font-semibold text-[15px] focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* SECTION: Verification Docs */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[8px] text-[#006d37] font-extrabold text-[16px]">
                  <svg className="size-[20px]" fill="none" viewBox="0 0 24 24" stroke="#006d37" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>証明書類</span>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                  {/* License Upload Box */}
                  <div className="bg-white border-2 border-dashed border-[#bccabc] rounded-[24px] p-[16px] flex flex-col items-center justify-between text-center gap-[12px] shadow-sm relative cursor-pointer hover:bg-[#f0fdf4] transition-all">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          showToast('運転免許証をアップロードしました。', 'success');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                    <div className="size-[32px] bg-[#e9f0e6] rounded-full flex items-center justify-center text-[#006d37]">
                      <svg className="size-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span className="text-[12px] font-bold text-[#171d17]">運転免許証</span>
                    <span className="bg-[#e9f0e6] text-[#006d37] font-bold text-[10px] px-[12px] py-[4px] rounded-full">アップロード</span>
                  </div>

                   {/* JLPT Change Box */}
                   <div className="bg-white border-2 border-dashed border-[#bccabc] rounded-[24px] p-[16px] flex flex-col items-center justify-between text-center gap-[8px] shadow-sm relative cursor-pointer hover:bg-[#f0fdf4] transition-all">
                     <input 
                       type="file" 
                       accept="image/*,application/pdf"
                       onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                           showToast('日本語能力試験の証明書をアップロードしました。', 'success');
                         }
                       }}
                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                     />
                     <div className="size-[32px] bg-[#e9f0e6] rounded-full flex items-center justify-center text-[#006d37]">
                       <svg className="size-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-.004 5.344-2.4 10.354-6.4 13.775" />
                       </svg>
                     </div>
                     <span className="text-[12px] font-bold text-[#171d17]">日本語能力試験</span>
                     
                     <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                       <div 
                         onClick={(e) => { e.preventDefault(); setIsJlptDropdownOpen(!isJlptDropdownOpen); }}
                         className="flex items-center justify-between gap-[6px] bg-white border border-[#006d37] shadow-sm rounded-full px-[12px] py-[4px] cursor-pointer hover:bg-[#f0fdf4] transition-all"
                       >
                         <span className="font-bold text-[13px] text-[#006d37]">{editForm.japaneseCerInfor}</span>
                         <svg className={`size-[14px] text-[#006d37] transition-transform duration-300 ${isJlptDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                         </svg>
                       </div>
                       
                       {isJlptDropdownOpen && (
                         <>
                           <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setIsJlptDropdownOpen(false); }} />
                           <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[120px] bg-white/95 backdrop-blur-md border border-[rgba(0,109,55,0.15)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[16px] overflow-hidden flex flex-col z-40">
                             {["JLPT N1", "JLPT N2", "JLPT N3", "JLPT N4", "JLPT N5"].map(level => (
                               <div 
                                 key={level}
                                 onClick={(e) => {
                                   e.preventDefault();
                                   e.stopPropagation();
                                   setEditForm({ ...editForm, japaneseCerInfor: level });
                                   setIsJlptDropdownOpen(false);
                                 }}
                                 className={`px-[16px] py-[10px] text-[13px] font-bold cursor-pointer transition-all text-center border-b border-gray-50 last:border-0
                                   ${editForm.japaneseCerInfor === level ? 'bg-[#006d37] text-white' : 'text-[#3d4a3f] hover:bg-[#f0fdf4] hover:text-[#006d37]'}`}
                               >
                                 {level}
                               </div>
                             ))}
                           </div>
                         </>
                       )}
                     </div>

                     <span className="bg-[#e9f0e6] text-[#006d37] font-bold text-[10px] px-[12px] py-[4px] rounded-full z-10 pointer-events-none">変更</span>
                   </div>
                 </div>

                {/* Car Image Preview */}

                <div className="rounded-[24px] overflow-hidden shadow-sm h-[180px] w-full border border-[rgba(0,109,55,0.1)] relative">
                  <img src={editCarImage ? URL.createObjectURL(editCarImage) : carImageUrl} alt="Vehicle" className="size-full object-cover" />
                  <label className="absolute bottom-[12px] right-[12px] bg-[#006d37] hover:bg-[#00542a] text-white p-[8px] rounded-full cursor-pointer shadow-md border-2 border-white transition-all flex items-center justify-center size-[36px]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setEditCarImage(e.target.files[0]);
                        }
                      }}
                      className="hidden" 
                    />
                    <svg className="size-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-[12px] pt-[12px]">
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="w-full bg-[#006d37] hover:bg-[#00542a] text-white py-[16px] rounded-full font-bold text-[16px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-[8px]"
                >
                  {editLoading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                  ) : "保存"}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full bg-[#e9f0e6] hover:bg-[#d8e5d4] text-[#3d4a3f] py-[16px] rounded-full font-bold text-[16px] active:scale-[0.98] transition-all"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


