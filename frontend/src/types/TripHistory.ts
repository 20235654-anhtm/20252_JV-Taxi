export interface Trip {
  id: string;
  date: string;
  time: string;
  pickupLocation: string;
  destination: string;
  price: number;
  status: string;
}

export interface Summary {
  totalRevenue: number;
  weeklyGrowth: number;
  completedTrips: number;
}

export interface SummaryCardProps {
  summary: Summary;
}

export interface TripCardProps {
  trip: Trip;
}

export type FilterType = 'today' | 'week';

export interface FilterSectionProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}
