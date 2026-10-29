export type ExpoLanguage = 'vi' | 'en' | 'ko' | 'zh';

export interface BusinessExpoProfile {
  id: string;
  business_id: string;
  event_name: string;
  booth_number: string;
  access_pin: string;
  languages_enabled: ExpoLanguage[];
  default_language: ExpoLanguage;
  lead_gift_title: Record<ExpoLanguage, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessExpoLead {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  company_name?: string | null;
  interests?: string | null;
  notes?: string | null;
  preferred_lang: ExpoLanguage;
  ip_address?: string | null;
  created_at: string;
}

export const EXPO_TRANSLATIONS: Record<ExpoLanguage, {
  welcome: string;
  booth: string;
  event: string;
  formTitle: string;
  formSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  interestLabel: string;
  interestPlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  successTitle: string;
  successMsg: string;
  hotlineBtn: string;
  zaloBtn: string;
  websiteBtn: string;
}> = {
  vi: {
    welcome: "Chào mừng quý khách đến gian hàng",
    booth: "Gian hàng số",
    event: "Sự kiện",
    formTitle: "Đăng Ký Nhận Thông Tin & Quà Tặng",
    formSubtitle: "Quét mã & để lại thông tin để nhận tài liệu catalogue cùng quà tặng đặc biệt tại quầy",
    nameLabel: "Họ và tên của bạn",
    namePlaceholder: "Nguyễn Văn A",
    phoneLabel: "Số điện thoại / Zalo",
    phonePlaceholder: "0901234567",
    emailLabel: "Email nhận tài liệu (nếu có)",
    emailPlaceholder: "example@gmail.com",
    companyLabel: "Tên công ty / Cơ quan",
    companyPlaceholder: "Công ty TNHH...",
    interestLabel: "Nhu cầu hoặc sản phẩm quan tâm",
    interestPlaceholder: "Tư vấn báo giá sỉ, catalogue...",
    submitBtn: "🎁 GỬI THÔNG TIN NHẬN QUÀ",
    submittingBtn: "Đang gửi thông tin...",
    successTitle: "ĐÃ GỬI THÀNH CÔNG!",
    successMsg: "Cảm ơn bạn! Đội ngũ tư vấn tại gian hàng đã nhận được thông tin và sẽ gửi quà/tài liệu cho bạn ngay.",
    hotlineBtn: "Gọi Hotline",
    zaloBtn: "Nhắn Zalo",
    websiteBtn: "Xem Website",
  },
  en: {
    welcome: "Welcome to our booth",
    booth: "Booth No.",
    event: "Exhibition",
    formTitle: "Register for Info & Gifts",
    formSubtitle: "Leave your contact details to receive our catalogue, price list & exclusive gifts",
    nameLabel: "Your Full Name",
    namePlaceholder: "John Doe",
    phoneLabel: "Phone / WhatsApp",
    phonePlaceholder: "+84 901 234 567",
    emailLabel: "Email address",
    emailPlaceholder: "john@example.com",
    companyLabel: "Company / Organization",
    companyPlaceholder: "Acme Corp Ltd.",
    interestLabel: "Products or inquiry of interest",
    interestPlaceholder: "Catalogue, wholesale pricing...",
    submitBtn: "🎁 SUBMIT & GET GIFTS",
    submittingBtn: "Submitting...",
    successTitle: "SUCCESSFULLY SUBMITTED!",
    successMsg: "Thank you! Our booth representatives have received your inquiry and will connect with you right away.",
    hotlineBtn: "Call Hotline",
    zaloBtn: "WhatsApp/Zalo",
    websiteBtn: "Visit Website",
  },
  ko: {
    welcome: "부스 방문을 환영합니다",
    booth: "부스 번호",
    event: "전시회",
    formTitle: "카탈로그 및 부스 선물 신청",
    formSubtitle: "연락처를 남겨주시면 카탈로그, 가격표 및 부스 특별 선물을 즉시 안내해 드립니다",
    nameLabel: "성함",
    namePlaceholder: "홍길동",
    phoneLabel: "연락처 (전화 / 카카오톡)",
    phonePlaceholder: "010-1234-5678",
    emailLabel: "이메일 주소",
    emailPlaceholder: "example@naver.com",
    companyLabel: "회사명 / 소속",
    companyPlaceholder: "(주) 글로벌파트너스",
    interestLabel: "관심 제품 및 문의 사항",
    interestPlaceholder: "도매 단가표, 카탈로그 요청...",
    submitBtn: "🎁 정보 등록 및 선물 받기",
    submittingBtn: "등록 중...",
    successTitle: "신청이 완료되었습니다!",
    successMsg: "감사합니다! 부스 담당자가 정보를 확인하였으며, 즉시 안내 및 선물을 전달해 드리겠습니다.",
    hotlineBtn: "전화 문의",
    zaloBtn: "메신저 문의",
    websiteBtn: "홈페이지 방문",
  },
  zh: {
    welcome: "欢迎光临展位",
    booth: "展位号",
    event: "展会名称",
    formTitle: "登记获取产品资料与礼品",
    formSubtitle: "填写基本联系方式，即可领取产品目录、报价单及展位专享精美礼品",
    nameLabel: "您的姓名",
    namePlaceholder: "张伟",
    phoneLabel: "联系电话 / 微信",
    phonePlaceholder: "13800138000",
    emailLabel: "电子邮箱",
    emailPlaceholder: "example@qq.com",
    companyLabel: "公司名称 / 机构",
    companyPlaceholder: "环球商贸有限公司",
    interestLabel: "感兴趣的产品或合作意向",
    interestPlaceholder: "批发价目表、产品目录...",
    submitBtn: "🎁 立即提交领取礼品",
    submittingBtn: "正在提交...",
    successTitle: "提交成功！",
    successMsg: "非常感谢！展位代表已收到您的登记信息，将第一时间为您送上资料与礼品。",
    hotlineBtn: "电话咨询",
    zaloBtn: "微信/Zalo",
    websiteBtn: "官方网站",
  }
};
