import { Request, Response } from 'express';
import { fareService } from '../services/fare.service';

/**
 * Controller xử lý tính toán cước phí và thời gian dự kiến (ETA)
 */
export const estimateFare = async (req: Request, res: Response) => {
  try {
    const { startLng, startLat, endLng, endLat, waitingHours, vehicleType } = req.body;

    // 1. Kiểm tra validation tham số đầu vào
    if (
      startLng === undefined ||
      startLat === undefined ||
      endLng === undefined ||
      endLat === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tọa độ điểm đi (startLng, startLat) và điểm đến (endLng, endLat) là bắt buộc.',
      });
    }

    const startLngNum = parseFloat(startLng);
    const startLatNum = parseFloat(startLat);
    const endLngNum = parseFloat(endLng);
    const endLatNum = parseFloat(endLat);

    if (
      isNaN(startLngNum) ||
      isNaN(startLatNum) ||
      isNaN(endLngNum) ||
      isNaN(endLatNum)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tọa độ truyền vào phải là số hợp lệ.',
      });
    }

    const waitHoursNum = waitingHours ? parseFloat(waitingHours) : 0;
    const typeVehicle = vehicleType || '...';

    console.log(`[FareController] Estimating fare: from (${startLngNum}, ${startLatNum}) to (${endLngNum}, ${endLatNum}), vehicleType=${typeVehicle}, waitingHours=${waitHoursNum}`);

    // 2. Gọi service ước tính giá cước và ETA
    const estimation = await fareService.estimateFare(
      startLngNum,
      startLatNum,
      endLngNum,
      endLatNum,
      waitHoursNum,
      typeVehicle
    );

    // 3. Trả về kết quả cho client
    return res.status(200).json({
      success: true,
      message: 'Tính toán cước phí và ETA thành công.',
      data: estimation,
    });
  } catch (error: any) {
    console.error('[FareController] Error estimating fare:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi ước tính cước phí và ETA.',
    });
  }
};
