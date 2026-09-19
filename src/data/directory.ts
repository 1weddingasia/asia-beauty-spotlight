import _biz1 from "@/assets/biz-1.jpg";
const biz1 = _biz1.src;
import _biz2 from "@/assets/biz-2.jpg";
const biz2 = _biz2.src;
import _biz3 from "@/assets/biz-3.jpg";
const biz3 = _biz3.src;
import _biz4 from "@/assets/biz-4.jpg";
const biz4 = _biz4.src;
import _biz5 from "@/assets/biz-5.jpg";
const biz5 = _biz5.src;
import _biz6 from "@/assets/biz-6.jpg";
const biz6 = _biz6.src;
import _hero1 from "@/assets/hero-1.jpg";
const hero1 = _hero1.src;
import _hero2 from "@/assets/hero-2.jpg";
const hero2 = _hero2.src;
import _hero3 from "@/assets/hero-3.jpg";
const hero3 = _hero3.src;

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Service = {
  name: string;
  description: string;
  price: string;
  duration: string;
};

export type Offer = {
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code?: string;
};

export type Business = {
  slug: string;
  name: string;
  tagline: string;
  category: string; // category slug
  location: string; // location slug
  address: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  rating: number;
  reviews: number;
  featured: boolean;
  verified: boolean;
  since: string;
  cover: string;
  gallery: string[];
  logoText: string;
  about: string;
  highlights: string[];
  services: Service[];
  offers: Offer[];
  team: { name: string; role: string }[];
  testimonials: { name: string; text: string; rating: number }[];
  faqs: { q: string; a: string }[];
  tags: string[];
};

export const heroSlides = [
  {
    image: hero1,
    kicker: "1Beauty.Asia — Danh bạ làm đẹp cao cấp",
    title: "Nơi hội tụ tinh hoa ngành làm đẹp châu Á",
    description:
      "Khám phá hàng trăm spa, thẩm mỹ viện, salon và học viện uy tín, được tuyển chọn kỹ lưỡng.",
    cta: "Khám phá danh bạ",
  },
  {
    image: hero2,
    kicker: "Salon & Hair Studio",
    title: "Chọn đúng chuyên gia cho phong cách của bạn",
    description:
      "So sánh dịch vụ, bảng giá và ưu đãi từ những thương hiệu hàng đầu chỉ trong vài giây.",
    cta: "Xem doanh nghiệp nổi bật",
  },
  {
    image: hero3,
    kicker: "Clinic & Skincare",
    title: "Chuẩn mực mới cho trải nghiệm làm đẹp",
    description:
      "Thông tin minh bạch, ưu đãi độc quyền và đánh giá thực tế từ cộng đồng yêu cái đẹp.",
    cta: "Nhận ưu đãi hôm nay",
  },
];

export const categories: Category[] = [
  {
    slug: "spa-massage",
    name: "Spa & Massage",
    description: "Thư giãn, chăm sóc cơ thể và trị liệu chuyên sâu.",
    icon: "Flower2",
  },
  {
    slug: "tham-my-vien",
    name: "Thẩm mỹ viện",
    description: "Công nghệ cao, trẻ hoá da và tạo hình thẩm mỹ.",
    icon: "Sparkles",
  },
  {
    slug: "hair-salon",
    name: "Hair Salon",
    description: "Cắt, uốn, nhuộm và phục hồi tóc chuẩn quốc tế.",
    icon: "Scissors",
  },
  {
    slug: "nail-lash",
    name: "Nail & Lash",
    description: "Nail art, nối mi, phun xăm thẩm mỹ tinh tế.",
    icon: "Hand",
  },
  {
    slug: "makeup-bridal",
    name: "Makeup & Bridal",
    description: "Trang điểm cô dâu, sự kiện và dạy nghề makeup.",
    icon: "Crown",
  },
  {
    slug: "barber-mens",
    name: "Barber & Men's Grooming",
    description: "Không gian chăm sóc dành riêng cho phái mạnh.",
    icon: "Scissors",
  },
];

export const locations = [
  { slug: "ho-chi-minh", name: "TP. Hồ Chí Minh" },
  { slug: "ha-noi", name: "Hà Nội" },
  { slug: "da-nang", name: "Đà Nẵng" },
  { slug: "singapore", name: "Singapore" },
  { slug: "bangkok", name: "Bangkok" },
];

