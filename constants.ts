import { HistoryDataPoint, ScheduleItem } from './types';

export const MOCK_HISTORY_DATA: HistoryDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  temp: 18 + Math.random() * 4 - 2 + (i > 8 && i < 22 ? 2 : 0), // Warmer during day
  humidity: 45 + Math.random() * 10,
}));

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  // Workdays
  { id: '1', type: 'workday', label: 'Opstaan', time: '07:00', temp: 20.5, active: true },
  { id: '2', type: 'workday', label: 'Vertrek', time: '08:30', temp: 15.0, active: true },
  { id: '3', type: 'workday', label: 'Thuis', time: '17:00', temp: 21.0, active: true },
  { id: '4', type: 'workday', label: 'Slapen', time: '22:30', temp: 15.0, active: true },
  // Weekend - Now 4 slots
  { id: '5', type: 'weekend', label: 'Opstaan', time: '08:30', temp: 21.0, active: true },
  { id: '6', type: 'weekend', label: 'Thuis', time: '12:00', temp: 21.0, active: true },
  { id: '7', type: 'weekend', label: 'Thuis', time: '17:00', temp: 21.0, active: true },
  { id: '8', type: 'weekend', label: 'Slapen', time: '23:30', temp: 15.0, active: true },
];

export const BACKGROUND_IMAGES = {
  sunny: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?q=80&w=1974&auto=format&fit=crop",
  cloudy: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1951&auto=format&fit=crop",
  rain: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1974&auto=format&fit=crop",
  night: "https://images.unsplash.com/photo-1472552944129-b035e9ea536e?q=80&w=1974&auto=format&fit=crop",
};