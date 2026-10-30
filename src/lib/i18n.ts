// src/lib/i18n.ts
export type AppLanguage = 'vi' | 'en' | 'ko' | 'zh';

export const APP_LANG_STORAGE_KEY = 'app_lang';
export const EXPO_LANG_STORAGE_KEY = '1booking_expo_lang';

export interface LanguageItem {
  code: AppLanguage;
  label: string;
  nativeName: string;
  flag: string;
}

export const APP_LANGUAGES: LanguageItem[] = [
  { code: 'vi', label: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ko', label: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

/**
 * Đọc ngôn ngữ hiện tại từ URL query param, localStorage, hoặc fallback về 'vi'
 */
export function getAppLanguage(fallback: AppLanguage = 'vi'): AppLanguage {
  if (typeof window === 'undefined') return fallback;
  try {
    const urlParam = new URLSearchParams(window.location.search).get('lang') as AppLanguage;
    if (urlParam && ['vi', 'en', 'ko', 'zh'].includes(urlParam)) {
      try {
        localStorage.setItem(APP_LANG_STORAGE_KEY, urlParam);
        localStorage.setItem(EXPO_LANG_STORAGE_KEY, urlParam);
      } catch {}
      return urlParam;
    }
    const cached = (localStorage.getItem(APP_LANG_STORAGE_KEY) || localStorage.getItem(EXPO_LANG_STORAGE_KEY)) as AppLanguage;
    if (cached && ['vi', 'en', 'ko', 'zh'].includes(cached)) {
      return cached;
    }
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Lưu ngôn ngữ và phát sự kiện đồng bộ toàn ứng dụng
 */
export function setAppLanguage(lang: AppLanguage) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_LANG_STORAGE_KEY, lang);
    localStorage.setItem(EXPO_LANG_STORAGE_KEY, lang);

    // Cập nhật param trên URL mà không reload trang
    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') !== lang) {
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url.toString());
    }

    // Phát custom event để mọi component re-render tức thì
    window.dispatchEvent(new CustomEvent('app_lang_change', { detail: lang }));
  } catch {
    // ignore
  }
}

/**
 * Gắn thêm param ?lang= vào URL
 */
export function withLang(urlPath: string, lang: AppLanguage): string {
  if (!urlPath) return urlPath;
  const separator = urlPath.includes('?') ? '&' : '?';
  if (urlPath.includes('lang=')) {
    return urlPath.replace(/([?&])lang=[^&]*/, `$1lang=${lang}`);
  }
  return `${urlPath}${separator}lang=${lang}`;
}