export const businesses: Business[] = [
  {
    slug: "maison-de-nail",
    name: "Maison de Nail",
    tagline: "Nail couture theo phong cách Paris giữa lòng Sài Gòn",
    category: "nail-lash",
    location: "ho-chi-minh",
    address: "22 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh",
    phone: "+84 28 3822 1188",
    email: "hello@maisondenail.vn",
    website: "maisondenail.vn",
    hours: "09:00 – 21:00 (T2 – CN)",
    rating: 4.9,
    reviews: 428,
    featured: true,
    verified: true,
    since: "2016",
    cover: biz1,
    gallery: [biz1, biz4, biz6],
    logoText: "MN",
    about:
      "Maison de Nail là studio nail cao cấp với đội ngũ nghệ nhân được đào tạo tại Pháp. Không gian marble – brass sang trọng, quy trình vô trùng khép kín và bộ sưu tập màu độc quyền cập nhật theo mùa.",
    highlights: [
      "Dụng cụ tiệt trùng riêng cho từng khách",
      "Bộ màu độc quyền cập nhật theo mùa",
      "Đặt lịch riêng tư cho khách VIP",
    ],
    services: [
      {
        name: "Manicure Signature",
        description: "Chăm sóc móng tay, dưỡng da tay và sơn gel cao cấp.",
        price: "450.000₫",
        duration: "60 phút",
      },
      {
        name: "Nail Art Couture",
        description: "Thiết kế nail art thủ công theo yêu cầu riêng.",
        price: "từ 900.000₫",
        duration: "90 phút",
      },
      {
        name: "Nối mi Volume Hàn Quốc",
        description: "Sợi mi cao cấp, giữ nếp 4 – 6 tuần.",
        price: "1.200.000₫",
        duration: "120 phút",
      },
      {
        name: "Spa tay chân sâu",
        description: "Tẩy tế bào chết, ủ paraffin và massage thư giãn.",
        price: "550.000₫",
        duration: "75 phút",
      },
    ],
    offers: [
      {
        title: "Ưu đãi khách hàng mới",
        description: "Giảm 25% cho lần đầu trải nghiệm bất kỳ dịch vụ nail.",
        discount: "-25%",
        validUntil: "31/12/2026",
        code: "MN25",
      },
      {
        title: "Combo Mani + Pedi",
        description: "Tặng kèm liệu trình ủ paraffin trị giá 350.000₫.",
        discount: "Tặng quà",
        validUntil: "30/11/2026",
      },
    ],
    team: [
      { name: "Camille Trần", role: "Founder & Nail Artist" },
      { name: "Ngọc Anh", role: "Lash Specialist" },
    ],
    testimonials: [
      { name: "Hà My", text: "Không gian đẹp, kỹ thuật viên rất tỉ mỉ.", rating: 5 },
      { name: "Thu Trang", text: "Nail giữ form hơn 4 tuần, rất đáng tiền.", rating: 5 },
    ],
    faqs: [
      { q: "Có cần đặt lịch trước không?", a: "Nên đặt trước 1 – 2 ngày, đặc biệt cuối tuần." },
      { q: "Có phục vụ tại nhà không?", a: "Có, áp dụng cho nhóm từ 3 khách trong nội thành." },
    ],
    tags: ["nail art", "nối mi", "manicure", "pedicure", "quận 1"],
  },
  {
    slug: "lotus-serenity-spa",
    name: "Lotus Serenity Spa",
    tagline: "Trị liệu toàn thân theo triết lý Á Đông",
    category: "spa-massage",
    location: "ha-noi",
    address: "18 Phan Chu Trinh, Hoàn Kiếm, Hà Nội",
    phone: "+84 24 3936 7788",
    email: "care@lotusserenity.vn",
    website: "lotusserenity.vn",
    hours: "10:00 – 22:00 (T2 – CN)",
    rating: 4.8,
    reviews: 612,
    featured: true,
    verified: true,
    since: "2012",
    cover: biz2,
    gallery: [biz2, biz3, biz1],
    logoText: "LS",
    about:
      "Lotus Serenity Spa mang đến liệu trình trị liệu kết hợp thảo dược Việt và kỹ thuật massage Nhật Bản. 12 phòng trị liệu riêng tư, tinh dầu hữu cơ và đội ngũ kỹ thuật viên trên 8 năm kinh nghiệm.",
    highlights: [
      "12 phòng trị liệu riêng tư",
      "Tinh dầu hữu cơ nhập khẩu",
      "Chuyên gia trị liệu chứng chỉ quốc tế",
    ],
    services: [
      {
        name: "Massage đá nóng thảo dược",
        description: "Giải toả căng cơ sâu với đá bazan và túi thảo dược.",
        price: "890.000₫",
        duration: "90 phút",
      },
      {
        name: "Chăm sóc da mặt Hydra",
        description: "Làm sạch sâu, cấp ẩm và phục hồi hàng rào da.",
        price: "1.150.000₫",
        duration: "75 phút",
      },
      {
        name: "Gói thư giãn đôi",
        description: "Liệu trình dành cho cặp đôi trong phòng VIP.",
        price: "2.400.000₫",
        duration: "120 phút",
      },
    ],
    offers: [
      {
        title: "Giờ vàng thư giãn",
        description: "Giảm 30% cho khung giờ 10:00 – 14:00 các ngày trong tuần.",
        discount: "-30%",
        validUntil: "31/10/2026",
        code: "LOTUS30",
      },
    ],
    team: [
      { name: "Nguyễn Lan", role: "Spa Director" },
      { name: "Yuki Sato", role: "Chuyên gia trị liệu" },
    ],
    testimonials: [
      { name: "Minh Châu", text: "Không gian yên tĩnh, massage rất chuyên nghiệp.", rating: 5 },
      { name: "Đức Huy", text: "Gói đôi rất đáng thử, nhân viên chu đáo.", rating: 4 },
    ],
    faqs: [
      { q: "Có chỗ đậu ô tô không?", a: "Có hầm gửi xe miễn phí cho khách sử dụng dịch vụ." },
      { q: "Có bán thẻ thành viên?", a: "Có gói 10 buổi tiết kiệm đến 20%." },
    ],
    tags: ["massage", "trị liệu", "facial", "hoàn kiếm", "spa"],
  },
  {
    slug: "aurora-skin-clinic",
    name: "Aurora Skin Clinic",
    tagline: "Thẩm mỹ công nghệ cao chuẩn y khoa",
    category: "tham-my-vien",
    location: "ho-chi-minh",
    address: "95 Nguyễn Văn Trỗi, Phú Nhuận, TP. Hồ Chí Minh",
    phone: "+84 28 3997 5566",
    email: "info@auroraskin.vn",
    website: "auroraskin.vn",
    hours: "08:30 – 20:00 (T2 – T7)",
    rating: 4.9,
    reviews: 350,
    featured: true,
    verified: true,
    since: "2018",
    cover: biz3,
    gallery: [biz3, biz2, biz6],
    logoText: "AS",
    about:
      "Aurora Skin Clinic là phòng khám da liễu thẩm mỹ với đội ngũ bác sĩ chuyên khoa, thiết bị laser thế hệ mới và phác đồ cá nhân hoá dựa trên phân tích da bằng AI.",
    highlights: [
      "Bác sĩ da liễu trực tiếp thăm khám",
      "Máy laser Pico thế hệ mới",
      "Phân tích da miễn phí lần đầu",
    ],
    services: [
      {
        name: "Laser Pico trị nám",
        description: "Điều trị nám, tàn nhang, đồi mồi an toàn.",
        price: "từ 2.500.000₫",
        duration: "45 phút",
      },
      {
        name: "Trẻ hoá HIFU",
        description: "Nâng cơ, làm săn chắc vùng mặt và cằm.",
        price: "từ 6.900.000₫",
        duration: "90 phút",
      },
      {
        name: "Peel da chuyên sâu",
        description: "Cải thiện mụn, lỗ chân lông và sắc tố.",
        price: "1.500.000₫",
        duration: "60 phút",
      },
    ],
    offers: [
      {
        title: "Soi da & tư vấn miễn phí",
        description: "Miễn phí phân tích da chuyên sâu cho khách đặt lịch online.",
        discount: "Miễn phí",
        validUntil: "31/12/2026",
      },
      {
        title: "Liệu trình 3 buổi laser",
        description: "Tiết kiệm 20% khi đăng ký trọn gói.",
        discount: "-20%",
        validUntil: "15/12/2026",
        code: "AURORA20",
      },
    ],
    team: [
      { name: "BS. Lê Quỳnh", role: "Giám đốc chuyên môn" },
      { name: "BS. Trần Nam", role: "Bác sĩ da liễu" },
    ],
    testimonials: [
      { name: "Phương Uyên", text: "Da sáng rõ rệt sau 3 buổi điều trị.", rating: 5 },
      { name: "Kim Ngân", text: "Bác sĩ tư vấn kỹ, không bán chèo kéo.", rating: 5 },
    ],
    faqs: [
      { q: "Có cần nghỉ dưỡng sau laser?", a: "Hầu hết khách sinh hoạt bình thường sau 24 giờ." },
      { q: "Có trả góp không?", a: "Có hỗ trợ trả góp 0% qua thẻ tín dụng." },
    ],
    tags: ["laser", "trị nám", "hifu", "da liễu", "phú nhuận"],
  },
  {
    slug: "atelier-bridal-studio",
    name: "Atelier Bridal Studio",
    tagline: "Vẻ đẹp cô dâu trong từng khoảnh khắc",
    category: "makeup-bridal",
    location: "da-nang",
    address: "56 Bạch Đằng, Hải Châu, Đà Nẵng",
    phone: "+84 236 3888 246",
    email: "booking@atelierbridal.vn",
    website: "atelierbridal.vn",
    hours: "08:00 – 19:00 (T2 – CN)",
    rating: 4.7,
    reviews: 208,
    featured: true,
    verified: true,
    since: "2019",
    cover: biz4,
    gallery: [biz4, biz1, biz6],
    logoText: "AB",
    about:
      "Atelier Bridal Studio chuyên trang điểm cô dâu, sự kiện và đào tạo makeup chuyên nghiệp. Phong cách trong trẻo, tôn đường nét tự nhiên và bền màu suốt ngày dài.",
    highlights: [
      "Makeup artist đồng hành trọn ngày cưới",
      "Mỹ phẩm cao cấp nhập khẩu",
      "Khoá đào tạo makeup cá nhân",
    ],
    services: [
      {
        name: "Trang điểm cô dâu trọn gói",
        description: "Makeup, làm tóc và theo dõi chỉnh trang cả ngày.",
        price: "6.500.000₫",
        duration: "Trọn ngày",
      },
      {
        name: "Makeup dự tiệc",
        description: "Trang điểm dự tiệc, chụp ảnh, sự kiện.",
        price: "1.200.000₫",
        duration: "60 phút",
      },
      {
        name: "Khoá học makeup cá nhân",
        description: "6 buổi học 1 kèm 1 với chuyên gia.",
        price: "9.800.000₫",
        duration: "6 buổi",
      },
    ],
    offers: [
      {
        title: "Ưu đãi mùa cưới",
        description: "Tặng buổi makeup thử trị giá 1.200.000₫ khi đặt gói trọn ngày.",
        discount: "Tặng quà",
        validUntil: "31/01/2027",
        code: "BRIDAL26",
      },
    ],
    team: [
      { name: "Mai Chi", role: "Lead Makeup Artist" },
      { name: "Hồng Nhung", role: "Hair Stylist" },
    ],
    testimonials: [
      { name: "Thanh Thảo", text: "Lớp nền bền màu suốt 12 tiếng, rất ưng.", rating: 5 },
      { name: "Bảo Ngọc", text: "Team hỗ trợ nhiệt tình từ sáng tới tối.", rating: 4 },
    ],
    faqs: [
      { q: "Có phục vụ ngoại tỉnh?", a: "Có, phụ phí di chuyển tính theo khoảng cách." },
      { q: "Đặt cọc bao nhiêu?", a: "Cọc 30% để giữ lịch ngày cưới." },
    ],
    tags: ["makeup", "cô dâu", "wedding", "đà nẵng", "dạy nghề"],
  },
  {
    slug: "the-gentleman-barber",
    name: "The Gentleman Barber",
    tagline: "Không gian grooming dành riêng cho phái mạnh",
    category: "barber-mens",
    location: "singapore",
    address: "12 Ann Siang Road, Singapore",
    phone: "+65 6221 4488",
    email: "hi@gentlemanbarber.sg",
    website: "gentlemanbarber.sg",
    hours: "10:00 – 21:00 (T3 – CN)",
    rating: 4.8,
    reviews: 176,
    featured: false,
    verified: true,
    since: "2015",
    cover: biz5,
    gallery: [biz5, biz1, biz3],
    logoText: "GB",
    about:
      "The Gentleman Barber kết hợp kỹ thuật barber cổ điển với dịch vụ chăm sóc da và râu hiện đại, trong không gian gỗ tối và đồng thau ấm cúng.",
    highlights: ["Cạo râu dao cạo thẳng", "Whisky bar phục vụ khách", "Barber quốc tế"],
    services: [
      {
        name: "Signature Haircut",
        description: "Tư vấn kiểu tóc, cắt và tạo kiểu hoàn chỉnh.",
        price: "SGD 58",
        duration: "45 phút",
      },
      {
        name: "Hot Towel Shave",
        description: "Cạo râu truyền thống với khăn nóng và tinh dầu.",
        price: "SGD 45",
        duration: "40 phút",
      },
      {
        name: "Beard Sculpting",
        description: "Tạo dáng râu và chăm sóc da vùng cằm.",
        price: "SGD 38",
        duration: "30 phút",
      },
    ],
    offers: [
      {
        title: "Gói hội viên năm",
        description: "12 lần cắt tóc chỉ với giá của 9 lần.",
        discount: "-25%",
        validUntil: "31/12/2026",
      },
    ],
    team: [
      { name: "Daniel Koh", role: "Master Barber" },
      { name: "Ravi S.", role: "Senior Barber" },
    ],
    testimonials: [
      { name: "James L.", text: "Best fade in town, đội ngũ rất chuyên nghiệp.", rating: 5 },
      { name: "Hoàng Long", text: "Không gian chill, dịch vụ cạo râu tuyệt vời.", rating: 5 },
    ],
    faqs: [
      { q: "Walk-in được không?", a: "Được, nhưng cuối tuần nên đặt lịch trước." },
      { q: "Có dịch vụ nhuộm tóc nam?", a: "Có, bao gồm cả nhuộm phủ bạc." },
    ],
    tags: ["barber", "cắt tóc nam", "cạo râu", "singapore"],
  },
  {
    slug: "seoul-hair-academy",
    name: "Seoul Hair Academy",
    tagline: "Salon & học viện tóc chuẩn Hàn Quốc",
    category: "hair-salon",
    location: "bangkok",
    address: "88 Sukhumvit Soi 24, Bangkok",
    phone: "+66 2 259 7788",
    email: "contact@seoulhair.co.th",
    website: "seoulhair.co.th",
    hours: "09:30 – 20:30 (T2 – CN)",
    rating: 4.6,
    reviews: 294,
    featured: true,
    verified: false,
    since: "2014",
    cover: biz6,
    gallery: [biz6, biz2, biz4],
    logoText: "SH",
    about:
      "Seoul Hair Academy vừa là salon cao cấp vừa là học viện đào tạo stylist, ứng dụng kỹ thuật uốn – nhuộm Hàn Quốc và sản phẩm chăm sóc tóc nhập khẩu.",
    highlights: ["Stylist tu nghiệp tại Seoul", "Thuốc nhuộm ít amoniac", "Khoá đào tạo stylist"],
    services: [
      {
        name: "Cắt & tạo kiểu Hàn Quốc",
        description: "Tư vấn khuôn mặt và tạo kiểu theo xu hướng.",
        price: "THB 890",
        duration: "60 phút",
      },
      {
        name: "Uốn Setting Digital",
        description: "Uốn phồng, giữ nếp tự nhiên 4 – 6 tháng.",
        price: "THB 3.500",
        duration: "180 phút",
      },
      {
        name: "Phục hồi tóc Keratin",
        description: "Tái tạo cấu trúc tóc hư tổn sau tẩy nhuộm.",
        price: "THB 2.400",
        duration: "120 phút",
      },
    ],
    offers: [
      {
        title: "Combo cắt + gội dưỡng",
        description: "Chỉ THB 990 cho khách đặt lịch qua 1Beauty.Asia.",
        discount: "Combo",
        validUntil: "31/12/2026",
        code: "SEOUL1B",
      },
    ],
    team: [
      { name: "Ji-hoon Park", role: "Creative Director" },
      { name: "Nara T.", role: "Color Specialist" },
    ],
    testimonials: [
      { name: "Lisa P.", text: "Uốn xong tóc bồng bềnh đúng ý.", rating: 5 },
      { name: "Quang Vinh", text: "Giá hợp lý, tay nghề tốt.", rating: 4 },
    ],
    faqs: [
      { q: "Có nhân viên nói tiếng Việt?", a: "Có, vui lòng báo trước khi đặt lịch." },
      { q: "Khoá học kéo dài bao lâu?", a: "Khoá cơ bản 3 tháng, nâng cao 6 tháng." },
    ],
    tags: ["tóc", "uốn", "nhuộm", "keratin", "bangkok", "học viện"],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);
export const getBusiness = (slug: string) => businesses.find((b) => b.slug === slug);
