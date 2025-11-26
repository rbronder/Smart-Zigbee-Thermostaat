export enum ThermostatMode {
  HOME = 'HOME',
  SLEEP = 'SLEEP',
  AWAY = 'AWAY',
}

export interface HistoryDataPoint {
  time: string;
  temp: number;
  humidity: number;
  outdoorTemp?: number;
  outdoorHumidity?: number;
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
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'thunder' | 'night';
  temp: number;
}

export interface HaSettings {
  url: string;
  token: string;
  sensorEntityId: string;
  humidityEntityId: string;
  switchEntityId: string;
  batteryEntityId: string;
  outdoorTempEntityId: string;
  outdoorHumidityEntityId: string; // New field
}

export interface HaEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}