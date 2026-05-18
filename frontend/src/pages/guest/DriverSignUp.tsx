import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from "./svg-6k5pihgtjb";
import imgDriverRegistration from "./98b93cf9247a1a1d9ae9842376a80cf8c192fa1a.png";

const TRANSLATIONS = {
  JP: {
    headerTitle: "JV - Taxi",
    mainTitle: "ドライバーとして登録",
    heroDesc1: "私たちのエリートドライバーの輪に加わりましょう。 ",
    heroDesc2: "ベトナムで日本基準のサービスを提供します。",
    identity: "身分証明",
    fullName: "フルネーム",
    namePlaceholder: "氏名を入力",
    phone: "電話番号",
    phonePlaceholder: "電話番号を入力",
    email: "メールアドレス",
    emailPlaceholder: "メールアドレスを入力",
    pass: "パスワード",
    passPlaceholder: "最小8文字以上",
    vehicle: "車両詳細",
    carType: "車種モデル",
    carSedan: "セダン",
    carSUV: "SUV",
    carEV: "EV",
    vehicleType: "車種タイプ",
    vehicleTypePlaceholder: "Toyota Vios",
    licensePlate: "ナンバープレート",
    platePlaceholder: "ABC-12345",
    year: "年",
    yearPlaceholder: "2022",
    docsHeader: "証明書類",
    drivingLicense: "運転免許証",
    licensePlaceholder: "B2",
    jlpt: "日本語能力",
    jlptPlaceholder: "JLPT N3",
    imageHeader: "画像",
    uploadImage: "画像をアップロード",
    docsSubmitHeader: "書類提出",
    uploadLicense: "運転免許証をアップロード",
    uploadDocs: "書類をアップロード (免許証、登録証、保険...)",
    submit: "ドライバーとして登録",
    cccd: "本人確認書類",
    cccdPlaceholder: "079xxxxxx889",
  },
  VN: {
    headerTitle: "JV - Taxi",
    mainTitle: "Đăng ký làm Tài xế",
    heroDesc1: "Gia nhập đội ngũ tài xế chọn lọc của chúng tôi. ",
    heroDesc2: "Mang đến dịch vụ tiêu chuẩn Nhật Bản tại Việt Nam.",
    identity: "Thông tin cá nhân",
    fullName: "Họ và tên",
    namePlaceholder: "Nhập họ và tên",
    phone: "Số điện thoại",
    phonePlaceholder: "Nhập số điện thoại",
    email: "Địa chỉ Email",
    emailPlaceholder: "Nhập email",
    pass: "Mật khẩu",
    passPlaceholder: "Tối thiểu 8 ký tự",
    vehicle: "Chi tiết xe",
    carType: "Loại xe",
    carSedan: "Sedan",
    carSUV: "SUV",
    carEV: "EV",
    vehicleType: "Dòng xe",
    vehicleTypePlaceholder: "Toyota Vios",
    licensePlate: "Biển số xe",
    platePlaceholder: "ABC-12345",
    year: "Năm sản xuất",
    yearPlaceholder: "2022",
    docsHeader: "Tài liệu chứng minh",
    drivingLicense: "Bằng lái xe",
    licensePlaceholder: "B2",
    jlpt: "Năng lực tiếng Nhật",
    jlptPlaceholder: "JLPT N3",
    imageHeader: "Hình ảnh",
    uploadImage: "Tải ảnh lên",
    docsSubmitHeader: "Nộp hồ sơ",
    uploadLicense: "Tải lên bằng lái xe",
    docs: "Nộp hồ sơ",
    uploadDocs: "Tải lên tài liệu (Bằng lái, Đăng ký xe, Bảo hiểm...)",
    submit: "Đăng ký làm tài xế",
    cccd: "Số CCCD/CMND",
    cccdPlaceholder: "079xxxxxx889",
  },
};

function DriverRegistration() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Driver Registration">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[178.12%] left-0 max-w-none top-[-39.06%] w-full" src={imgDriverRegistration} />
      </div>
    </div>
  );
}

function Frame() {
  return <div className="relative shrink-0 size-[100px]" />;
}

function Heading({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[30px] text-white tracking-[-0.75px] w-full">
        <p className="leading-[36px]">{t.mainTitle}</p>
      </div>
    </div>
  );
}

function Container1() {
  return <div className="h-[20px] relative shrink-0 w-full" data-name="Container" />;
}

function Background({ t }: { t: any }) {
  return (
    <div className="absolute bg-gradient-to-t content-stretch flex flex-col from-[rgba(0,0,0,0.6)] inset-0 items-start justify-end p-[24px] to-[rgba(0,0,0,0)]" data-name="Background">
      <Frame />
      <Heading t={t} />
      <Container1 />
    </div>
  );
}

