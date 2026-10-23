import {
  Activity,
  Award,
  Calendar,
  Clock,
  Dumbbell,
  Layers,
  LucideIcon,
  Shield,
  Smartphone,
  Users,
} from 'lucide-react';

export type PlanType = 'Basic' | 'Pro' | 'Elite';

export interface HeroPlanDetail {
  price: string;
  badge: string;
  save: string;
  perks: string[];
}

export const heroPlanDetails: Record<PlanType, HeroPlanDetail> = {
  Basic: {
    price: '499,000',
    badge: 'Gói nhập môn',
    save: 'Tiết kiệm 15% so với theo buổi',
    perks: [
      'Tập tự do toàn bộ thiết bị',
      'Phòng tắm & tủ đồ cá nhân',
      '1 buổi tư vấn PT miễn phí',
    ],
  },
  Pro: {
    price: '899,000',
    badge: 'Được chọn nhiều nhất',
    save: 'Tiết kiệm 30% so với theo buổi',
    perks: [
      '8 buổi PT / tháng',
      'Tham gia tất cả lớp nhóm',
      'Tư vấn dinh dưỡng chuyên sâu',
    ],
  },
  Elite: {
    price: '1,499,000',
    badge: 'Trải nghiệm đỉnh cao',
    save: 'Tiết kiệm 45% trọn gói dịch vụ',
    perks: [
      'PT không giới hạn',
      'Phòng VIP & spa thảo dược',
      'Mang khách +1 miễn phí',
    ],
  },
};

export interface StatItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const stats: StatItem[] = [
  {
    value: '12,000+',
    label: 'Thành viên tích cực',
    icon: Users,
  },
  {
    value: '85+',
    label: 'Huấn luyện viên chuyên nghiệp',
    icon: Award,
  },
  {
    value: '9',
    label: 'Năm hoạt động',
    icon: Calendar,
  },
  {
    value: '48',
    label: 'Lớp học mỗi tuần',
    icon: Activity,
  },
];

export interface PricingCardItem {
  tag: string;
  name: string;
  price: string;
  period: string;
  popular: boolean;
  buttonText: string;
  buttonClass: string;
  borderClass: string;
  features: string[];
}

export const pricingCards: PricingCardItem[] = [
  {
    tag: 'Khởi đầu hành trình',
    name: 'Basic',
    price: '499.000đ',
    period: '/tháng',
    popular: false,
    buttonText: 'Chọn Basic',
    buttonClass: 'bg-[#101828] hover:bg-[#1f2937] text-white',
    borderClass: 'border-[#E5E7EB]',
    features: [
      'Tập tự do toàn bộ thiết bị',
      'Phòng tắm & tủ đồ',
      '1 buổi tư vấn PT miễn phí',
      'App theo dõi tiến độ',
    ],
  },
  {
    tag: 'Được chọn nhiều nhất',
    name: 'Pro',
    price: '899.000đ',
    period: '/tháng',
    popular: true,
    buttonText: 'Bắt đầu ngay',
    buttonClass: 'bg-[#FF6B00] hover:bg-[#E05E00] text-white shadow-[0_10px_25px_-5px_rgba(255,107,0,0.4)]',
    borderClass: 'border-2 border-[#FF6B00] shadow-[0px_25px_50px_-12px_rgba(255,237,212,0.8)]',
    features: [
      'Toàn bộ quyền lợi Basic',
      '8 buổi PT / tháng',
      'Tham gia tất cả lớp nhóm',
      'Đo lường thể lực hàng tháng',
      'Tư vấn dinh dưỡng cá nhân',
    ],
  },
  {
    tag: 'Hiệu suất đỉnh cao',
    name: 'Elite',
    price: '1.499.000đ',
    period: '/tháng',
    popular: false,
    buttonText: 'Trải nghiệm Elite',
    buttonClass: 'bg-[#FFB800] hover:bg-[#e6a600] text-[#101828]',
    borderClass: 'border-[#E5E7EB]',
    features: [
      'Toàn bộ quyền lợi Pro',
      'PT không giới hạn',
      'Phòng VIP & spa',
      'Chương trình cá nhân hoá',
      'Hỗ trợ 24/7',
      'Mang khách +1 miễn phí',
    ],
  },
];

export interface TrainerItem {
  name: string;
  role: string;
  rating: string;
  sessions: string;
  tag: string | null;
  tagBg: string;
  image: string;
}

