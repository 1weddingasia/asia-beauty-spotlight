export type ExpoLanguage = 'vi' | 'en' | 'ko' | 'zh';

export const EXPO_LANG_STORAGE_KEY = '1booking_expo_lang';

export function getStoredExpoLanguage(fallback: ExpoLanguage = 'vi'): ExpoLanguage {
  if (typeof window === 'undefined') return fallback;
  try {
    const urlParam = new URLSearchParams(window.location.search).get('lang') as ExpoLanguage;
    if (urlParam && ['vi', 'en', 'ko', 'zh'].includes(urlParam)) {
      try { localStorage.setItem(EXPO_LANG_STORAGE_KEY, urlParam); } catch {}
      return urlParam;
    }
    const cached = localStorage.getItem(EXPO_LANG_STORAGE_KEY) as ExpoLanguage;
    if (cached && ['vi', 'en', 'ko', 'zh'].includes(cached)) {
      return cached;
    }
  } catch {
    // ignore
  }
  return fallback;
}

export function setStoredExpoLanguage(lang: ExpoLanguage) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPO_LANG_STORAGE_KEY, lang);
    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') !== lang) {
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    }
  } catch {
    // ignore
  }
}

export function withExpoLang(path: string, lang: ExpoLanguage): string {
  if (!path) return path;
  const separator = path.includes('?') ? '&' : '?';
  if (path.includes('lang=')) {
    return path.replace(/([?&])lang=[^&]*/, `$1lang=${lang}`);
  }
  return `${path}${separator}lang=${lang}`;
}

export interface BusinessExpoProfile {
  id: string;
  business_id: string;
  event_name: string;
  event_name_en?: string | null;
  booth_number: string;
  access_pin?: string;
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
    return profile?.event_name || '1Booking Expo Pass';
  }
  return profile?.event_name_en || profile?.event_name || '1Booking Expo Pass';
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
  viewDirectoryBtn: string;
}> = {
  vi: {
    welcome: "Chào mừng quý khách đến gian hàng",
    booth: "Vị trí",
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
    backToExpo: "Về Danh Bạ Expo",
    expoDirectory: "Khám phá danh bạ doanh nghiệp triển lãm quốc tế",
    viewDirectoryBtn: "Xem Tất Cả Gian Hàng Triển Lãm",
  },
  en: {
    welcome: "Welcome to our booth",
    booth: "Location",
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
    backToExpo: "Back to Expo Hub",
    expoDirectory: "Explore all exhibitors in the digital directory",
    viewDirectoryBtn: "Explore All Expo Booths",
  },
  ko: {
    welcome: "부스 방문을 환영합니다",
    booth: "위치",
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
    backToExpo: "엑스포 명록으로",
    expoDirectory: "국제 박람회 참가기업 디렉토리 전체 둘러보기",
    viewDirectoryBtn: "전체 부스 둘러보기",
  },
  zh: {
    welcome: "欢迎光临展位",
    booth: "展位",
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
    backToExpo: "返回展会名录",
    expoDirectory: "浏览国际博览会参展企业名录",
    viewDirectoryBtn: "浏览全部参展展位",
  },
};

