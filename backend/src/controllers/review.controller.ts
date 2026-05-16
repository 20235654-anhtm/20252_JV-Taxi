import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';

export const createReview = async (req: Request, res: Response) => {
  try {
    console.log('Received review request:', req.body); // In ra để xem dữ liệu nhận được
    const { rating, comment, driverId, rideId, reviewerId } = req.body;

    // Build the data object for Prisma with type safety
    const data: any = {
      starReview: Number(rating) || 0,
      commentReview: comment || '',
    };

    // Only connect if IDs are provided and are valid strings
    if (driverId && typeof driverId === 'string') data.driver = { connect: { id: driverId } };
    if (rideId && typeof rideId === 'string') data.ride = { connect: { id: rideId } };
    if (reviewerId && typeof reviewerId === 'string') data.reviewer = { connect: { id: reviewerId } };

    const review = await reviewService.createReview(data);
    console.log('Review saved successfully:', review.id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error: any) {
    console.error('CRITICAL ERROR in Review Controller:', error); // In lỗi chi tiết ra terminal
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create review',
    });
  }
};

export const getReviewsByDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    
    if (!driverId || typeof driverId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required',
      });
    }

    const reviews = await reviewService.getReviewsByDriverId(driverId);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch reviews',
    });
  }
};
