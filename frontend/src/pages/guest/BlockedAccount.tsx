import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RotateCcw, Headphones } from 'lucide-react';
import restrictedGlobe from '../../assets/restricted_globe.png';

export default function BlockedAccount() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f4fbf1] min-h-screen flex flex-col items-center select-none overflow-x-hidden">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-[rgba(23,29,23,0.05)] flex items-center justify-between px-[24px] z-50">
        <div className="flex gap-[16px] items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center rounded-[9999px] size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-colors cursor-pointer"
            aria-label="戻る"
          >
            <ArrowLeft size={20} color="#006D37" />
          </button>
          <span className="font-bold text-[#006D37] text-[18px] tracking-[-0.36px]">エラー</span>
        </div>
        <span className="font-extrabold text-[#065f46] text-[20px] tracking-[-0.5px]">JV - Taxi</span>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[448px] px-[24px] pt-[96px] pb-[48px] flex flex-col gap-[28px] items-center justify-center">
        
        {/* Globe Graphic Card */}
        <div className="w-full bg-[#111A13] rounded-[24px] overflow-hidden shadow-lg aspect-[1.8/1] flex items-center justify-center p-[2px]">
          <img 
            src={restrictedGlobe} 
            alt="Access Restricted" 
            className="w-full h-full object-cover rounded-[22px]" 
          />
        </div>

        {/* Warning Toast Block */}
        <div className="w-full bg-[#FFDAD6] border-l-4 border-[#BA1A1A] rounded-r-[24px] rounded-l-[8px] p-[20px] flex gap-[16px] shadow-sm">
          <div className="shrink-0 mt-[2px]">
            <AlertTriangle size={24} color="#BA1A1A" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <h3 className="text-[#BA1A1A] text-[16px] font-[800] leading-[22px]">
              アクセスが一時的に制限されています
            </h3>
            <p className="text-[#3D4A3F] text-[13.5px] font-[500] leading-[20px]">
              ログイン試行回数が上限に達しました。しばらく経ってから再度お試しください。
            </p>
          </div>
        </div>

        {/* Help Card Option Panel */}
        <div className="w-full bg-white rounded-[32px] p-[28px] shadow-[0px_16px_32px_rgba(23,29,23,0.04)] border border-[rgba(23,29,23,0.02)] flex flex-col items-center gap-[24px]">
          <div className="text-center flex flex-col gap-[8px]">
            <h2 className="text-[#171D17] text-[22px] font-[900] leading-[28px] tracking-[-0.44px]">
              お困りですか？
            </h2>
            <p className="text-[#3D4A3F] text-[14px] font-[500] leading-[22px] max-w-[280px]">
              セキュリティ保護のため、ログインを一時停止しています。
            </p>
          </div>

          {/* Action Buttons Grid */}
          <div className="w-full flex flex-col gap-[12px]">
            {/* Reset Password Button */}
            <button 
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-gradient-to-r from-[#006D37] to-[#27AE60] text-white hover:brightness-105 transition-all py-[16px] rounded-[24px] flex items-center justify-center gap-[10px] font-bold text-[16px] shadow-sm cursor-pointer"
            >
              <RotateCcw size={18} color="white" />
              <span>パスワードを再設定する</span>
            </button>

            {/* Support Button */}
            <button 
              onClick={() => navigate('/support')}
              className="w-full bg-[#E9F0E6] text-[#006D37] hover:bg-[#dfe9dc] transition-all py-[16px] rounded-[24px] flex items-center justify-center gap-[10px] font-bold text-[16px] cursor-pointer"
            >
              <Headphones size={18} color="#006D37" />
              <span>サポートへ問い合わせる</span>
            </button>
          </div>
        </div>

        {/* Footer Subtext */}
        <p className="text-[#8a8a8a] text-[12px] font-[500] leading-[18px] text-center max-w-[300px]">
          心当たりがない場合は、すぐにお問い合わせください。
        </p>
      </main>
    </div>
  );
}
