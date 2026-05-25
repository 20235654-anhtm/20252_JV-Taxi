import Decimal from 'decimal.js';
import prisma from '../config/db';

/**
 * Định nghĩa cấu hình giá cước (PriceRuleConfig)
 */
export interface PriceRuleConfig {
  basePrice: number | string | Decimal;
  pricePerKmStandard: number | string | Decimal;
  pricePerKmLongDistance: number | string | Decimal;
  waitingPricePerHour: number | string | Decimal;
  surgeMultiplier: number | string | Decimal;
}

/**
 * Kết quả chi tiết sau khi tính toán cước phí
 */
export interface FareCalculationResult {
  basePrice: Decimal;
  standardDistanceFare: Decimal;
  longDistanceFare: Decimal;
  waitingFare: Decimal;
  subTotal: Decimal;
  surgeMultiplier: Decimal;
  totalFare: Decimal;
}

/**
 * Cấu hình khung giờ cao điểm
 */
export interface PeakHourConfig {
  start: string;       // Định dạng "HH:MM", ví dụ: "07:30"
  end: string;         // Định dạng "HH:MM", ví dụ: "09:00"
  days?: number[];     // Mảng các ngày trong tuần (0: Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7). Nếu không truyền sẽ áp dụng cho mọi ngày.
  multiplier?: number; // Hệ số nhân riêng cho khung giờ này (ví dụ 1.3). Nếu không có, sẽ fallback về surgeMultiplier chung.
}

/**
 * Kết quả trả về từ API OSRM
 */
export interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    distance: number; // đơn vị: mét
    duration: number; // đơn vị: giây
    geometry?: string;
    legs?: Array<{
      distance: number;
      duration: number;
      summary: string;
    }>;
  }>;
  waypoints?: any[];
}

export class FareService {
  private osrmBaseUrl: string;

  constructor() {
    this.osrmBaseUrl = process.env.OSRM_API_URL || 'https://router.project-osrm.org';
  }

  /**
   * NHIỆM VỤ 2: Logic tính toán cước phí sử dụng decimal.js
   * total = basePrice + (distance * standardPrice) + (waitingHours * waitingPrice) + (longDistanceDistance * longDistancePrice)
   * Sau đó nhân với hệ số surgeMultiplier nếu là giờ cao điểm.
   */
  calculateFare(
    distanceInKm: number,
    durationInHours: number, // Dùng để mô tả thời gian di chuyển, có thể sử dụng thêm trong các công thức nâng cao
    waitingHours: number,
    isPeakHour: boolean,
    config?: PriceRuleConfig
  ): FareCalculationResult {
    // Cấu hình mặc định (Fallback) nếu không có config truyền vào
    const activeConfig: PriceRuleConfig = config || {
      basePrice: new Decimal(9000),             // 9.000 VND
      pricePerKmStandard: new Decimal(11000),   // 11.000 VND từ km 1 đến 30
      pricePerKmLongDistance: new Decimal(9500),// 9.500 VND từ km 31 trở đi
      waitingPricePerHour: new Decimal(20000),  // 20.000 VND mỗi giờ chờ
      surgeMultiplier: new Decimal(1.0),        // Mặc định hệ số nhân 1.0
    };

    const basePrice = new Decimal(activeConfig.basePrice);
    const pricePerKmStandard = new Decimal(activeConfig.pricePerKmStandard);
    const pricePerKmLongDistance = new Decimal(activeConfig.pricePerKmLongDistance);
    const waitingPricePerHour = new Decimal(activeConfig.waitingPricePerHour);
    const surgeMultiplier = new Decimal(activeConfig.surgeMultiplier);

    const dist = new Decimal(distanceInKm);
    const wait = new Decimal(waitingHours);

    let standardDistanceFare = new Decimal(0);
    let longDistanceFare = new Decimal(0);

    // Logic tính toán lũy tiến theo phân khúc km
    if (dist.lte(30)) {
      // Dưới hoặc bằng 30km: Áp dụng toàn bộ giá tiêu chuẩn
      standardDistanceFare = dist.mul(pricePerKmStandard);
    } else {
      // Trên 30km: 30km đầu tính giá tiêu chuẩn, phần vượt quá tính giá đường dài
      standardDistanceFare = new Decimal(30).mul(pricePerKmStandard);
      longDistanceFare = dist.sub(30).mul(pricePerKmLongDistance);
    }

    // Tính cước phí thời gian chờ đợi
    const waitingFare = wait.mul(waitingPricePerHour);

    // Tổng phụ chưa áp dụng hệ số nhân
    const subTotal = basePrice.add(standardDistanceFare).add(longDistanceFare).add(waitingFare);

    // Hệ số nhân áp dụng
    const appliedSurge = isPeakHour ? surgeMultiplier : new Decimal(1.0);

    // Tổng cước sau khi nhân hệ số surge và làm tròn (tiền tệ VND làm tròn về số nguyên gần nhất)
    const totalFare = subTotal.mul(appliedSurge).round();

    return {
      basePrice,
      standardDistanceFare,
      longDistanceFare,
      waitingFare,
      subTotal,
      surgeMultiplier: appliedSurge,
      totalFare,
    };
  }