// ═══════════════════════════════════════
// CRM PAGE TRANSLATIONS (PIN + Dashboard)
// ═══════════════════════════════════════
export const CRM_TRANSLATIONS: Record<ExpoLanguage, {
  // PIN Lock screen
  pinTitle: string;
  pinDesc: string;
  pinPlaceholder: string;
  pinUnlocking: string;
  pinUnlockBtn: string;
  pinSecurityNote: string;
  pinSecurityDesc: string;
  pinIncorrect: string;
  pinSuccess: string;
  backToExpo: string;
  // CRM Dashboard header
  location: string;
  changePin: string;
  downloadStandee: string;
  backExpo: string;
  scanPage: string;
  exportExcel: string;
  // Stats
  totalScanned: string;
  latestCustomer: string;
  noCustomerYet: string;
  realtimeAlert: string;
  realtimeDesc: string;
  // Search & pagination
  searchPlaceholder: string;
  show: string;
  perPage: string;
  refreshList: string;
  noMatchFound: string;
  noScansYet: string;
  inviteScanDesc: string;
  openContactPage: string;
  showingRange: string;
  inTotal: string;
  scanned: string;
  prevPage: string;
  nextPage: string;
  // Table headers
  thNo: string;
  thCustomer: string;
  thCompany: string;
  thPhone: string;
  thEmail: string;
  thInterest: string;
  thTime: string;
  newBadge: string;
  // Toast
  newCustomer: string;
  newScan: string;
  copiedLabel: string;
  exportSuccess: string;
  exportEmpty: string;
  exportError: string;
  soundOk: string;
  // Change PIN modal
  changePinTitle: string;
  boothLabel: string;
  oldPinLabel: string;
  oldPinPlaceholder: string;
  newPinLabel: string;
  newPinPlaceholder: string;
  confirmPinLabel: string;
  confirmPinPlaceholder: string;
  pinLengthHint: string;
  showChars: string;
  hideChars: string;
  cancelBtn: string;
  updatingBtn: string;
  confirmChangePinBtn: string;
  // PIN validation errors
  errOldPinRequired: string;
  errNewPinRequired: string;
  errPinFormat: string;
  errPinMismatch: string;
  errPinSame: string;
  changePinSuccess: string;
  changePinFail: string;
  // Excel headers
  xlNo: string;
  xlTime: string;
  xlName: string;
  xlPhone: string;
  xlCompany: string;
  xlInterest: string;
  xlLang: string;
  // Donate modal & banner
  donateBannerTitle: string;
  donateBannerSubtitle: string;
  donateBtn: string;
  donateModalTitle: string;
  donateModalSubtitle: string;
  donateCoffee: string;
  donateEventPlan: string;
  donateYearlyPlan: string;
  donateCustom: string;
  donateBankLabel: string;
  donateAccNumLabel: string;
  donateAccOwnerLabel: string;
  donateSyntaxLabel: string;
  donateClose: string;
  donateCopied: string;
}> = {
  vi: {
    pinTitle: 'CRM GIAN HÀNG',
    pinDesc: 'Nhập mã PIN bảo mật (4 - 10 ký tự) để mở bảng danh sách khách hàng trực tiếp',
    pinPlaceholder: 'Nhập mã PIN...',
    pinUnlocking: 'Đang mở khóa...',
    pinUnlockBtn: 'MỞ KHÓA CRM LIVE',
    pinSecurityNote: 'Khu vực bảo mật dành riêng cho đại diện gian hàng',
    pinSecurityDesc: 'Vui lòng nhập mã PIN được cấp khi bàn giao gian hàng để mở khóa dữ liệu khách hàng.',
    pinIncorrect: 'Mã PIN không đúng',
    pinSuccess: 'Mở khóa CRM thành công!',
    backToExpo: 'Về Danh Bạ Expo',
    location: 'Vị trí',
    changePin: 'Đổi PIN',
    downloadStandee: 'Tải Standee',
    backExpo: 'Về Expo',
    scanPage: 'Trang Quét',
    exportExcel: 'XUẤT EXCEL',
    totalScanned: 'Tổng Khách Đã Quét',
    latestCustomer: 'Khách Gần Nhất',
    noCustomerYet: 'Chưa có khách',
    realtimeAlert: 'Thông Báo Realtime',
    realtimeDesc: 'Khách quét mã QR tại gian hàng, dữ liệu lập tức cập nhật và chuông <b>Ting!</b> sẽ vang lên.',
    searchPlaceholder: 'Tìm theo tên khách, số điện thoại, công ty...',
    show: 'Hiển thị',
    perPage: '/ trang',
    refreshList: 'Làm mới danh sách',
    noMatchFound: 'Không tìm thấy khách hàng phù hợp',
    noScansYet: 'Chưa có lượt quét nào',
    inviteScanDesc: 'Mời khách quét mã QR tại quầy để nhận danh sách khách hàng tự động tại đây.',
    openContactPage: 'Mở trang liên hệ',
    showingRange: 'Hiển thị',
    inTotal: 'trong tổng số',
    scanned: 'khách quét',
    prevPage: 'Trang trước',
    nextPage: 'Trang sau',
    thNo: 'STT',
    thCustomer: 'Khách Hàng',
    thCompany: 'Công Ty',
    thPhone: 'Số Điện Thoại',
    thEmail: 'Email',
    thInterest: 'Nhu Cầu Kết Nối',
    thTime: 'Thời Gian',
    newBadge: 'MỚI',
    newCustomer: 'Khách mới',
    newScan: 'Khách mới vừa quét',
    copiedLabel: 'Đã sao chép',
    exportSuccess: 'Đã tải xuống file Excel thành công!',
    exportEmpty: 'Chưa có dữ liệu khách hàng để xuất',
    exportError: 'Lỗi khi xuất file Excel',
    soundOk: 'Chuông Ting-Ting đang hoạt động tốt!',
    changePinTitle: 'Đổi Mã PIN CRM',
    boothLabel: 'Gian hàng',
    oldPinLabel: 'Mã PIN hiện tại',
    oldPinPlaceholder: 'Nhập mã PIN đang sử dụng...',
    newPinLabel: 'Mã PIN mới',
    newPinPlaceholder: 'Nhập mã PIN mới (4 - 10 ký tự)...',
    confirmPinLabel: 'Xác nhận mã PIN mới',
    confirmPinPlaceholder: 'Nhập lại mã PIN mới để xác nhận...',
    pinLengthHint: 'Độ dài từ 4 đến 10 số hoặc ký tự bảo mật.',
    showChars: 'Hiện ký tự',
    hideChars: 'Ẩn ký tự',
    cancelBtn: 'Hủy bỏ',
    updatingBtn: 'Đang cập nhật...',
    confirmChangePinBtn: 'XÁC NHẬN ĐỔI PIN',
    errOldPinRequired: 'Vui lòng nhập mã PIN hiện tại',
    errNewPinRequired: 'Vui lòng nhập mã PIN mới',
    errPinFormat: 'Mã PIN mới phải từ 4 đến 10 ký tự chữ hoặc số',
    errPinMismatch: 'Mã PIN mới và xác nhận mã PIN không trùng khớp',
    errPinSame: 'Mã PIN mới phải khác mã PIN cũ hiện tại',
    changePinSuccess: '🎉 Đổi mã PIN CRM thành công!',
    changePinFail: 'Lỗi đổi mã PIN',
    xlNo: 'STT',
    xlTime: 'Thời Gian',
    xlName: 'Họ Và Tên',
    xlPhone: 'Số Điện Thoại',
    xlCompany: 'Tên Công Ty',
    xlInterest: 'Nhu Cầu Quan Tâm',
    xlLang: 'Ngôn Ngữ',
    donateBannerTitle: 'Thích 1Booking Expo? Mời team ly cà phê / Donate tùy tâm',
    donateBannerSubtitle: 'Tiện ích số hóa độc lập phục vụ gian hàng • Ủng hộ team công nghệ phát triển',
    donateBtn: '☕ Mời Cà Phê / Donate',
    donateModalTitle: 'Mời Team Ly Cà Phê / Donate',
    donateModalSubtitle: 'Quét mã VietQR chuyển khoản nhanh 3 giây qua mọi App ngân hàng',
    donateCoffee: 'Ly cà phê (30k)',
    donateEventPlan: 'Gói Sự Kiện 30 Ngày (300k)',
    donateYearlyPlan: 'Gói Cả Năm 365 Ngày (600k)',
    donateCustom: 'Tùy tâm (Tự nhập trên App ngân hàng)',
    donateBankLabel: 'Ngân hàng',
    donateAccNumLabel: 'Số tài khoản',
    donateAccOwnerLabel: 'Chủ tài khoản',
    donateSyntaxLabel: 'Nội dung chuyển khoản',
    donateClose: 'Đóng',
    donateCopied: 'Đã sao chép vào bộ nhớ tạm',
  },
  en: {
    pinTitle: 'BOOTH CRM',
    pinDesc: 'Enter your security PIN (4-10 characters) to access the live customer list',
    pinPlaceholder: 'Enter PIN...',
    pinUnlocking: 'Unlocking...',
    pinUnlockBtn: 'UNLOCK CRM LIVE',
    pinSecurityNote: 'Secured area for booth representatives only',
    pinSecurityDesc: 'Please enter the PIN provided during booth handover to unlock customer data.',
    pinIncorrect: 'Incorrect PIN',
    pinSuccess: 'CRM unlocked successfully!',
    backToExpo: 'Back to Expo Hub',
    location: 'Location',
    changePin: 'Change PIN',
    downloadStandee: 'Download Standee',
    backExpo: 'Expo Hub',
    scanPage: 'Scan Page',
    exportExcel: 'EXPORT EXCEL',
    totalScanned: 'Total Scanned',
    latestCustomer: 'Latest Customer',
    noCustomerYet: 'No customers yet',
    realtimeAlert: 'Realtime Alerts',
    realtimeDesc: 'When visitors scan the QR code at your booth, data updates instantly and a <b>Ting!</b> chime will play.',
    searchPlaceholder: 'Search by name, phone, company...',
    show: 'Show',
    perPage: '/ page',
    refreshList: 'Refresh list',
    noMatchFound: 'No matching customers found',
    noScansYet: 'No scans yet',
    inviteScanDesc: 'Invite visitors to scan the QR code at your booth to collect contacts automatically.',
    openContactPage: 'Open contact page',
    showingRange: 'Showing',
    inTotal: 'of',
    scanned: 'scanned',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    thNo: '#',
    thCustomer: 'Customer',
    thCompany: 'Company',
    thPhone: 'Phone',
    thEmail: 'Email',
    thInterest: 'Interest',
    thTime: 'Time',
    newBadge: 'NEW',
    newCustomer: 'New customer',
    newScan: 'New visitor scanned',
    copiedLabel: 'Copied',
    exportSuccess: 'Excel file downloaded successfully!',
    exportEmpty: 'No customer data to export',
    exportError: 'Error exporting Excel file',
    soundOk: 'Ting-Ting chime is working!',
    changePinTitle: 'Change CRM PIN',
    boothLabel: 'Booth',
    oldPinLabel: 'Current PIN',
    oldPinPlaceholder: 'Enter your current PIN...',
    newPinLabel: 'New PIN',
    newPinPlaceholder: 'Enter new PIN (4-10 characters)...',
    confirmPinLabel: 'Confirm new PIN',
    confirmPinPlaceholder: 'Re-enter new PIN to confirm...',
    pinLengthHint: '4 to 10 alphanumeric characters.',
    showChars: 'Show characters',
    hideChars: 'Hide characters',
    cancelBtn: 'Cancel',
    updatingBtn: 'Updating...',
    confirmChangePinBtn: 'CONFIRM CHANGE PIN',
    errOldPinRequired: 'Please enter your current PIN',
    errNewPinRequired: 'Please enter a new PIN',
    errPinFormat: 'New PIN must be 4-10 alphanumeric characters',
    errPinMismatch: 'New PIN and confirmation do not match',
    errPinSame: 'New PIN must be different from current PIN',
    changePinSuccess: '🎉 CRM PIN changed successfully!',
    changePinFail: 'Failed to change PIN',
    xlNo: '#',
    xlTime: 'Time',
    xlName: 'Full Name',
    xlPhone: 'Phone',
    xlCompany: 'Company',
    xlInterest: 'Interest',
    xlLang: 'Language',
    donateBannerTitle: 'Enjoy 1Booking Expo? Buy us a coffee / Donate',
    donateBannerSubtitle: 'Independent digital booth platform • Support our engineering team',
    donateBtn: '☕ Buy Coffee / Donate',
    donateModalTitle: 'Buy Team a Coffee / Donate',
    donateModalSubtitle: 'Scan VietQR to transfer instantly via any banking app',
    donateCoffee: 'A coffee (30,000đ)',
    donateEventPlan: 'Event Plan 30 Days (300,000đ)',
    donateYearlyPlan: 'Yearly Plan 365 Days (600,000đ)',
    donateCustom: 'Any amount (Enter in your banking app)',
    donateBankLabel: 'Bank',
    donateAccNumLabel: 'Account Number',
    donateAccOwnerLabel: 'Account Holder',
    donateSyntaxLabel: 'Transfer Message',
    donateClose: 'Close',
    donateCopied: 'Copied to clipboard',
  },
  ko: {
    pinTitle: '부스 CRM',
    pinDesc: '보안 PIN (4-10자)을 입력하여 실시간 고객 목록에 접근하세요',
    pinPlaceholder: 'PIN 입력...',
    pinUnlocking: '잠금 해제 중...',
    pinUnlockBtn: 'CRM 잠금 해제',
    pinSecurityNote: '부스 담당자 전용 보안 영역',
    pinSecurityDesc: '부스 인수 시 제공된 PIN을 입력하여 고객 데이터를 잠금 해제하세요.',
    pinIncorrect: 'PIN이 올바르지 않습니다',
    pinSuccess: 'CRM 잠금 해제 성공!',
    backToExpo: '엑스포 허브로',
    location: '위치',
    changePin: 'PIN 변경',
    downloadStandee: '스탠디 다운로드',
    backExpo: '엑스포',
    scanPage: '스캔 페이지',
    exportExcel: '엑셀 내보내기',
    totalScanned: '총 스캔 수',
    latestCustomer: '최근 고객',
    noCustomerYet: '아직 고객이 없습니다',
    realtimeAlert: '실시간 알림',
    realtimeDesc: '방문자가 부스에서 QR 코드를 스캔하면 데이터가 즉시 업데이트되고 <b>띵!</b> 알림음이 울립니다.',
    searchPlaceholder: '이름, 전화번호, 회사명으로 검색...',
    show: '표시',
    perPage: '/ 페이지',
    refreshList: '목록 새로고침',
    noMatchFound: '일치하는 고객이 없습니다',
    noScansYet: '아직 스캔이 없습니다',
    inviteScanDesc: '방문자에게 부스의 QR 코드를 스캔하도록 안내하여 자동으로 연락처를 수집하세요.',
    openContactPage: '연락처 페이지 열기',
    showingRange: '표시 중',
    inTotal: '/',
    scanned: '스캔',
    prevPage: '이전 페이지',
    nextPage: '다음 페이지',
    thNo: '#',
    thCustomer: '고객',
    thCompany: '회사',
    thPhone: '전화번호',
    thEmail: '이메일',
    thInterest: '관심사항',
    thTime: '시간',
    newBadge: 'NEW',
    newCustomer: '신규 고객',
    newScan: '새 방문자 스캔',
    copiedLabel: '복사됨',
    exportSuccess: '엑셀 파일 다운로드 완료!',
    exportEmpty: '내보낼 고객 데이터가 없습니다',
    exportError: '엑셀 파일 내보내기 오류',
    soundOk: '알림음이 정상 작동합니다!',
    changePinTitle: 'CRM PIN 변경',
    boothLabel: '부스',
    oldPinLabel: '현재 PIN',
    oldPinPlaceholder: '현재 PIN 입력...',
    newPinLabel: '새 PIN',
    newPinPlaceholder: '새 PIN 입력 (4-10자)...',
    confirmPinLabel: '새 PIN 확인',
    confirmPinPlaceholder: '새 PIN 재입력...',
    pinLengthHint: '4~10자 영숫자.',
    showChars: '문자 표시',
    hideChars: '문자 숨기기',
    cancelBtn: '취소',
    updatingBtn: '업데이트 중...',
    confirmChangePinBtn: 'PIN 변경 확인',
    errOldPinRequired: '현재 PIN을 입력하세요',
    errNewPinRequired: '새 PIN을 입력하세요',
    errPinFormat: '새 PIN은 4-10자 영숫자여야 합니다',
    errPinMismatch: '새 PIN과 확인 PIN이 일치하지 않습니다',
    errPinSame: '새 PIN은 현재 PIN과 달라야 합니다',
    changePinSuccess: '🎉 CRM PIN 변경 완료!',
    changePinFail: 'PIN 변경 실패',
    xlNo: '#',
    xlTime: '시간',
    xlName: '이름',
    xlPhone: '전화번호',
    xlCompany: '회사',
    xlInterest: '관심사항',
    xlLang: '언어',
    donateBannerTitle: '1Booking Expo가 마음에 드시나요? 커피 한 잔 후원하기',
    donateBannerSubtitle: '독립 부스 디지털 플랫폼 • 기술팀 개발 후원',
    donateBtn: '☕ 커피 후원 / 도네이션',
    donateModalTitle: '팀 커피 후원 / 기부',
    donateModalSubtitle: '모든 은행 앱에서 3초 만에 VietQR 스캔 송금',
    donateCoffee: '커피 한 잔 (30,000동)',
    donateEventPlan: '30일 행사 패스 (300,000동)',
    donateYearlyPlan: '1년 연간 패스 (600,000동)',
    donateCustom: '자율 금액 (은행 앱에서 직접 입력)',
    donateBankLabel: '은행',
    donateAccNumLabel: '계좌번호',
    donateAccOwnerLabel: '예금주',
    donateSyntaxLabel: '송금 메모',
    donateClose: '닫기',
    donateCopied: '클립보드에 복사되었습니다',
  },
  zh: {
    pinTitle: '展位 CRM',
    pinDesc: '请输入安全PIN码（4-10位）以访问实时客户列表',
    pinPlaceholder: '输入PIN码...',
    pinUnlocking: '正在解锁...',
    pinUnlockBtn: '解锁 CRM',
    pinSecurityNote: '仅限展位代表访问的安全区域',
    pinSecurityDesc: '请输入展位交接时提供的PIN码以解锁客户数据。',
    pinIncorrect: 'PIN码不正确',
    pinSuccess: 'CRM解锁成功！',
    backToExpo: '返回展会名录',
    location: '位置',
    changePin: '修改PIN',
    downloadStandee: '下载立牌',
    backExpo: '展会',
    scanPage: '扫描页',
    exportExcel: '导出Excel',
    totalScanned: '总扫描数',
    latestCustomer: '最新客户',
    noCustomerYet: '暂无客户',
    realtimeAlert: '实时通知',
    realtimeDesc: '访客在展位扫描QR码后，数据即时更新并播放<b>叮！</b>提示音。',
    searchPlaceholder: '按姓名、电话、公司搜索...',
    show: '显示',
    perPage: '/ 页',
    refreshList: '刷新列表',
    noMatchFound: '未找到匹配的客户',
    noScansYet: '暂无扫描记录',
    inviteScanDesc: '请引导访客扫描展位QR码，自动收集联系方式。',
    openContactPage: '打开联系页面',
    showingRange: '显示',
    inTotal: '共',
    scanned: '条扫描',
    prevPage: '上一页',
    nextPage: '下一页',
    thNo: '#',
    thCustomer: '客户',
    thCompany: '公司',
    thPhone: '电话',
    thEmail: '邮箱',
    thInterest: '需求',
    thTime: '时间',
    newBadge: 'NEW',
    newCustomer: '新客户',
    newScan: '新访客扫描',
    copiedLabel: '已复制',
    exportSuccess: 'Excel文件下载成功！',
    exportEmpty: '暂无客户数据可导出',
    exportError: '导出Excel文件失败',
    soundOk: '提示音正常运行！',
    changePinTitle: '修改CRM PIN码',
    boothLabel: '展位',
    oldPinLabel: '当前PIN码',
    oldPinPlaceholder: '输入当前PIN码...',
    newPinLabel: '新PIN码',
    newPinPlaceholder: '输入新PIN码（4-10位）...',
    confirmPinLabel: '确认新PIN码',
    confirmPinPlaceholder: '再次输入新PIN码...',
    pinLengthHint: '4至10位字母或数字。',
    showChars: '显示字符',
    hideChars: '隐藏字符',
    cancelBtn: '取消',
    updatingBtn: '更新中...',
    confirmChangePinBtn: '确认修改PIN',
    errOldPinRequired: '请输入当前PIN码',
    errNewPinRequired: '请输入新PIN码',
    errPinFormat: '新PIN码必须为4-10位字母或数字',
    errPinMismatch: '新PIN码与确认不一致',
    errPinSame: '新PIN码不能与当前PIN码相同',
    changePinSuccess: '🎉 CRM PIN码修改成功！',
    changePinFail: '修改PIN码失败',
    xlNo: '#',
    xlTime: '时间',
    xlName: '姓名',
    xlPhone: '电话',
    xlCompany: '公司',
    xlInterest: '需求',
    xlLang: '语言',
    donateBannerTitle: '喜欢 1Booking Expo 吗？请团队喝杯咖啡 / 随心赞助',
    donateBannerSubtitle: '独立展位数字化工具 • 支持技术团队持续优化',
    donateBtn: '☕ 请喝咖啡 / 赞助',
    donateModalTitle: '请团队喝杯咖啡 / 随心赞助',
    donateModalSubtitle: '使用任何手机银行 App 扫描 VietQR 3秒完成转账',
    donateCoffee: '一杯咖啡 (30,000đ)',
    donateEventPlan: '30天展会套餐 (300,000đ)',
    donateYearlyPlan: '365天全年套餐 (600,000đ)',
    donateCustom: '随心金额 (在银行App中自行填写)',
    donateBankLabel: '开户银行',
    donateAccNumLabel: '银行账号',
    donateAccOwnerLabel: '账户姓名',
    donateSyntaxLabel: '转账附言',
    donateClose: '关闭',
    donateCopied: '已复制到剪贴板',
  },
};

