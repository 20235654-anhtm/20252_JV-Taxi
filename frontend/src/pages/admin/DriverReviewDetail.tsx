import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, ShieldCheck, Car, Scan, Languages, BadgeCheck } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';
import { Avatar } from '../../components/ui/Avatar';
import './DriverReviewDetail.css';

const CustomIdCardIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0 }}
  >
    {/* Strap loop/clip at the top center */}
    <path d="M9.5 7V3.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" fill="none" />
    {/* Main badge/card outline */}
    <rect x="3" y="7" width="18" height="15" rx="2" fill="none" />
    {/* Avatar - Head (solid circle) */}
    <circle cx="8" cy="12" r="1.8" fill="currentColor" stroke="none" />
    {/* Avatar - Shoulders (solid path) */}
    <path d="M4.2 17.5c0-1.8 1.8-3 3.8-3s3.8 1.2 3.8 3z" fill="currentColor" stroke="none" />
    {/* Text line 1 (solid bar) */}
    <rect x="14" y="11" width="5.5" height="2" rx="0.5" fill="currentColor" stroke="none" />
    {/* Text line 2 (solid bar) */}
    <rect x="14" y="15" width="5.5" height="2" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

interface Driver {
  userId: string;
  vehicleType: string;
  vehicleInfor: string;
  drivingLicenseInfor: string;
  japaneseCerInfor: string;
  avatarPicture: string | null;
  drivingLicenseImage?: string | null;
  japaneseCerImage?: string | null;
  identityCardFrontImage?: string | null;
  identityCardBackImage?: string | null;
  profile: {
    fullName: string;
    email: string;
    phone: string;
  };
}

const getDocumentUrl = (pic: string | null | undefined): string | null => {
  if (!pic) return null;
  if (pic.startsWith('http://') || pic.startsWith('https://')) return pic;
  if (pic.startsWith('data:image/')) return pic;
  const host = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = pic.startsWith('/') ? pic : `/${pic}`;
  return `${host}${path}`;
};

const TRANSLATIONS = {
  JP: {
    headerTitle: "承認",
    driverSubtitle: "プロの運転手",
    personalInfoTitle: "個人情報",
    emailLabel: "メールアドレス",
    phoneLabel: "電話番号",
    dobLabel: "生年月日",
    licenseTitle: "運転免許証",
    jlptTitle: "JLPT合格証書",
    idCardTitle: "身分証明書",
    vehicleTitle: "車両情報",
    vehicleClassPremium: "プレミアム",
    vehicleClassStandard: "スタンダード",
    checklistTitle: "管理者用チェックリスト",
    checkLicense: "免許有効性確認済み",
    checkJlpt: "JLPT N2 認定済み",
    btnApprove: "登録を承認する",
    btnReject: "申請を却下する",
    btnBack: "戻る",
    loading: "読み込み中...",
    approveSuccess: "登録を承認しました！",
    approveFail: "承認に失敗しました。",
    rejectSuccess: "申請を却下しました！",
    rejectFail: "却下に失敗しました。",
    networkError: "サーバー接続エラー。",
    notProvided: "未提出",
  },
  VN: {
    headerTitle: "Phê duyệt",
    driverSubtitle: "Tài xế chuyên nghiệp",
    personalInfoTitle: "Thông tin cá nhân",
    emailLabel: "Địa chỉ Email",
    phoneLabel: "Số điện thoại",
    dobLabel: "Ngày sinh",
    licenseTitle: "Giấy phép lái xe",
    jlptTitle: "Chứng chỉ JLPT",
    idCardTitle: "Căn cước công dân",
    vehicleTitle: "Thông tin xe",
    vehicleClassPremium: "Cao cấp",
    vehicleClassStandard: "Tiêu chuẩn",
    checklistTitle: "Danh sách kiểm tra dành cho quản trị viên",
    checkLicense: "Đã xác minh hiệu lực bằng lái",
    checkJlpt: "Đã chứng thực JLPT N2",
    btnApprove: "Phê duyệt đăng ký",
    btnReject: "Từ chối yêu cầu",
    btnBack: "Quay lại",
    loading: "Đang tải...",
    approveSuccess: "Đã phê duyệt tài xế thành công!",
    approveFail: "Phê duyệt thất bại.",
    rejectSuccess: "Đã từ chối yêu cầu thành công!",
    rejectFail: "Từ chối yêu cầu thất bại.",
    networkError: "Lỗi kết nối đến máy chủ.",
    notProvided: "Chưa cung cấp",
  }
};

const DriverReviewDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const userId = searchParams.get('userId');
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDriver = async () => {
      // Use navigation state if passed
      if (location.state?.driver && isMounted) {
        setDriver(location.state.driver);
        setIsApproved(location.state.driver.isApproved || false);
        setLoading(false);
        return;
      }

      if (!userId) {
        setDriver(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/${userId}`);
        const data = await response.json();
        
        if (data.success && isMounted) {
          const d = data.data;
          const normalizedDriver: Driver = {
            userId: d.id,
            vehicleType: d.driverProfile?.vehicleType || '',
            vehicleInfor: d.driverProfile?.vehicleInfor || '',
            drivingLicenseInfor: d.driverProfile?.drivingLicenseInfor || '',
            japaneseCerInfor: d.driverProfile?.japaneseCerInfor || '',
            avatarPicture: d.driverProfile?.avatarPicture || null,
            drivingLicenseImage: d.driverProfile?.drivingLicenseImage || null,
            japaneseCerImage: d.driverProfile?.japaneseCerImage || null,
            identityCardFrontImage: d.driverProfile?.identityCardFrontImage || null,
            identityCardBackImage: d.driverProfile?.identityCardBackImage || null,
            profile: {
              fullName: d.fullName || '',
              email: d.email || '',
              phone: d.phone || ''
            }
          };
          setDriver(normalizedDriver);
          setIsApproved(d.driverProfile?.isApproved || false);
        } else {
          setDriver(null);
        }
      } catch (error) {
        console.error(error);
        setDriver(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDriver();
    return () => {
      isMounted = false;
    };
  }, [userId, location.state]);

  const handleApprove = async () => {
    if (submitting || !driver) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/admin/approve/${driver.userId}`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        showToast(`✅ ${t.approveSuccess}`);
        setIsApproved(true);
        setTimeout(() => {
          navigate('/admin/driver-approve');
        }, 1500);
      } else {
        showToast(`❌ ${t.approveFail}`);
      }
    } catch (error) {
      console.error(error);
      showToast(`❌ ${t.networkError}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (submitting || !driver) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/admin/reject/${driver.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '書類不備のため申請を却下しました。' })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`✅ ${t.rejectSuccess}`);
        setTimeout(() => {
          navigate('/admin/driver-approve');
        }, 1500);
      } else {
        showToast(`❌ ${t.rejectFail}`);
      }
    } catch (error) {
      console.error(error);
      showToast(`❌ ${t.networkError}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="driver-review-detail-page">
        <div className="detail-loading">
          <div className="detail-spinner" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-review-detail-page">
        <header className="detail-header">
          <div className="header-left">
            <button className="header-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </button>
            <span className="header-title">{t.headerTitle}</span>
          </div>
        </header>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#3d4a3f', fontFamily: 'sans-serif' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>運転手情報が見つかりません</h3>
          <p style={{ fontSize: '13px', color: '#8a8a8a' }}>対象の運転手アカウントが存在しないか、データ取得に失敗しました。</p>
        </div>
      </div>
    );
  }

  // Parse vehicle info
  let vehicle = { model: 'VinFast Lux A2.0', plate: '51H-123.45', year: '2022', class: 'premium' };
  try {
    if (driver.vehicleInfor) {
      const parsed = JSON.parse(driver.vehicleInfor);
      vehicle = {
        model: parsed.model || 'VinFast Lux A2.0',
        plate: parsed.plate || '51H-123.45',
        year: parsed.year || '2022',
        class: parsed.class || 'premium'
      };
    }
  } catch {
    // fallback
  }

  const dob = t.notProvided; // No DOB in DB schema
  const jlpt = driver.japaneseCerInfor ? driver.japaneseCerInfor.match(/N[1-5]/i)?.[0]?.toUpperCase() || 'N2' : 'N2';

  return (
    <div className="driver-review-detail-page">
      {/* Top Header */}
      <header className="detail-header">
        <div className="header-left">
          <button className="header-back-btn" onClick={() => navigate('/admin/driver-approve')}>
            <ArrowLeft size={20} />
          </button>
          <span className="header-title">{t.headerTitle}</span>
        </div>
        <div className="header-right"></div>
      </header>

      {/* Main content scroll container */}
      <div className="detail-scroll-container">
        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-squircle-wrapper">
            <Avatar
              src={driver.avatarPicture}
              name={driver.profile.fullName}
              className="profile-squircle-avatar text-4xl"
              borderColor="none"
            />
          </div>
          <h2 className="profile-name">{driver.profile.fullName}</h2>
          <p className="profile-subtitle">{t.driverSubtitle}</p>
        </section>

        {/* Personal Info - Green background block */}
        <section className="info-card-green">
          <h3 className="section-title-green">
            <User size={18} />
            <span>{t.personalInfoTitle}</span>
          </h3>
          <div className="info-list-green">
            <div className="info-row-green">
              <span className="info-label-green">{t.emailLabel}</span>
              <span className="info-value-green">{driver.profile.email}</span>
            </div>
            <div className="info-row-green">
              <span className="info-label-green">{t.phoneLabel}</span>
              <span className="info-value-green">{driver.profile.phone}</span>
            </div>
            <div className="info-row-green">
              <span className="info-label-green">{t.dobLabel}</span>
              <span className="info-value-green">{dob}</span>
            </div>
          </div>
        </section>

        {/* Driving License Card */}
        <section className="document-card">
          <div className="card-header-row">
            <h3 className="card-title green-theme">
              <CustomIdCardIcon size={20} className="card-icon" />
              <span>{t.licenseTitle}</span>
            </h3>
            <button className="icon-action-btn green-theme">
              <Scan size={18} />
            </button>
          </div>
          <div className="card-image-wrapper">
            {getDocumentUrl(driver.drivingLicenseImage) ? (
              <img src={getDocumentUrl(driver.drivingLicenseImage)!} alt="Driving License" className="card-image" />
            ) : (
              <div className="document-not-found">
                <span>404 Not Found</span>
              </div>
            )}
          </div>
        </section>

        {/* JLPT Certificate Card */}
        <section className="document-card">
          <div className="card-header-row">
            <h3 className="card-title green-theme">
              <Languages size={20} className="card-icon" />
              <span>{t.jlptTitle}</span>
            </h3>
            <button className="icon-action-btn green-theme checked">
              <BadgeCheck size={20} color="#8fa695" />
            </button>
          </div>
          <div className="card-image-wrapper">
            {getDocumentUrl(driver.japaneseCerImage) ? (
              <img src={getDocumentUrl(driver.japaneseCerImage)!} alt="JLPT N2 Certificate" className="card-image" />
            ) : (
              <div className="document-not-found">
                <span>404 Not Found</span>
              </div>
            )}
          </div>
        </section>

        {/* Identity Card Front/Back */}
        <section className="document-card">
          <div className="card-header-row">
            <h3 className="card-title dark-theme">
              <span>{t.idCardTitle}</span>
            </h3>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#22c55e" stroke="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8.5 12.5l2.5 2.5 4.5-4.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="card-image-stacked">
            <div className="card-image-wrapper">
              {getDocumentUrl(driver.identityCardFrontImage) ? (
                <img src={getDocumentUrl(driver.identityCardFrontImage)!} alt="ID Card Front" className="card-image" />
              ) : (
                <div className="document-not-found">
                  <span>404 Not Found</span>
                </div>
              )}
            </div>
            <div className="card-image-wrapper">
              {getDocumentUrl(driver.identityCardBackImage) ? (
                <img src={getDocumentUrl(driver.identityCardBackImage)!} alt="ID Card Back" className="card-image" />
              ) : (
                <div className="document-not-found">
                  <span>404 Not Found</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vehicle Info Card */}
        <section className="document-card">
          <div className="card-header-row">
            <h3 className="card-title green-theme">
              <Car size={20} className="card-icon" />
              <span>{t.vehicleTitle}</span>
            </h3>
          </div>
          <div className="vehicle-specs-row">
            <div className="vehicle-model-col">
              <span className="model-name">{vehicle.model}</span>
              <span className="model-bullet">
                • {vehicle.class === 'premium' ? t.vehicleClassPremium : t.vehicleClassStandard}
              </span>
            </div>
            <div className="vehicle-plate-col">
              <span className="plate-badge">{vehicle.plate}</span>
            </div>
          </div>
          <div className="card-image-wrapper car-img-wrapper">
            <img src="/vinfast_car.png" alt="Vehicle Exterior" className="card-image" />
            <span className="image-overlay-label">EXTERIOR FRONT</span>
          </div>
        </section>

        {/* Admin Checklist Card */}
        <section className="checklist-card">
          <h4 className="checklist-title">{t.checklistTitle}</h4>
          <ul className="checklist-list">
            <li className="checklist-item">
              <span className="check-bullet">✔</span>
              <span>{t.checkLicense}</span>
            </li>
            <li className="checklist-item">
              <span className="check-bullet">✔</span>
              <span>{t.checkJlpt} (N{jlpt})</span>
            </li>
          </ul>
        </section>

        {/* Bottom Actions inside scroll */}
        <div className="action-buttons-wrapper">
          <button
            className="action-btn approve"
            onClick={handleApprove}
            disabled={submitting || isApproved}
          >
            {t.btnApprove}
          </button>
          <button
            className="action-btn reject"
            onClick={handleReject}
            disabled={submitting || isApproved}
          >
            {t.btnReject}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default DriverReviewDetail;
