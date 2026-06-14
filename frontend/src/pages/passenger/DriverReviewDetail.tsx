import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { API_BASE_URL } from '../../config/api';
import { Avatar } from '../../components/ui/Avatar';
import './DriverReviewDetail.css';

interface DriverSummary {
  id: string;
  name: string;
  car: string;
  vehicleType: string;
  distance: string;
  distanceMeters: number;
  time: string;
  price: string;
  rating: number;
  avatar: string;
  jlpt?: string | null;
}

interface DriverReviewDetailData extends DriverSummary {
  email?: string;
  phone?: string;
  vehicleInfor?: string;
  parsedVehicleInfor?: Record<string, any>;
  jlpt?: string | null;
}

interface ReviewItem {
  id: string;
  starReview: number;
  commentReview: string;
  createdAt: string;
  reviewer?: {
    fullName?: string;
    avatar?: string;
  };
}

const formatVehicleText = (infoStr: string) => {
  try {
    const parsed = JSON.parse(infoStr);
    const model = parsed.model || '';
    const secondary = parsed.color || parsed.plate || '';
    if (model && secondary) return `${model} • ${secondary}`;
    return model || infoStr;
  } catch (e) {
    return infoStr;
  }
};

const LIMIT = 5;

const DriverReviewDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDriver = location.state?.driver as DriverSummary | undefined;
  const passedFare = location.state?.fare;
  const [driver, setDriver] = useState<DriverReviewDetailData | undefined>(initialDriver);
  const [loading, setLoading] = useState<boolean>(!!initialDriver);
  const [error, setError] = useState<string | undefined>();

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [starCounts, setStarCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch driver detail + star counts on mount
  useEffect(() => {
    if (!initialDriver?.id) {
      setLoading(false);
      return;
    }

    const fetchDriverDetail = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/${initialDriver.id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || 'ドライバー情報を取得できませんでした');
          setLoading(false);
          return;
        }

        setDriver(prev => ({
          ...(prev ?? initialDriver),
          email: data.data.email,
          phone: data.data.phone,
          vehicleInfor: data.data.driverProfile?.vehicleInfor || (prev ?? initialDriver).car,
          parsedVehicleInfor: data.data.driverProfile?.parsedVehicleInfor || {},
          jlpt: (prev ?? initialDriver).jlpt ?? null,
        }));

        // Fetch star counts
        const starRes = await fetch(`${API_BASE_URL}/api/reviews/driver/${initialDriver.id}/star-counts`);
        const starData = await starRes.json();
        if (starData.success) {
          setStarCounts(starData.data.counts);
          setTotalReviews(starData.data.total);
        }
      } catch (err) {
        console.error('[DriverReviewDetail] fetch error:', err);
        setError('サーバーと通信できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetail();
  }, [initialDriver?.id]);

  // Fetch reviews whenever selectedStar or page changes
  const fetchReviews = useCallback(async (pageNum: number, star: number | null, replace: boolean) => {
    if (!initialDriver?.id) return;
    replace ? setReviewsLoading(true) : setReviewsLoadingMore(true);

    try {
      const starParam = star !== null ? `&star=${star}` : '';
      const res = await fetch(
        `${API_BASE_URL}/api/reviews/driver/${initialDriver.id}/paginated?page=${pageNum}&limit=${LIMIT}${starParam}`
      );
      const data = await res.json();
      if (data.success) {
        setReviews(prev => replace ? data.data : [...prev, ...data.data]);
        setHasMore(data.meta.hasMore);
      }
    } catch (err) {
      console.error('[DriverReviewDetail] review fetch error:', err);
    } finally {
      setReviewsLoading(false);
      setReviewsLoadingMore(false);
    }
  }, [initialDriver?.id]);

  // Reset and fetch page 1 when filter changes
  useEffect(() => {
    setReviews([]);
    setPage(1);
    setHasMore(false);
    fetchReviews(1, selectedStar, true);
  }, [selectedStar, fetchReviews]);

  // Fetch next page when page increments
  useEffect(() => {
    if (page > 1) {
      fetchReviews(page, selectedStar, false);
    }
  }, [page]);

  // Infinite scroll observer using callback ref
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (reviewsLoading || reviewsLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { 
        root: null, // Default is viewport
        rootMargin: '100px', // Load before it fully enters
        threshold: 0
      }
    );

    if (node) observerRef.current.observe(node);
  }, [reviewsLoading, reviewsLoadingMore, hasMore]);

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center' }}>ドライバー情報を読み込み中...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center' }}>ドライバー情報が見つかりません</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>
      </div>
    );
  }

  const handleSelectDriver = () => {
    navigate('/passenger/booking-confirmation', { state: { driver, mode: 'designated', fare: passedFare } });
  };

  const handleStarFilter = (star: number) => {
    setSelectedStar(prev => (prev === star ? null : star));
  };

  return (
    <div className="driver-detail-page">
      <Header
        variant="passenger"
        showBackButton={true}
        title="ドライバー詳細"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      <div className="dd-content">
        {/* MAIN DRIVER CARD */}
        <div className="dd-main-card">
          <div className="dd-avatar-wrapper">
            <Avatar 
              src={driver.avatar} 
              name={driver.name} 
              className="dd-avatar text-4xl" 
              borderColor="none" 
            />
            <div className="dd-verified-badge">
              <div className="dd-verified-icon">✓</div>
            </div>
          </div>

          <h2 className="dd-name">{driver.name}</h2>

          <div className="dd-badges-row">
            <div className="dd-badge dd-badge-rating">
              <span style={{ color: '#006D37' }}>★</span> {driver.rating && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating}
            </div>
            {driver.jlpt && driver.jlpt !== 'N/A' && driver.jlpt.trim() !== '' && (
              <div className="dd-badge dd-badge-lang">
                <span>文<sub>A</sub></span> {driver.jlpt}
              </div>
            )}
          </div>

          <div className="dd-vehicle-box">
            <div className="dd-car-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#006D37" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.15L18.22 10.12H5.78L6.85 7ZM19 17H5V12H19V17Z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div className="dd-vehicle-info">
              <div className="dd-vehicle-label">車両情報</div>
              <div className="dd-vehicle-text">{formatVehicleText(driver.vehicleInfor || driver.car)}</div>
            </div>
          </div>
        </div>

        {/* RECENT REVIEWS SECTION */}
        <div className="dd-reviews-section">
          <div className="dd-reviews-header">
            <h3 className="dd-reviews-title">最近のレビュー</h3>
            {totalReviews > 0 && (
              <span className="dd-reviews-total">{totalReviews}件</span>
            )}
          </div>

          {/* STAR FILTER PILLS */}
          <div className="dd-star-filter">
            {[5, 4, 3, 2, 1].map(star => {
              const count = starCounts[star] ?? 0;
              const isActive = selectedStar === star;
              return (
                <button
                  key={star}
                  className={`dd-star-pill${isActive ? ' dd-star-pill--active' : ''}${count === 0 ? ' dd-star-pill--empty' : ''}`}
                  onClick={() => handleStarFilter(star)}
                  aria-pressed={isActive}
                >
                  <span className="dd-star-pill-star">★</span>
                  <span className="dd-star-pill-num">{star}</span>
                  <span className="dd-star-pill-count">({count})</span>
                </button>
              );
            })}
          </div>

          {/* REVIEW LIST */}
          {reviewsLoading ? (
            <div className="dd-reviews-skeleton">
              {[1, 2, 3].map(i => (
                <div key={i} className="dd-review-skeleton-card">
                  <div className="dd-skeleton-line dd-skeleton-avatar" />
                  <div style={{ flex: 1 }}>
                    <div className="dd-skeleton-line" style={{ width: '55%', height: 14, marginBottom: 8 }} />
                    <div className="dd-skeleton-line" style={{ width: '35%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="dd-reviews-empty">
              <span className="dd-reviews-empty-icon">📭</span>
              <p>{selectedStar !== null ? `${selectedStar}星のレビューはありません。` : 'レビューはまだありません。'}</p>
            </div>
          ) : (
            <>
              {reviews.map(review => (
                <div key={review.id} className="dd-review-card">
                  <div className="dd-review-header">
                    <div className="dd-reviewer-info">
                      <Avatar 
                        src={review.reviewer?.avatar} 
                        name={review.reviewer?.fullName} 
                        className="dd-reviewer-avatar text-[11px]" 
                        borderColor="none" 
                      />
                      <div>
                        <h4 className="dd-reviewer-name">{review.reviewer?.fullName || 'ユーザー'}</h4>
                        <div className="dd-review-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < (review.starReview || 0) ? '#006D37' : '#DDE5DB' }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="dd-review-date">{new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="dd-review-text">{review.commentReview}</p>
                </div>
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={lastElementRef} className="dd-scroll-sentinel" />

              {reviewsLoadingMore && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                  <div style={{ width: '40px', height: '40px', border: '4px solid #EFF6EC', borderTopColor: '#006D37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {!hasMore && reviews.length > 0 && (
                <p className="dd-reviews-end">これ以上レビューはありません</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* FIXED FOOTER WITH BUTTON */}
      <div className="dd-footer">
        <button className="dd-confirm-btn" onClick={handleSelectDriver}>
          <div className="dd-btn-icon">✓</div>
          このドライバーを選択する
        </button>
      </div>
    </div>
  );
};

export default DriverReviewDetail;
