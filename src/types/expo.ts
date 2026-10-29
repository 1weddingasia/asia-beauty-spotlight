export type ExpoLanguage = 'vi' | 'en' | 'ko' | 'zh';

export interface BusinessExpoProfile {
  id: string;
  business_id: string;
  event_name: string;
  event_name_en?: string | null;
  booth_number: string;
  access_pin: string;
  languages_enabled: ExpoLanguage[];
  default_language: ExpoLanguage;
  lead_gift_title?: Record<ExpoLanguage, string> | null;
  company_name_vi?: string | null;
  company_name_en?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu
 */
export function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

/**
 * Bóc tách tên song ngữ (nếu người dùng nhập dạng: "Tên Việt / English Name" hoặc "Tên Việt | English Name")
 */
export function splitBilingualName(rawName?: string | null): { vi: string; en: string } {
  if (!rawName) return { vi: '', en: '' };
  const trimmed = rawName.trim();
  if (trimmed.includes('/') || trimmed.includes('|')) {
    const parts = trimmed.split(/[/|]/, 2);
    const vi = parts[0]?.trim() || '';
    const en = parts[1]?.trim() || stripAccents(vi);
    return { vi, en };
  }
  return { vi: trimmed, en: stripAccents(trimmed) };
}

/**
 * Suy luận tên tiếng Anh nếu không có trường tiếng Anh tường minh (chuyển ngữ không dấu chuẩn quốc tế)
 */
export function deriveEnglishName(rawName?: string | null): string {
  if (!rawName) return '';
  return splitBilingualName(rawName).en;
}

/**
 * Trả về tên thương hiệu/gian hàng theo ngôn ngữ đang chọn:
 * - 'vi': Tên tiếng Việt
 * - 'en', 'ko', 'zh': Tên tiếng Anh đối với các ngôn ngữ khác
 */
export function getExpoBrandName(
  business?: { name?: string | null; page_content?: any } | null,
  profile?: { company_name_vi?: string | null; company_name_en?: string | null } | null,
  lang: ExpoLanguage = 'vi'
): string {
  const parsed = splitBilingualName(business?.name);
  if (lang === 'vi') {
    return (
      profile?.company_name_vi ||
      business?.page_content?.name_vi ||
      parsed.vi ||
      'Gian Hàng Triển Lãm'
    );
  }

  // Đối với 'en', 'ko', 'zh': sử dụng tiếng Anh
  return (
    profile?.company_name_en ||
    business?.page_content?.name_en ||
    business?.page_content?.english_name ||
    parsed.en ||
    'Expo Booth'
  );
}

/**
 * Trả về tên sự kiện/triển lãm theo ngôn ngữ
 */
export function getExpoEventName(
  profile?: { event_name?: string | null; event_name_en?: string | null } | null,
  lang: ExpoLanguage = 'vi'
): string {
  if (lang === 'vi') {
    return profile?.event_name || 'Triển Lãm Quốc Tế';
  }
  return profile?.event_name_en || profile?.event_name || 'International Expo';
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
  websiteBtn: string;
  backToExpo: string;
  expoDirectory: string;
}> = {
  vi: {
    welcome: "Chào mừng quý khách đến gian hàng",
    booth: "Gian hàng số",
    event: "Sự kiện",
    formTitle: "Trao Đổi Thông Tin Liên Hệ",
    formSubtitle: "Quý khách vui lòng để lại thông tin để hai bên tiện trao đổi và kết nối công việc",
    nameLabel: "Họ và tên của bạn",
    namePlaceholder: "Nguyễn Văn A",
    phoneLabel: "Số điện thoại liên hệ",
    phonePlaceholder: "+84 901 234 567",
    emailLabel: "Email công việc",
    emailPlaceholder: "example@company.com",
    companyLabel: "Tên công ty / Đơn vị công tác",
    companyPlaceholder: "Công ty TNHH...",
    interestLabel: "Nội dung cần trao đổi / Nhu cầu hợp tác",
    interestPlaceholder: "Trao đổi hợp tác, thông tin sản phẩm, báo giá...",
    submitBtn: "🤝 GỬI THÔNG TIN KẾT NỐI",
    submittingBtn: "Đang gửi thông tin...",
    successTitle: "ĐÃ TIẾP NHẬN THÔNG TIN!",
    successMsg: "Cảm ơn quý khách! Đại diện gian hàng đã ghi nhận thông tin và sẽ liên hệ kết nối trao đổi với quý khách.",
    websiteBtn: "Website Doanh Nghiệp",
    backToExpo: "← Về Danh Bạ Expo",
    expoDirectory: "Khám phá 85 gian hàng Triển Lãm VietFranchise SECC",
  },
  en: {
    welcome: "Welcome to our booth",
    booth: "Booth No.",
    event: "Exhibition",
    formTitle: "Exchange Business Contact",
    formSubtitle: "Please leave your contact details for mutual business networking and follow-up",
    nameLabel: "Your Full Name",
    namePlaceholder: "John Doe",
    phoneLabel: "Contact Phone / Mobile",
    phonePlaceholder: "+1 555 123 4567",
    emailLabel: "Business Email",
    emailPlaceholder: "john@company.com",
    companyLabel: "Company / Organization",
    companyPlaceholder: "Acme Corp Ltd.",
    interestLabel: "Inquiry / Collaboration Note",
    interestPlaceholder: "Product details, partnership inquiry, pricing...",
    submitBtn: "🤝 SUBMIT CONTACT INFO",
    submittingBtn: "Submitting...",
    successTitle: "CONTACT INFO RECEIVED!",
    successMsg: "Thank you! Our booth representatives have received your contact details and will connect with you shortly.",
    websiteBtn: "Official Website",
    backToExpo: "← Back to Expo Hub",
    expoDirectory: "Explore all 85 exhibitors at VietFranchise Expo SECC",
  },
  ko: {
    welcome: "부스 방문을 환영합니다",
    booth: "부스 번호",
    event: "전시회",
    formTitle: "비즈니스 연락처 교환",
    formSubtitle: "행사 후 원활한 소통 및 비즈니스 협력을 위해 연락처를 남겨주시기 바랍니다",
    nameLabel: "성함",
    namePlaceholder: "홍길동",
    phoneLabel: "연락처 (전화번호)",
    phonePlaceholder: "010-1234-5678",
    emailLabel: "업무용 이메일",
    emailPlaceholder: "example@company.com",
    companyLabel: "회사명 / 소속",
    companyPlaceholder: "(주) 글로벌파트너스",
    interestLabel: "문의 내용 / 비즈니스 제안",
    interestPlaceholder: "협력 제안, 제품 문의, 비즈니스 협의...",
    submitBtn: "🤝 연락처 정보 전송",
    submittingBtn: "전송 중...",
    successTitle: "등록이 완료되었습니다!",
    successMsg: "감사합니다! 부스 담당자가 연락처를 확인하였으며 빠른 시일 내에 연락드리겠습니다.",
    websiteBtn: "공식 홈페이지",
    backToExpo: "← 엑스포 명록으로",
    expoDirectory: "VietFranchise SECC 85개 공식 부스 전체 둘러보기",
  },
  zh: {
    welcome: "欢迎光临展位",
    booth: "展位号",
    event: "展会名称",
    formTitle: "商务联系与名片交换",
    formSubtitle: "请留下您的联系方式，以便双方展会后进一步沟通与商务洽谈",
    nameLabel: "您的姓名",
    namePlaceholder: "张伟",
    phoneLabel: "联系电话 / 手机号码",
    phonePlaceholder: "+86 138 0013 8000",
    emailLabel: "企业邮箱",
    emailPlaceholder: "example@company.com",
    companyLabel: "公司名称 / 机构",
    companyPlaceholder: "环球商贸有限公司",
    interestLabel: "咨询内容 / 合作需求",
    interestPlaceholder: "产品咨询、业务合作、商务洽谈...",
    submitBtn: "🤝 提交联系信息",
    submittingBtn: "正在提交...",
    successTitle: "信息已成功提交！",
    successMsg: "非常感谢！展位代表已收到您的联系信息，将尽快与您取得联系并展开交流。",
    websiteBtn: "官方网站",
    backToExpo: "← 返回展会名录",
    expoDirectory: "浏览 VietFranchise SECC 展会 85 家参展商名录",
  },
};
