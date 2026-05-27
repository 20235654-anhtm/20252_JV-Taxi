import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SupportContact() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f4fbf1] min-h-screen flex flex-col items-center select-none overflow-x-hidden">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-[rgba(23,29,23,0.05)] flex items-center justify-between px-[24px] z-50">
        <div className="flex gap-[16px] items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center rounded-[9999px] size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-colors cursor-pointer"
            aria-label="戻る"
          >
            <ArrowLeft size={20} color="#006D37" />
          </button>
          <span className="font-bold text-[#006D37] text-[18px] tracking-[-0.36px]">サポート</span>
        </div>
        <span className="font-extrabold text-[#065f46] text-[20px] tracking-[-0.5px]">JV - Taxi</span>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[448px] px-[24px] pt-[96px] pb-[48px] flex flex-col items-center justify-center">
        <p className="text-[#3D4A3F] text-[16px] font-bold text-center">
          Liên hệ với hỗ trợ.
        </p>
      </main>
    </div>
  );
}
