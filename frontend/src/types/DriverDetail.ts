export interface ProfileCardProps {
  name: string;
  subName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

export interface CarDetailsCardProps {
  carImage: string;
  model: string;
  year: string;
  plateNumber: string;
}

export interface DocumentCardProps {
  title: string;
  isValid: boolean;
  documentImage: string;
  expirationDate: string;
  categoryOrStatusLabel: string;
  categoryOrStatusValue: string;
  isSuccessStatus?: boolean;
}

export interface ReviewData {
  reviewerName: string;
  timeAgo: string;
  comment: string;
}

export interface ReviewsCardProps {
  totalReviews: number;
  averageScore: number;
  stats: { label: string; score: string; width: string }[];
  comments: ReviewData[];
}
