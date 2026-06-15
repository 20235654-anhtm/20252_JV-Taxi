import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';

export const createReview = async (req: Request, res: Response) => {
  try {
    console.log('Received review request:', req.body); // In ra để xem dữ liệu nhận được
    console.log('Backend restarted with new Prisma Client');
    const { rating, comment, driverId, rideId, reviewerId, communicationStar, attitudeStar, safetyStar } = req.body;

    let computedStar = Number(rating);
    if (!computedStar && communicationStar && attitudeStar && safetyStar) {
      computedStar = Math.round((Number(communicationStar) + Number(attitudeStar) + Number(safetyStar)) / 3);
    }

    // Build the data object for Prisma with type safety
    const data: any = {
      starReview: computedStar || 0,
      communicationStar: Number(communicationStar) || 0,
      attitudeStar: Number(attitudeStar) || 0,
      safetyStar: Number(safetyStar) || 0,
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

/**
 * GET /api/reviews/driver/:driverId/paginated?page=1&limit=5&star=5
 * Returns paginated reviews with optional star filter
 */
export const getReviewsByDriverPaginated = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    if (!driverId || typeof driverId !== 'string') {
      return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 5));
    const starParam = req.query.star as string | undefined;
    const starFilter = starParam ? parseInt(starParam) : undefined;

    if (starFilter !== undefined && (isNaN(starFilter) || starFilter < 1 || starFilter > 5)) {
      return res.status(400).json({ success: false, message: 'star must be between 1 and 5' });
    }

    const result = await reviewService.getReviewsByDriverIdPaginated(driverId, page, limit, starFilter);

    res.status(200).json({
      success: true,
      data: result.reviews,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
};

/**
 * GET /api/reviews/driver/:driverId/star-counts
 * Returns count of reviews grouped by star rating (1-5)
 */
export const getStarCountsByDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;

    if (!driverId || typeof driverId !== 'string') {
      return res.status(400).json({ success: false, message: 'Driver ID is required' });
    }

    const result = await reviewService.getStarCountsByDriverId(driverId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch star counts' });
  }
};
