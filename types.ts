export enum ThermostatMode {
  HOME = 'HOME',
  SLEEP = 'SLEEP',
  AWAY = 'AWAY',
}

export interface HistoryDataPoint {
  time: string;
  temp: number;
  humidity: number;
}

export interface ScheduleItem {
  id: string;
  type: 'workday' | 'weekend';
  label: string; // e.g., 'Opstaan', 'Vertrek'
  time: string;
  temp: number;
  active: boolean;
}

export interface VacationSettings {
  enabled: boolean;
  startDate: string;
  endDate: string;
  temp: number;
}

export interface WeatherState {
  condition: 'sunny' | 'cloudy' | 'rain' | 'night';
  temp: number;
}