// ═══════════════════════════════════════
// EXPO CONTACT MODAL TRANSLATIONS
// ═══════════════════════════════════════
export const CONTACT_MODAL_TRANSLATIONS: Record<ExpoLanguage, {
  badge: string;
  title: string;
  desc: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  businessLabel: string;
  businessPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  serviceLabel: string;
  services: string[];
  messageLabel: string;
  messagePlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  successTitle: string;
  successDesc: string;
  finishBtn: string;
  errRequired: string;
  errGeneral: string;
}> = {
  vi: {
    badge: '1Booking Expo Pass',
    title: 'Liên Hệ 1Booking Expo Pass',
    desc: 'Để lại thông tin để được tư vấn số hóa gian hàng, cấp Standee thông minh & kích hoạt Mini-CRM Live thời gian thực.',
    nameLabel: 'Họ và tên',
    namePlaceholder: 'Ví dụ: Nguyễn Văn A',
    phoneLabel: 'Số điện thoại / Zalo',
    phonePlaceholder: '0918 731 411...',
    businessLabel: 'Tên Doanh nghiệp / Vị trí Gian hàng',
    businessPlaceholder: 'Công ty TNHH... (Gian hàng A12)',
    emailLabel: 'Email công việc',
    emailPlaceholder: 'contact@company.com',
    serviceLabel: 'Nhu cầu dịch vụ',
    services: [
      'Số hóa gian hàng mới',
      'Làm Standee để bàn & QR',
      'Hệ thống Mini-CRM lưu khách',
      'Hợp tác & Kết nối B2B',
      'Tư vấn báo giá giải pháp',
    ],
    messageLabel: 'Ghi chú thêm (nếu có)',
    messagePlaceholder: 'Nội dung cần hỗ trợ hoặc yêu cầu cụ thể...',
    submitBtn: 'GỬI YÊU CẦU TƯ VẤN',
    submittingBtn: 'Đang gửi yêu cầu...',
    successTitle: 'Gửi Yêu Cầu Thành Công!',
    successDesc: 'Cảm ơn Quý doanh nghiệp đã quan tâm đến giải pháp 1Booking Expo Pass. Đội ngũ chuyên viên tư vấn sẽ liên hệ lại qua Số điện thoại / Zalo trong vòng 15 phút!',
    finishBtn: 'Hoàn Tất & Đóng',
    errRequired: 'Vui lòng điền Họ tên và Số điện thoại liên hệ',
    errGeneral: 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.',
  },
  en: {
    badge: '1Booking Expo Pass',
    title: 'Contact 1Booking Expo Pass',
    desc: 'Leave your details to get a consultation on booth digitization, smart standees & real-time Mini-CRM activation.',
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Doe',
    phoneLabel: 'Contact Phone / WhatsApp',
    phonePlaceholder: '+1 555 123 4567',
    businessLabel: 'Company Name / Booth Number',
    businessPlaceholder: 'Acme Corp (Booth A12)',
    emailLabel: 'Business Email',
    emailPlaceholder: 'contact@company.com',
    serviceLabel: 'Service Needed',
    services: [
      'Digitize new expo booth',
      'Smart tabletop standee & QR',
      'Live Mini-CRM visitor capture',
      'B2B partnership & networking',
      'Solution quote & consultation',
    ],
    messageLabel: 'Additional Notes (optional)',
    messagePlaceholder: 'Specific requirements or questions...',
    submitBtn: 'SUBMIT INQUIRY',
    submittingBtn: 'Submitting...',
    successTitle: 'Inquiry Sent Successfully!',
    successDesc: 'Thank you for your interest in 1Booking Expo Pass! Our team will reach out via Phone / WhatsApp within 15 minutes.',
    finishBtn: 'Done & Close',
    errRequired: 'Please enter your Full Name and Contact Phone',
    errGeneral: 'Unable to submit at this time. Please try again.',
  },
  ko: {
    badge: '1Booking Expo Pass',
    title: '1Booking Expo Pass 문의하기',
    desc: '부스 디지털화, 스마트 스탠디 제작 및 실시간 미니 CRM 도입 상담을 위해 정보를 남겨주세요.',
    nameLabel: '성함',
    namePlaceholder: '예: 홍길동',
    phoneLabel: '연락처 (전화번호 / 카카오톡)',
    phonePlaceholder: '010-1234-5678',
    businessLabel: '회사명 / 부스 번호',
    businessPlaceholder: '(주) 글로벌파트너스 (부스 A12)',
    emailLabel: '업무용 이메일',
    emailPlaceholder: 'contact@company.com',
    serviceLabel: '필요한 서비스',
    services: [
      '신규 부스 디지털화',
      '스마트 탁상 스탠디 & QR 제작',
      '실시간 고객 수집 미니 CRM',
      'B2B 제휴 및 비즈니스 협력',
      '도입 비용 및 솔루션 상담',
    ],
    messageLabel: '추가 요청사항 (선택사항)',
    messagePlaceholder: '구체적인 요구사항이나 문의사항...',
    submitBtn: '상담 요청 전송',
    submittingBtn: '전송 중...',
    successTitle: '상담 요청이 완료되었습니다!',
    successDesc: '1Booking Expo Pass에 관심을 가져주셔서 감사합니다. 전담 상담원이 15분 이내에 연락드리겠습니다.',
    finishBtn: '완료 및 닫기',
    errRequired: '성함과 연락처를 입력해 주세요',
    errGeneral: '지금은 전송할 수 없습니다. 다시 시도해 주세요.',
  },
  zh: {
    badge: '1Booking Expo Pass',
    title: '联系 1Booking Expo Pass',
    desc: '留下您的信息，获取展位数字化、智能桌牌及实时微型CRM系统的专业咨询。',
    nameLabel: '姓名',
    namePlaceholder: '例如：张伟',
    phoneLabel: '联系电话 / 微信',
    phonePlaceholder: '+86 138 0013 8000',
    businessLabel: '企业名称 / 展位编号',
    businessPlaceholder: '环球商贸有限公司 (展位 A12)',
    emailLabel: '企业邮箱',
    emailPlaceholder: 'contact@company.com',
    serviceLabel: '所需服务',
    services: [
      '新展位数字化搭建',
      '智能桌面立牌与二维码制作',
      '实时获客微型CRM系统',
      'B2B合作与商务对接',
      '方案报价与定制咨询',
    ],
    messageLabel: '补充备注（选填）',
    messagePlaceholder: '具体需求或需要支持的内容...',
    submitBtn: '提交咨询需求',
    submittingBtn: '正在提交...',
    successTitle: '咨询需求提交成功！',
    successDesc: '感谢您关注 1Booking Expo Pass 解决方案！我们的专业顾问将在15分钟内通过电话或微信与您取得联系。',
    finishBtn: '完成并关闭',
    errRequired: '请填写姓名和联系电话',
    errGeneral: '暂时无法提交，请稍后重试。',
  },
};