export const trainers: TrainerItem[] = [
  {
    name: 'Nguyễn Minh Khoa',
    role: 'Thể hình & Sức mạnh',
    rating: '4.9',
    sessions: '1,240 buổi',
    tag: 'Top Trainer',
    tagBg: 'bg-[#FF6B00]',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Trần Thị Lan Anh',
    role: 'Yoga & Flexibility',
    rating: '4.8',
    sessions: '980 buổi',
    tag: null,
    tagBg: '',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lê Đức Thành',
    role: 'HIIT & Cardio',
    rating: '5.0',
    sessions: '2,100 buổi',
    tag: 'Xuất sắc',
    tagBg: 'bg-[#FFB800]',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Phạm Hồng Nhung',
    role: 'Pilates & Core',
    rating: '4.7',
    sessions: '760 buổi',
    tag: null,
    tagBg: '',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Vũ Tiến Dũng',
    role: 'Boxing & MMA',
    rating: '4.9',
    sessions: '1,560 buổi',
    tag: 'Hot',
    tagBg: 'bg-[#EF4444]',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
];

export interface AmenityItem {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}

export const amenities: AmenityItem[] = [
  {
    icon: Dumbbell,
    iconBg: 'bg-[rgba(255,107,0,0.08)]',
    iconColor: 'text-[#FF6B00]',
    title: '300+ thiết bị cao cấp',
    desc: 'Máy móc từ các thương hiệu hàng đầu thế giới — luôn được bảo trì định kỳ.',
  },
  {
    icon: Layers,
    iconBg: 'bg-[rgba(139,92,246,0.08)]',
    iconColor: 'text-[#8B5CF6]',
    title: '48 lớp nhóm/tuần',
    desc: 'HIIT, Yoga, Pilates, Boxing, Zumba — cho mọi mục tiêu và thể trạng.',
  },
  {
    icon: Award,
    iconBg: 'bg-[rgba(255,184,0,0.08)]',
    iconColor: 'text-[#FFB800]',
    title: 'HLV được chứng nhận quốc tế',
    desc: '100% HLV có chứng chỉ quốc tế và ≥3 năm kinh nghiệm thực chiến.',
  },
  {
    icon: Smartphone,
    iconBg: 'bg-[rgba(16,185,129,0.08)]',
    iconColor: 'text-[#10B981]',
    title: 'App theo dõi thông minh',
    desc: 'Log workout, đo tiến độ, nhắc lịch tập — tất cả trong một ứng dụng.',
  },
  {
    icon: Shield,
    iconBg: 'bg-[rgba(59,130,246,0.08)]',
    iconColor: 'text-[#3B82F6]',
    title: 'An toàn & vệ sinh tuyệt đối',
    desc: 'Khử khuẩn 3 lần/ngày, camera 24/7 và nhân viên thường trực.',
  },
  {
    icon: Clock,
    iconBg: 'bg-[rgba(244,63,94,0.08)]',
    iconColor: 'text-[#F43F5E]',
    title: 'Mở cửa 5:00 – 23:00',
    desc: 'Tất cả các ngày kể cả lễ, Tết — tập đúng lịch, không bỏ buổi nào.',
  },
];

export interface TestimonialItem {
  pill: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

export const testimonials: TestimonialItem[] = [
  {
    pill: '−14kg sau 6 tháng',
    quote:
      '"Sau 6 tháng tập tại Gym Max cùng PT Khoa, tôi giảm 14kg và tăng cơ rõ rệt. Đây là khoản đầu tư tốt nhất tôi từng làm cho bản thân."',
    author: 'Trịnh Minh Tú',
    role: 'Kỹ sư phần mềm',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    pill: 'Tăng 8kg cơ',
    quote:
      '"App của Gym Max rất tiện — book lịch, xem lịch sử tập, nhắn tin HLV đều trong một chỗ. Không gian sạch sẽ và nhân viên rất nhiệt tình."',
    author: 'Nguyễn Thu Hà',
    role: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    pill: 'Giảm 18% mỡ',
    quote:
      '"Gói Elite xứng đáng từng đồng. Phòng VIP yên tĩnh, PT lên plan cá nhân hoá và kết quả vượt kỳ vọng sau 3 tháng đầu."',
    author: 'Phạm Đức Anh',
    role: 'Doanh nhân',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];