function Container({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <DriverRegistration />
      <Background t={t} />
    </div>
  );
}

function Paragraph({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col h-[85px] items-start relative shrink-0 w-full" data-name="Paragraph">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[78px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[16px] w-full whitespace-pre-wrap">
        <p className="leading-[26px] mb-0">{t.heroDesc1}</p>
        <p className="leading-[26px]">{t.heroDesc2}</p>
      </div>
    </div>
  );
}

function HeroSection({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Hero Section">
      <Container t={t} />
      <Paragraph t={t} />
    </div>
  );
}

function Heading1({ label }: { label: string }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="content-stretch flex flex-col items-start px-[4px] relative size-full">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,109,55,0.6)] tracking-[1.2px] uppercase w-full">
          <p className="leading-[16px]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, onBlur, error }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; onBlur?: () => void; error?: boolean }) {
  return (
    <div className="bg-[#eff6ec] col-1 justify-self-stretch relative rounded-[24px] self-start shrink-0 w-full" data-name="Input Field">
      <div className="content-stretch flex flex-col gap-[4px] items-start p-[20px] relative size-full">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
            <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#171d17] text-[14px] w-full">
              <p className="leading-[20px]">{label}</p>
            </div>
          </div>
        </div>
        <div className={`content-stretch flex items-start justify-center overflow-clip pt-px relative shrink-0 w-full border-b ${error ? 'border-red-500' : 'border-transparent'}`} data-name="Input">
          <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip pb-[2px] relative" data-name="Container">
            <input 
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              className="bg-transparent border-none outline-none font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[#171d17] text-[16px] w-full placeholder-[#bccabc]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ t, value, onChange, error, showPass, onTogglePass }: { t: any; value: string; onChange: (v: string) => void; error?: boolean; showPass: boolean; onTogglePass: () => void }) {
  return (
    <div className="bg-[#eff6ec] relative rounded-[24px] shrink-0 w-full" data-name="Password Field">
      <div className="gap-x-[4px] gap-y-[4px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(2,fit-content(100%))] p-[20px] relative size-full">
        <div className="col-1 content-stretch flex flex-col items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Label">
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
            <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#171d17] text-[14px] w-full">
              <p className="leading-[20px]">{t.pass}</p>
            </div>
          </div>
        </div>
        <div className={`col-1 content-stretch flex items-start justify-center justify-self-stretch overflow-clip pb-[2px] pt-px relative row-2 self-start shrink-0 border-b ${error ? 'border-red-500' : 'border-transparent'}`} data-name="Input">
          <input 
            type={showPass ? "text" : "password"}
            placeholder={t.passPlaceholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-none outline-none font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium text-[#171d17] text-[16px] w-full placeholder-[#bccabc]"
          />
        </div>
        <button onClick={onTogglePass} className="absolute right-[20px] bottom-[22px] flex items-center justify-center text-[#6D7A6E] hover:text-[#006d37] transition-colors outline-none focus:outline-none" data-name="Icon">
          {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
    </div>
  );
}

function CarTypeButton({ label, selected, onClick, iconPath }: { label: string; selected: boolean; onClick: () => void; iconPath: string }) {
  return (
    <button type="button" onClick={onClick} className={`${selected ? 'bg-white' : 'bg-[#dde5db] opacity-60'} flex-[1_0_0] min-w-px relative rounded-[8px] transition-all`} data-name="Button">
      <div aria-hidden="true" className={`absolute border-2 ${selected ? 'border-[#006d37]' : 'border-transparent'} border-solid inset-0 pointer-events-none rounded-[8px]`} />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[10px] py-[14px] relative size-full">
          <div className="relative shrink-0" data-name="Margin">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[4px] relative size-full">
              <div className="h-[16px] relative shrink-0 w-[18px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 16">
                  <path d={iconPath} fill={selected ? "#006D37" : "#3D4A3F"} />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative shrink-0" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative size-full">
              <div className={`flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 ${selected ? 'text-[#006d37]' : 'text-[#3d4a3f]'} text-[10px] text-center w-fit px-1`}>
                <p className="leading-[15px]">{label}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function FileUploadCard({ label, files, setFiles, iconPath, multiple = true, width = "w-full", accept }: { label: string; files: File[]; setFiles: (files: File[]) => void; iconPath?: string; multiple?: boolean; width?: string; accept?: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (multiple) {
      // Append new files to existing list
      setFiles((prev) => [...prev, ...selected]);
    } else {
      // Replace existing file
      setFiles(selected.slice(0, 1));
    }
    // Reset input value so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const previewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
    // We don't revoke here because it might close the tab if we do it too fast, 
    // but in a production app you'd want to manage this carefully.
  };

  return (
    <div className="w-full">
      <button
        type="button"
        className={`content-stretch flex flex-col items-start relative shrink-0 ${width} hover:brightness-95 transition-all`}
        data-name="Container"
        onClick={handleClick}
      >
        <div className="bg-[#eff6ec] content-stretch flex flex-col h-[160px] items-center justify-center p-[2px] relative rounded-[24px] w-full" data-name="Background+Border">
          <div aria-hidden="true" className="absolute border-2 border-[#bccabc] border-dashed inset-0 pointer-events-none rounded-[24px]" />
          <div className="h-[60px] relative shrink-0 w-[48px]" data-name="Margin">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[12px] relative size-full">
              <div className="bg-[rgba(0,109,55,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[48px]" data-name="Overlay">
                <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
                    <path d={iconPath || svgPaths.p11fdd840} fill="var(--fill-0, #006D37)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
              <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[15px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[14px] tracking-[-0.5px] uppercase w-fit px-2" data-name="Label">
                <p className="leading-[15px]">{label}</p>
              </div>
            </div>
          </div>
        </div>
      </button>
      {/* Hidden file input for multiple selection */}
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {/* Display selected file names if any */}
      {files && files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, idx) => (
            <li key={idx} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-[#006d37]/10 group transition-all hover:bg-white/80">
              <div 
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => previewFile(file)}
                title="Click to preview"
              >
                <div className="size-8 rounded-lg bg-[#006d37]/10 flex items-center justify-center">
                  <svg className="size-4 text-[#006d37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#171d17] truncate max-w-[200px]">{file.name}</span>
                  <span className="text-[10px] text-[#3d4a3f] opacity-60">Click to preview</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => removeFile(idx)}
                className="size-8 rounded-lg flex items-center justify-center text-[#3d4a3f] hover:text-red-500 hover:bg-red-50 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeaderTopAppBar({ onBack, t }: { onBack: () => void; t: any }) {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] content-stretch flex h-[64px] items-center left-0 px-[24px] top-0 w-full z-50 border-b border-[rgba(0,0,0,0.05)]" data-name="Header - TopAppBar">
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
        <button onClick={onBack} className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-all" data-name="Button">
          <div className="relative shrink-0 size-[16px]" data-name="Container">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p300a1100} fill="var(--fill-0, #006D37)" />
            </svg>
          </div>
        </button>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-fit" data-name="Container">
          <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#065f46] text-[20px] w-fit">
            <p className="leading-[28px]">{t.headerTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverSignUp() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    pass: "", 
    carType: "Sedan", 
    vehicleType: "", 
    plate: "", 
    year: "", 
    drivingLicense: "", 
    jlpt: "",
    cccd: ""
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  // State for uploaded files
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [licenseFiles, setLicenseFiles] = useState<File[]>([]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name) newErrors.name = true;
    if (!phoneRegex.test(form.phone)) newErrors.phone = true;
    if (!emailRegex.test(form.email)) newErrors.email = true;
    if (form.pass.length < 8) newErrors.pass = true;
    if (!form.cccd) newErrors.cccd = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isInvalid = (field: string) => {
    if (errors[field]) return true;
    const val = field === 'email' ? form.email : form.phone;
    if (val !== "") {
      if (field === 'email') return !emailRegex.test(val);
      if (field === 'phone') return !phoneRegex.test(val);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.pass);
      formData.append('fullName', form.name);
      formData.append('role', 'DRIVER');
      formData.append('carType', form.carType);
      formData.append('vehicleType', form.vehicleType);
      formData.append('plate', form.plate);
      formData.append('year', form.year);
      formData.append('drivingLicense', form.drivingLicense);
      formData.append('jlpt', form.jlpt);
      formData.append('cccd', form.cccd);
      // Append files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      licenseFiles.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        // Let browser set the correct multipart boundary
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Save token and user info
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      navigate('/login');
    } catch (err: any) {
      console.error("Driver signup error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-center relative size-full min-h-screen overflow-x-hidden" data-name="Driver Sign Up">
      <HeaderTopAppBar onBack={() => navigate(-1)} t={t} />
      
      <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[672px] pb-[144px] pt-[96px] px-[24px] relative w-full" data-name="Main">
        <HeroSection t={t} />
        
        <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Form Section">
          {/* Identity Section */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Personal Information Bento Group">
            <Heading1 label={t.identity} />
            <div className="gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(1,minmax(0,1fr))] grid-rows-[__103px_103px] relative shrink-0 w-full" data-name="Container">
              <InputField label={t.fullName} placeholder={t.namePlaceholder} value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
              <InputField label={t.phone} placeholder={t.phonePlaceholder} value={form.phone} onChange={(v) => {
                const val = v.replace(/[^0-9+]/g, '');
                setForm({ ...form, phone: val });
                if (phoneRegex.test(val)) setErrors((prev) => ({ ...prev, phone: false }));
              }} error={isInvalid('phone')} />
            </div>
            <InputField label={t.cccd} placeholder={t.cccdPlaceholder} value={form.cccd} onChange={(v) => {
              const val = v.replace(/[^0-9]/g, '');
              setForm({ ...form, cccd: val });
              if (val) setErrors((prev) => ({ ...prev, cccd: false }));
            }} error={errors.cccd} />
            <InputField label={t.email} placeholder={t.emailPlaceholder} value={form.email} onChange={(v) => {
              setForm({ ...form, email: v });
              if (emailRegex.test(v)) setErrors((prev) => ({ ...prev, email: false }));
            }} error={isInvalid('email')} />
            <PasswordField t={t} value={form.pass} onChange={(v) => setForm({ ...form, pass: v })} error={errors.pass} showPass={showPass} onTogglePass={() => setShowPass(!showPass)} />
          </div>

          {/* Vehicle Section */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Vehicle Details Group">
            <Heading1 label={t.vehicle} />
            <div className="flex flex-col gap-[16px] relative shrink-0 w-full" data-name="Container">
              <div className="bg-[#eff6ec] col-1 justify-self-stretch relative rounded-[24px] self-start shrink-0 w-full" data-name="Vehicle Type Selector">
                <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative size-full">
                  <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[12px] tracking-[-0.5px] uppercase w-full">
                    <p className="leading-[15px]">{t.carType}</p>
                  </div>
                  <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full">
                    <CarTypeButton label={t.carSedan} selected={form.carType === 'Sedan'} onClick={() => setForm({ ...form, carType: 'Sedan' })} iconPath={svgPaths.p2d32e900} />
                    <CarTypeButton label={t.carSUV} selected={form.carType === 'SUV'} onClick={() => setForm({ ...form, carType: 'SUV' })} iconPath={svgPaths.p27f99400} />
                    <CarTypeButton label={t.carEV} selected={form.carType === 'EV'} onClick={() => setForm({ ...form, carType: 'EV' })} iconPath={svgPaths.p2421b000} />
                  </div>
                </div>
              </div>
              <InputField label={t.vehicleType} placeholder={t.vehicleTypePlaceholder} value={form.vehicleType} onChange={(v) => setForm({ ...form, vehicleType: v })} />
              <InputField label={t.licensePlate} placeholder={t.platePlaceholder} value={form.plate} onChange={(v) => setForm({ ...form, plate: v })} />
              <InputField label={t.year} placeholder={t.yearPlaceholder} value={form.year} onChange={(v) => setForm({ ...form, year: v })} />
              
              <div className="mt-4">
                <Heading1 label={t.docsHeader} />
              </div>
              
              <InputField label={t.drivingLicense} placeholder={t.licensePlaceholder} value={form.drivingLicense} onChange={(v) => setForm({ ...form, drivingLicense: v })} />
              <InputField label={t.jlpt} placeholder={t.jlptPlaceholder} value={form.jlpt} onChange={(v) => setForm({ ...form, jlpt: v })} />
            </div>
          </div>

          {/* Upload Sections */}
          <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Upload Sections Container">
            {/* Image Upload Section */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Image Upload Section">
              <Heading1 label={t.imageHeader} />
              <div className="flex flex-col gap-[16px] w-fit">
                <FileUploadCard label={t.uploadImage} files={imageFiles} setFiles={setImageFiles} iconPath={svgPaths.plusIcon} multiple={false} width="w-[160px]" accept="image/*" />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Document Upload Section">
              <Heading1 label={t.docsSubmitHeader} />
              <div className="flex flex-col gap-[16px] w-full">
                <FileUploadCard label={t.uploadLicense} files={licenseFiles} setFiles={setLicenseFiles} iconPath={svgPaths.p11fdd840} />
              </div>
            </div>
          </div>

          {/* Submit Button Area */}
          <div className="content-stretch flex flex-col gap-[15.315px] items-start pt-[24px] relative shrink-0 w-full" data-name="Submit Button Area">
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className={`bg-gradient-to-r content-stretch flex flex-col from-[#006d37] items-center justify-center pb-[20px] pt-[19px] relative rounded-[24px] shrink-0 to-[#27ae60] w-full hover:brightness-105 active:scale-[0.98] transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
              data-name="Button"
            >
              <div className="content-stretch flex flex-col items-center relative shrink-0">
                <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[23px] justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white w-fit px-4">
                  <p className="leading-[22.5px]">{loading ? "..." : t.submit}</p>
                </div>
              </div>
            </button>
            <div className="h-[72px] relative shrink-0 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}