import React from 'react';
import { BottomSheet } from '../layout/BottomSheet';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { Heading } from '../ui/Heading';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthRequiredSheet: React.FC<AuthRequiredSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      snapPoints={[70]} // Điều chỉnh thành 70% để chạm cạnh trên bản đồ
      showHandle={true}
      zIndex={9999}
    >
      <div className="flex flex-col items-center text-center gap-10 py-8 px-2">
        {/* Icon Khóa - Vòng tròn to hơn chút */}
        <div className="w-24 h-24 bg-[#eff6ec] rounded-full flex items-center justify-center mb-2">
          <Lock size={40} className="text-[#006d37]" fill="#006d37" fillOpacity={0.1} />
        </div>

        {/* Tiêu đề & Nội dung */}
        <div className="flex flex-col gap-6">
          <Heading level={2} className="text-[28px] font-bold tracking-tight">
            ログインが必要です
          </Heading>
          <Text color="medium" className="text-[17px] leading-[1.6] max-w-[300px] mx-auto opacity-90">
            予約を続けるにはログインまたはアカウント作成をしてください。
          </Text>
        </div>

        {/* Nút bấm - Căn chỉnh màu sắc cực chuẩn */}
        <div className="flex flex-col gap-4 w-full mt-4">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/login')}
            className="bg-[#ffab2c] border-[#ffab2c] hover:bg-[#f39c12] text-[#422006] text-[19px] font-black h-[68px] rounded-[34px] shadow-sm"
          >
            ログイン
          </Button>
          
          <Button
            variant="secondary"
            size="xl"
            fullWidth
            onClick={() => navigate('/signup')}
            className="bg-[#eff6ec] hover:bg-[#e4eee0] text-[#064e3b] text-[19px] font-black h-[68px] border-none rounded-[34px]"
          >
            新規登録
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