  /**
   * NHIỆM VỤ 3: Gọi API OSRM để lấy thông tin quãng đường và thời gian dự kiến (ETA)
   * URL: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}
   */
  async getRouteFromOSRM(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number
  ): Promise<{ distanceInMeters: number; durationInSeconds: number }> {
    try {
      const url = `${this.osrmBaseUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
      
      console.log(`[OSRM Service] Fetching route from URL: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OSRMRouteResponse;

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM failed to find route: ${data.code}`);
      }

      // Trích xuất distance (mét) và duration (giây) của tuyến đường tối ưu nhất (index 0)
      const bestRoute = data.routes[0];
      if (!bestRoute) {
        throw new Error('OSRM returned empty routes array.');
      }
      return {
        distanceInMeters: bestRoute.distance,
        durationInSeconds: bestRoute.duration,
      };
    } catch (error) {
      console.error('[OSRM Service] Error fetching route:', error);
      throw error;
    }
  }

  /**
   * Hàm chuyển đổi đơn vị và tích hợp: Gọi OSRM và tính cước phí dự kiến
   */
  async estimateFare(
    startLng: number,
    startLat: number,
    endLng: number,
    endLat: number,
    waitingHours: number = 0,
    vehicleType: string = 'CAR_4_SEATER'
  ) {
    // 1. Gọi OSRM lấy thông tin định tuyến
    const route = await this.getRouteFromOSRM(startLng, startLat, endLng, endLat);

    // 2. XỬ LÝ ĐƠN VỊ:
    // OSRM trả về distance dưới dạng METERS (mét). Hàm tính giá yêu cầu KILOMETERS (km).
    // => distanceInKm = distanceInMeters / 1000
    const distanceInKm = route.distanceInMeters / 1000;

    // OSRM trả về duration dưới dạng SECONDS (giây). Hàm tính giá/ETA yêu cầu HOURS (giờ).
    // => durationInHours = durationInSeconds / 3600
    const durationInHours = route.durationInSeconds / 3600;

    // 3. Lấy cấu hình giá cước động từ Database (Prisma)
    // Tìm cấu hình đang hoạt động cho loại xe tương ứng
    let activePriceRule = null;
    try {
      activePriceRule = await prisma.priceRule.findFirst({
        where: {
          vehicleType,
          isActive: true,
        },
      });
    } catch (dbError) {
      console.warn('[FareService] Database query failed (likely table price_rules does not exist yet). Falling back to default price rules.', dbError);
    }

    // Nếu không cấu hình trong database, sử dụng cấu hình mặc định (fallback)
    let config: PriceRuleConfig | undefined = undefined;
    let peakHoursConfig: PeakHourConfig[] = [];

    if (activePriceRule) {
      config = {
        basePrice: activePriceRule.basePrice,
        pricePerKmStandard: activePriceRule.pricePerKmStandard,
        pricePerKmLongDistance: activePriceRule.pricePerKmLongDistance,
        waitingPricePerHour: activePriceRule.waitingPricePerHour,
        surgeMultiplier: activePriceRule.surgeMultiplier,
      };

      // Ép kiểu Json của Prisma sang PeakHourConfig[]
      if (activePriceRule.peakHours) {
        peakHoursConfig = activePriceRule.peakHours as unknown as PeakHourConfig[];
      }
    }

    // 4. Kiểm tra giờ cao điểm tại thời điểm hiện tại
    const now = new Date();
    const { isPeak, matchedSurgeMultiplier } = this.checkPeakHour(now, peakHoursConfig);

    // Nếu khung giờ hiện tại khớp với cấu hình cao điểm cụ thể và có multiplier riêng, ta sử dụng multiplier đó
    if (isPeak && matchedSurgeMultiplier && config) {
      config.surgeMultiplier = matchedSurgeMultiplier;
    }

    // 5. Tính toán cước phí chi tiết
    const fareDetails = this.calculateFare(
      distanceInKm,
      durationInHours,
      waitingHours,
      isPeak,
      config
    );

    return {
      route: {
        distanceInMeters: route.distanceInMeters,
        distanceInKm: parseFloat(distanceInKm.toFixed(3)),
        durationInSeconds: route.durationInSeconds,
        durationInHours: parseFloat(durationInHours.toFixed(4)),
        durationFriendly: this.formatDuration(route.durationInSeconds),
      },
      fare: {
        basePrice: fareDetails.basePrice.toNumber(),
        standardDistanceFare: fareDetails.standardDistanceFare.toNumber(),
        longDistanceFare: fareDetails.longDistanceFare.toNumber(),
        waitingFare: fareDetails.waitingFare.toNumber(),
        subTotal: fareDetails.subTotal.toNumber(),
        surgeMultiplier: fareDetails.surgeMultiplier.toNumber(),
        totalFare: fareDetails.totalFare.toNumber(),
      },
      isPeakHour: isPeak,
      timestamp: now,
    };
  }

  /**
   * Kiểm tra xem thời điểm hiện tại có thuộc khung giờ cao điểm hay không
   */
  checkPeakHour(
    dateTime: Date,
    peakHoursConfig: PeakHourConfig[]
  ): { isPeak: boolean; matchedSurgeMultiplier?: number } {
    if (!peakHoursConfig || peakHoursConfig.length === 0) {
      return { isPeak: false };
    }

    const currentDay = dateTime.getDay(); // 0: Chủ Nhật, 1: Thứ 2, ...
    const currentHours = dateTime.getHours();
    const currentMinutes = dateTime.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes; // Quy đổi ra số phút từ đầu ngày để so sánh dễ dàng

    for (const rule of peakHoursConfig) {
      // 1. Kiểm tra ngày trong tuần nếu có định nghĩa
      if (rule.days && !rule.days.includes(currentDay)) {
        continue;
      }

      // 2. Parse thời gian bắt đầu và kết thúc
      const startParts = rule.start.split(':').map(Number);
      const endParts = rule.end.split(':').map(Number);

      const startH = startParts[0] ?? 0;
      const startM = startParts[1] ?? 0;
      const endH = endParts[0] ?? 0;
      const endM = endParts[1] ?? 0;

      const startTimeVal = startH * 60 + startM;
      const endTimeVal = endH * 60 + endM;

      // 3. So sánh khoảng thời gian
      if (currentTimeVal >= startTimeVal && currentTimeVal <= endTimeVal) {
        const result: { isPeak: boolean; matchedSurgeMultiplier?: number } = { isPeak: true };
        if (rule.multiplier !== undefined) {
          result.matchedSurgeMultiplier = rule.multiplier;
        }
        return result;
      }
    }

    return { isPeak: false };
  }

  /**
   * Helper chuyển đổi giây sang định dạng thân thiện hơn (ví dụ: "15 phút", "1 giờ 20 phút")
   */
  private formatDuration(seconds: number): string {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} phút`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }
}

export const fareService = new FareService();
