import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';

// Inline mock components to fix build errors in orphan file
const ProfileCard: React.FC<any> = ({ name, subName, email, phone }) => (
  <div className="p-4 bg-white rounded-2xl shadow-sm">
    <h3 className="font-bold text-lg">{name}</h3>
    <p className="text-sm text-gray-500">{subName}</p>
    <p className="text-sm">{email} | {phone}</p>
  </div>
);

const CarDetailsCard: React.FC<any> = ({ model, year, plateNumber }) => (
  <div className="p-4 bg-white rounded-2xl shadow-sm">
    <h4 className="font-bold">{model} ({year})</h4>
    <p className="text-sm text-gray-500">Plate: {plateNumber}</p>
  </div>
);

const DocumentCard: React.FC<any> = ({ title, expirationDate, categoryOrStatusLabel, categoryOrStatusValue }) => (
  <div className="p-4 bg-white rounded-2xl shadow-sm">
    <h4 className="font-bold">{title}</h4>
    <p className="text-sm text-gray-500">Expires: {expirationDate}</p>
    <p className="text-sm">{categoryOrStatusLabel}: {categoryOrStatusValue}</p>
  </div>
);

const ReviewsCard: React.FC<any> = ({ totalReviews, averageScore }) => (
  <div className="p-4 bg-white rounded-2xl shadow-sm">
    <h4 className="font-bold">Reviews ({totalReviews})</h4>
    <p className="text-green-600 font-bold">Score: {averageScore}</p>
  </div>
);

const mockProfileData = {
  name: "Kenji Yamamoto",
  subName: "山本 健二",
  avatarUrl: "https://avatar.iran.liara.run/public/boy?username=kenji",
  email: "kenji.y@zenfleet.jp",
  phone: "+84 90 123 4567",
  isVerified: true
};

const mockCarData = {
  carImage: "https://loremflickr.com/600/300/car,suv/all",
  model: "Toyota Camry",
  year: "2024",
  plateNumber: "51A-998.22"
};

const mockDriverLicenseData = {
  title: "運転免許証",
  isValid: true,
  documentImage: "https://images.unsplash.com/photo-1622340331003-90d5102a0a28?auto=format&fit=crop&q=80&w=600&h=300",
  expirationDate: "2028/10/12",
  categoryOrStatusLabel: "区分",
  categoryOrStatusValue: "B2",
  isSuccessStatus: false
};

const mockJLPTData = {
  title: "JLPT証明書",
  isValid: true,
  documentImage: "https://images.unsplash.com/photo-1546410531-bea4edad2456?auto=format&fit=crop&q=80&w=600&h=300",
  expirationDate: "2025/03/20",
  categoryOrStatusLabel: "ステータス",
  categoryOrStatusValue: "アクティブ",
  isSuccessStatus: true
};

const mockReviewsData = {
  totalReviews: 1200,
  averageScore: 4.98,
  stats: [
    { label: "コミュニケーション", score: "5.0", width: "100%" },
    { label: "安全", score: "4.9", width: "98%" },
    { label: "態度", score: "5.0", width: "100%" }
  ],
  comments: [
    {
      reviewerName: "Tanaka M.",
      timeAgo: "2日前",
      comment: "\"Kenji-san's Japanese is perfect. He helped me with my luggage and knew exactly where the hotel entrance was. Best driver in HCMC.\""
    },
    {
      reviewerName: "James W.",
      timeAgo: "昨日",
      comment: "\"Very smooth driving and clean car. Highly recommended for business travelers.\""
    },
    {
      reviewerName: "Yuki S.",
      timeAgo: "3 days ago",
      comment: "\"日本語が通じるのでとても安心しました。運転も丁寧で、車内も清潔感があります。\""
    }
  ]
};

export default function AdminDriverReviewDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[--color-bg-primary] pb-2">
      <Header
        showBackButton
        title="ドライバー"
        hideBrandName
        hideLanguageToggle
        onBackClick={() => navigate(-1)}
      />

      <div className="pt-25 px-4 space-y-6 max-w-lg mx-auto">
        
        <ProfileCard {...mockProfileData} />
        
        <CarDetailsCard {...mockCarData} />

        {/* Documents Section */}
        <div className="w-full flex items-center gap-[16px] mt-[26px] mb-[16px]">
          <div className="text-[#171D17] text-[20px] font-[800] leading-[28px] break-words">書類</div>
          <div className="w-[41.56px] h-[16px]"></div>
        </div>

        <DocumentCard {...mockDriverLicenseData} />
        <DocumentCard {...mockJLPTData} />
        
        <ReviewsCard {...mockReviewsData} />

        {/* Reject Button */}
        <div className="pt-6 pb-2">
          <Button 
            variant="ghost"
            fullWidth 
            className="!bg-[#FFDAD6] !rounded-[24px] !py-[16px] !h-auto hover:opacity-90 shadow-none !text-[#93000A] !text-[18px] !font-[700] !leading-[28px] tracking-[0.45px]"
          >
            申請を却下する
          </Button>
        </div>
      </div>
    </div>
  );
}