// ══════════════════════════════════════════════════════════════════════════════════
// BỘ TỪ ĐIỂN TOÀN CỤC CHO 1BOOKING.ASIA & 1BEAUTY.ASIA (VI - EN - KO - ZH)
// ══════════════════════════════════════════════════════════════════════════════════
export const SITE_I18N: Record<AppLanguage, {
  nav: {
    home: string;
    deals: string;
    party: string;
    expo: string;
    categories: string;
    locations: string;
    pricing: string;
    forBusiness: string;
    contactSupport: string;
    login: string;
    dashboard: string;
    manageBooth: string;
    viewAll: string;
    noData: string;
    back: string;
    menu: string;
    searchPlaceholder: string;
  };
  footer: {
    brandDesc: string;
    categories: string;
    locations: string;
    support: string;
    hotline: string;
    viewAll: string;
    rightsReserved: string;
    platformTag: string;
  };
  biz: {
    specialOffer: string;
    exclusiveDeals: string;
    getDealNow: string;
    viewMenu: string;
    bookTable: string;
    bookService: string;
    callNow: string;
    zaloChat: string;
    address: string;
    openHours: string;
    aboutUs: string;
    gallery: string;
    amenities: string;
    vipRooms: string;
    guestCapacity: string;
    share: string;
    shareCopied: string;
    copyLink: string;
    formFullName: string;
    formPhone: string;
    formNotes: string;
    formSubmit: string;
    formSuccessTitle: string;
    formSuccessDesc: string;
    close: string;
    backToHome: string;
    directions: string;
  };
  pricing: {
    pageTitle: string;
    pageSubtitle: string;
    dealSection: string;
    partySection: string;
    expoSection: string;
    standardPlan: string;
    vipPlan: string;
    eventPlan: string;
    yearlyPlan: string;
    perYear: string;
    perMonth: string;
    popularBadge: string;
    registerNow: string;
    featuresIncluded: string;
    moneyBackGuarantee: string;
  };
}> = {
  vi: {
    nav: {
      home: 'Trang Chủ',
      deals: 'Ưu Đãi',
      party: 'Phố Tiệc 🎉',
      expo: 'Hội Chợ Expo 🏢',
      categories: 'Danh Mục',
      locations: 'Địa Điểm',
      pricing: 'Bảng Giá',
      forBusiness: 'Dành cho Doanh nghiệp',
      contactSupport: 'Liên hệ hỗ trợ',
      login: 'Đăng nhập / Đăng ký',
      dashboard: 'Quản lý',
      manageBooth: 'Quản lý Gian hàng',
      viewAll: 'Xem tất cả',
      noData: 'Chưa có dữ liệu',
      back: 'Quay lại',
      menu: 'Menu',
      searchPlaceholder: 'Tìm kiếm quán, dịch vụ, ưu đãi...',
    },
    footer: {
      brandDesc: 'Nền tảng cẩm nang số hóa, tra cứu ưu đãi độc quyền và kết nối giao thương hàng đầu Việt Nam.',
      categories: 'Danh Mục Nổi Bật',
      locations: 'Địa Điểm Phổ Biến',
      support: 'Hỗ Trợ & Liên Hệ',
      hotline: 'Hotline / Zalo hỗ trợ',
      viewAll: 'Xem tất cả →',
      rightsReserved: 'Bảo lưu mọi quyền.',
      platformTag: 'Cẩm nang số & Kết nối giao thương',
    },
    biz: {
      specialOffer: 'ƯU ĐÃI ĐẶC BIỆT',
      exclusiveDeals: 'Các Gói Ưu Đãi & Dịch Vụ',
      getDealNow: 'Nhận Ưu Đãi Ngay',
      viewMenu: 'Xem Menu Thực Đơn',
      bookTable: 'Đặt Bàn Ngay',
      bookService: 'Đặt Lịch Dịch Vụ',
      callNow: 'Gọi Hotline',
      zaloChat: 'Nhắn Zalo',
      address: 'Địa chỉ',
      openHours: 'Giờ mở cửa',
      aboutUs: 'Giới Thiệu Thương Hiệu',
      gallery: 'Hình Ảnh Thực Tế',
      amenities: 'Không Gian & Tiện Ích',
      vipRooms: 'Phòng VIP riêng tư',
      guestCapacity: 'Sức chứa khách',
      share: 'Chia sẻ',
      shareCopied: 'Đã sao chép liên kết!',
      copyLink: 'Sao chép link',
      formFullName: 'Họ và tên của bạn',
      formPhone: 'Số điện thoại nhận ưu đãi',
      formNotes: 'Yêu cầu đặc biệt (số lượng khách, giờ đến...)',
      formSubmit: 'XÁC NHẬN ĐĂNG KÝ',
      formSuccessTitle: '🎉 Đăng Ký Thành Công!',
      formSuccessDesc: 'Cửa hàng đã nhận được thông tin và sẽ liên hệ hỗ trợ bạn ngay.',
      close: 'Đóng',
      backToHome: 'Về Trang Chủ',
      directions: 'Chỉ Đường',
    },
    pricing: {
      pageTitle: 'Bảng Giá Kích Hoạt Dịch Vụ 2026',
      pageSubtitle: 'Giải pháp số hóa gian hàng, trang ưu đãi và kết nối khách hàng B2B/B2C trọn gói 24/7.',
      dealSection: '1. Gói Trang Ưu Đãi Doanh Nghiệp',
      partySection: '2. Gói Phố Tiệc & Sự Kiện F&B',
      expoSection: '3. Gói 1Booking Expo Pass Hội Chợ',
      standardPlan: 'Gói Tiêu Chuẩn',
      vipPlan: 'Gói VIP Chìa Khóa Trao Tay',
      eventPlan: 'Gói Sự Kiện (30 Ngày)',
      yearlyPlan: 'Gói Toàn Niên (365 Ngày)',
      perYear: '/ năm',
      perMonth: '/ tháng',
      popularBadge: 'LỰA CHỌN PHỔ BIẾN ⭐',
      registerNow: 'Kích Hoạt Ngay',
      featuresIncluded: 'Quyền lợi bao gồm:',
      moneyBackGuarantee: 'Kích hoạt tự động qua VietQR 24/7',
    },
  },

  en: {
    nav: {
      home: 'Home',
      deals: 'Deals & Offers',
      party: 'Party Street 🎉',
      expo: 'Expo Pass 🏢',
      categories: 'Categories',
      locations: 'Locations',
      pricing: 'Pricing',
      forBusiness: 'For Business',
      contactSupport: 'Customer Support',
      login: 'Sign In / Register',
      dashboard: 'Dashboard',
      manageBooth: 'Manage Booth',
      viewAll: 'View all',
      noData: 'No data available',
      back: 'Back',
      menu: 'Menu',
      searchPlaceholder: 'Search venues, services, deals...',
    },
    footer: {
      brandDesc: 'Leading digital directory, exclusive deals, and premier B2B/B2C networking platform in Vietnam.',
      categories: 'Top Categories',
      locations: 'Popular Locations',
      support: 'Support & Contact',
      hotline: 'Hotline / WhatsApp / Zalo',
      viewAll: 'View all →',
      rightsReserved: 'All rights reserved.',
      platformTag: 'Digital Directory & Business Networking',
    },
    biz: {
      specialOffer: 'SPECIAL OFFER',
      exclusiveDeals: 'Exclusive Deals & Services',
      getDealNow: 'Get Offer Now',
      viewMenu: 'View Menu & Prices',
      bookTable: 'Book a Table',
      bookService: 'Book Appointment',
      callNow: 'Call Hotline',
      zaloChat: 'Chat Online',
      address: 'Address',
      openHours: 'Opening Hours',
      aboutUs: 'About This Brand',
      gallery: 'Photo Gallery',
      amenities: 'Spaces & Amenities',
      vipRooms: 'Private VIP Rooms',
      guestCapacity: 'Guest Capacity',
      share: 'Share',
      shareCopied: 'Link copied to clipboard!',
      copyLink: 'Copy link',
      formFullName: 'Your Full Name',
      formPhone: 'Contact Phone Number',
      formNotes: 'Special requests (guest count, arrival time...)',
      formSubmit: 'CONFIRM REGISTRATION',
      formSuccessTitle: '🎉 Registration Confirmed!',
      formSuccessDesc: 'We have received your request and will contact you promptly.',
      close: 'Close',
      backToHome: 'Back to Home',
      directions: 'Get Directions',
    },
    pricing: {
      pageTitle: 'Official Service Pricing 2026',
      pageSubtitle: 'Digital booth showcase, promotional deals, and 24/7 B2B/B2C automated customer lead engine.',
      dealSection: '1. Business Deal Page Package',
      partySection: '2. F&B Party & Event Package',
      expoSection: '3. 1Booking Expo Pass Package',
      standardPlan: 'Standard Plan',
      vipPlan: 'VIP Turnkey Plan',
      eventPlan: 'Event Plan (30 Days)',
      yearlyPlan: 'Annual Plan (365 Days)',
      perYear: '/ year',
      perMonth: '/ month',
      popularBadge: 'MOST POPULAR ⭐',
      registerNow: 'Activate Now',
      featuresIncluded: 'Included features:',
      moneyBackGuarantee: 'Instant VietQR 24/7 Activation',
    },
  },

  ko: {
    nav: {
      home: '홈',
      deals: '특가 혜택',
      party: '파티 스트리트 🎉',
      expo: '엑스포 패스 🏢',
      categories: '카테고리',
      locations: '지역',
      pricing: '요금 안내',
      forBusiness: '기업 서비스',
      contactSupport: '고객 지원',
      login: '로그인 / 회원가입',
      dashboard: '관리자',
      manageBooth: '부스 관리',
      viewAll: '전체 보기',
      noData: '데이터가 없습니다',
      back: '뒤로가기',
      menu: '메뉴',
      searchPlaceholder: '매장, 서비스, 혜택 검색...',
    },
    footer: {
      brandDesc: '베트남 최고의 디지털 비즈니스 디렉토리, 독점 프로모션 및 B2B/B2C 네트워킹 플랫폼입니다.',
      categories: '주요 카테고리',
      locations: '인기 지역',
      support: '고객지원 및 문의',
      hotline: '핫라인 / 카카오톡 / Zalo',
      viewAll: '전체 보기 →',
      rightsReserved: 'All rights reserved.',
      platformTag: '디지털 디렉토리 & 비즈니스 매칭',
    },
    biz: {
      specialOffer: '특별 혜택',
      exclusiveDeals: '전용 패키지 및 서비스',
      getDealNow: '혜택 받기',
      viewMenu: '메뉴 및 가격 보기',
      bookTable: '테이블 예약',
      bookService: '서비스 예약',
      callNow: '전화 문의',
      zaloChat: '실시간 채팅',
      address: '주소',
      openHours: '영업 시간',
      aboutUs: '브랜드 소개',
      gallery: '갤러리 사진',
      amenities: '공간 및 편의시설',
      vipRooms: '프라이빗 VIP 룸',
      guestCapacity: '수용 인원',
      share: '공유하기',
      shareCopied: '링크가 복사되었습니다!',
      copyLink: '링크 복사',
      formFullName: '성함',
      formPhone: '연락처',
      formNotes: '특별 요청사항 (인원수, 방문시간 등)',
      formSubmit: '예약 신청하기',
      formSuccessTitle: '🎉 예약이 접수되었습니다!',
      formSuccessDesc: '정보가 정상적으로 전달되었으며 곧 안내해 드리겠습니다.',
      close: '닫기',
      backToHome: '홈으로 이동',
      directions: '길 찾기',
    },
    pricing: {
      pageTitle: '2026 서비스 공식 요금표',
      pageSubtitle: '디지털 부스, 프로모션 혜택 페이지 및 24시간 자동 B2B/B2C 고객 연결 솔루션입니다.',
      dealSection: '1. 기업 혜택 페이지 플랜',
      partySection: '2. F&B 파티 및 이벤트 플랜',
      expoSection: '3. 1Booking 엑스포 패스 플랜',
      standardPlan: '스탠다드 플랜',
      vipPlan: 'VIP 턴키 플랜',
      eventPlan: '이벤트 플랜 (30일)',
      yearlyPlan: '연간 플랜 (365일)',
      perYear: '/ 년',
      perMonth: '/ 월',
      popularBadge: '가장 인기 있는 플랜 ⭐',
      registerNow: '지금 활성화하기',
      featuresIncluded: '포함된 혜택:',
      moneyBackGuarantee: 'VietQR 실시간 자동 활성화 24/7',
    },
  },

  zh: {
    nav: {
      home: '首页',
      deals: '特惠活动',
      party: '宴会街 🎉',
      expo: '展会通 🏢',
      categories: '行业分类',
      locations: '热门地区',
      pricing: '收费标准',
      forBusiness: '企业入驻',
      contactSupport: '联系客服',
      login: '登录 / 注册',
      dashboard: '管理后台',
      manageBooth: '展位管理',
      viewAll: '查看全部',
      noData: '暂无数据',
      back: '返回',
      menu: '菜单',
      searchPlaceholder: '搜索店铺、服务、优惠...',
    },
    footer: {
      brandDesc: '越南领先的数字化商务指南、独家优惠推荐及优质 B2B/B2C 商业对接平台。',
      categories: '热门分类',
      locations: '主要城市',
      support: '客服与支持',
      hotline: '客服热线 / 微信 / Zalo',
      viewAll: '查看全部 →',
      rightsReserved: '版权所有。',
      platformTag: '数字化商务名录与商业对接',
    },
    biz: {
      specialOffer: '独家特惠',
      exclusiveDeals: '精选优惠与服务项目',
      getDealNow: '立即领取特惠',
      viewMenu: '查看菜单与价目表',
      bookTable: '立即订座',
      bookService: '预约服务',
      callNow: '一键拨号',
      zaloChat: '在线咨询',
      address: '地址',
      openHours: '营业时间',
      aboutUs: '品牌介绍',
      gallery: '实景照片',
      amenities: '场地设施与特色',
      vipRooms: '独立 VIP 包厢',
      guestCapacity: '容纳人数',
      share: '分享',
      shareCopied: '链接已复制到剪贴板！',
      copyLink: '复制链接',
      formFullName: '您的姓名',
      formPhone: '联系电话',
      formNotes: '特殊需求（用餐人数、到达时间等）',
      formSubmit: '确认提交登记',
      formSuccessTitle: '🎉 登记成功！',
      formSuccessDesc: '已收到您的信息，我们将尽快与您取得联系。',
      close: '关闭',
      backToHome: '返回首页',
      directions: '一键导航',
    },
    pricing: {
      pageTitle: '2026年 官方服务价格表',
      pageSubtitle: '企业数字化展位展示、全网优惠推广及24小时全自动商务客源对接系统。',
      dealSection: '1. 企业特惠推广套餐',
      partySection: '2. 宴会社交与餐饮套餐',
      expoSection: '3. 1Booking 展会通套餐',
      standardPlan: '标准套餐',
      vipPlan: 'VIP 全包托管套餐',
      eventPlan: '展会特惠套餐 (30天)',
      yearlyPlan: '全年全能套餐 (365天)',
      perYear: '/ 年',
      perMonth: '/ 月',
      popularBadge: '最受欢迎套餐 ⭐',
      registerNow: '立即开通',
      featuresIncluded: '包含权益：',
      moneyBackGuarantee: 'VietQR 24/7 即时自动开通',
    },
  },
};
