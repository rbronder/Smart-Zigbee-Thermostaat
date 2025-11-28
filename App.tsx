import React, { useState, useEffect, useRef } from 'react';
import { ThermostatMode, WeatherState, ScheduleItem, VacationSettings, HaSettings, HistoryDataPoint } from './types';
import { MOCK_HISTORY_DATA, DEFAULT_SCHEDULE } from './constants';
import { DynamicBackground } from './components/DynamicBackground';
import { BrightnessOverlay } from './components/BrightnessOverlay';
import { HistoryCharts } from './components/HistoryCharts';
import { SettingsModal } from './components/SettingsModal';
import { AnimatedNumber } from './components/AnimatedNumber';
import { haService } from './lib/ha';
import { 
  Flame, 
  Home, 
  Moon, 
  Plane, 
  ChevronUp, 
  ChevronDown, 
  Droplets,
  Umbrella,
  WifiOff,
  Target,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [targetTemp, setTargetTemp] = useState<number>(21.0);
  const [currentRawTemp, setCurrentRawTemp] = useState<number>(20.5); // Raw sensor data
  const [humidity, setHumidity] = useState<number>(45); 
  const [mode, setMode] = useState<ThermostatMode>(ThermostatMode.HOME);
  const [weather, setWeather] = useState<WeatherState>({ condition: 'cloudy', temp: 12 });
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [isHumidifierOn, setIsHumidifierOn] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [humidityPopupOpen, setHumidityPopupOpen] = useState(false);
  
  // Logic Debug Info
  const [debugLogic, setDebugLogic] = useState<{lastHeat: string, reason: string, humidifierReason: string}>({ 
    lastHeat: 'Nog niet actief', 
    reason: 'Starten...', 
    humidifierReason: 'Starten...' 
  });

  // Display State (View vs Edit Mode)
  const [isAdjusting, setIsAdjusting] = useState(false);
  const adjustTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // HA Connection State
  const [haConnected, setHaConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>(MOCK_HISTORY_DATA);
  
  // Persistence for timers
  const [lastMaintenanceTime, setLastMaintenanceTime] = useState<number>(() => {
      const saved = localStorage.getItem('lastMaintenanceTime');
      return saved ? parseInt(saved) : Date.now();
  });
  const [lastHeatActiveTime, setLastHeatActiveTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastHeatActiveTime');
    return saved ? parseInt(saved) : Date.now();
  });
  const [lastHumidifierStartTime, setLastHumidifierStartTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastHumidifierStartTime');
    return saved ? parseInt(saved) : 0;
  });
  const [lastHumidifierStopTime, setLastHumidifierStopTime] = useState<number>(() => {
    const saved = localStorage.getItem('lastHumidifierStopTime');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => { localStorage.setItem('lastMaintenanceTime', lastMaintenanceTime.toString()); }, [lastMaintenanceTime]);
  useEffect(() => { localStorage.setItem('lastHeatActiveTime', lastHeatActiveTime.toString()); }, [lastHeatActiveTime]);
  useEffect(() => { localStorage.setItem('lastHumidifierStartTime', lastHumidifierStartTime.toString()); }, [lastHumidifierStartTime]);
  useEffect(() => { localStorage.setItem('lastHumidifierStopTime', lastHumidifierStopTime.toString()); }, [lastHumidifierStopTime]);

  // Schedule & Vacation
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [vacationSettings, setVacationSettings] = useState<VacationSettings>({
      enabled: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      temp: 15.0
  });
  
  // Settings State - General
  const [screenBrightness, setScreenBrightness] = useState(100);
  const [minBrightness, setMinBrightness] = useState(10);
  const [dimTimeout, setDimTimeout] = useState(15);
  const [boxTransparency, setBoxTransparency] = useState(40);
  const [boxBlur, setBoxBlur] = useState(12);

  // Settings State - Layout
  const [uiScale, setUiScale] = useState(1);
  const [verticalSpacing, setVerticalSpacing] = useState(16);
  const [graphHeight, setGraphHeight] = useState(140);

  // Settings State - System (Advanced)
  const [hysteresis, setHysteresis] = useState(0.3); // Threshold
  const [tempCalibration, setTempCalibration] = useState(0.0); // Offset
  const [summerMode, setSummerMode] = useState(false);
  const [summerTemp, setSummerTemp] = useState(15.0);
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState(7);
  const [maintenanceDurationMins, setMaintenanceDurationMins] = useState(5);
  
  // Humidifier Settings
  const [humidifierTarget, setHumidifierTarget] = useState(50);
  const [humidifierHysteresis, setHumidifierHysteresis] = useState(5);
  const [humidifierCalibration, setHumidifierCalibration] = useState(0);

  // HA Settings
  const [haSettings, setHaSettings] = useState<HaSettings>(() => {
    const saved = localStorage.getItem('haSettings');
    return saved ? JSON.parse(saved) : {
      url: '',
      token: '',
      sensorEntityId: '',
      humidityEntityId: '',
      switchEntityId: '',
      batteryEntityId: '',
      outdoorTempEntityId: '',
      outdoorHumidityEntityId: '',
      humidifierEntityId: ''
    };
  });

  // Save HA settings when changed
  useEffect(() => {
    localStorage.setItem('haSettings', JSON.stringify(haSettings));
  }, [haSettings]);

  // Touch & Mouse Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchCurrentTemp = useRef<number>(targetTemp);
  const isDragging = useRef<boolean>(false);

  // Derived State
  const currentCorrectedTemp = currentRawTemp + tempCalibration;
  const currentCorrectedHumidity = humidity + humidifierCalibration;
  
  // Display Logic: 
  // If Adjusting -> Big Number = Target, Small = Current
  // If Normal    -> Big Number = Current, Small = Target
  const bigNumberValue = isAdjusting ? targetTemp : currentCorrectedTemp;
  const smallNumberValue = isAdjusting ? currentCorrectedTemp : targetTemp;
  const smallNumberLabel = isAdjusting ? 'Nu' : 'Doel';

  // Function to process HA history data into Recharts format
  const processHistoryData = (rawData: any[]) => {
      if (!rawData || rawData.length === 0) return;

      const tempData = rawData[0] || [];
      const humData = rawData[1] || [];
      const outTempData = rawData[2] || [];
      const outHumData = rawData[3] || [];

      const processed: HistoryDataPoint[] = [];
      const now = new Date();
      // Start of today 00:00
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      // Create slots for 00:00 to 23:00
      for (let i = 0; i < 24; i++) {
          const slotTime = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
          const timeLabel = slotTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
          const hourEndIso = new Date(slotTime.getTime() + 60*60*1000).toISOString();
          
          // If slot is in the future, push nulls (or handle in component to hide)
          if (slotTime > now) {
             processed.push({
                 time: timeLabel,
                 temp: NaN, 
                 humidity: NaN, 
                 outdoorTemp: NaN, 
                 outdoorHumidity: NaN
             } as any); 
             continue;
          }

          const getLastVal = (arr: any[]) => {
              // Find the latest update strictly before or within this hour slot
              // Note: HA API returns array sorted by last_updated.
              // We find the last entry that is <= hourEndIso
              let lastVal = NaN;
              // Iterate backwards or use findLast if available, else filter/pop
              // Simple approach: Filter entries before hourEnd
              const validEntries = arr.filter((d: any) => d.last_updated <= hourEndIso);
              if (validEntries.length > 0) {
                 const val = parseFloat(validEntries[validEntries.length - 1].state);
                 if (!isNaN(val)) lastVal = val;
              }
              return lastVal;
          }
          
          const tempVal = getLastVal(tempData);
          const humVal = getLastVal(humData);
          const outTempVal = getLastVal(outTempData);
          const outHumVal = getLastVal(outHumData);

          processed.push({
              time: timeLabel,
              temp: isNaN(tempVal) ? (processed.length > 0 ? processed[processed.length - 1].temp : 20) : tempVal, // Simple fallback
              humidity: isNaN(humVal) ? (processed.length > 0 ? processed[processed.length - 1].humidity : 45) : humVal,
              outdoorTemp: outTempVal,
              outdoorHumidity: outHumVal
          });
      }
      setHistoryData(processed);
  };

  // Helper to fetch all history
  const refreshHistory = async () => {
      if (haConnected && haSettings.sensorEntityId) {
          const idsToFetch = [haSettings.sensorEntityId];
          if (haSettings.humidityEntityId) idsToFetch.push(haSettings.humidityEntityId);
          if (haSettings.outdoorTempEntityId) idsToFetch.push(haSettings.outdoorTempEntityId);
          if (haSettings.outdoorHumidityEntityId) idsToFetch.push(haSettings.outdoorHumidityEntityId);
          
          const history = await haService.fetchHistory(haSettings.url, haSettings.token, idsToFetch);
          processHistoryData(history);
      }
  };

  // HA Connection & Entity Subscriptions
  useEffect(() => {
    if (!haSettings.url || !haSettings.token) return;

    const initHa = async () => {
      await haService.connect(haSettings.url, haSettings.token, (entities) => {
        setHaConnected(true);

        // Update Indoor Temp
        if (haSettings.sensorEntityId && entities[haSettings.sensorEntityId]) {
          const val = parseFloat(entities[haSettings.sensorEntityId].state);
          if (!isNaN(val)) setCurrentRawTemp(val);
        }

        // Update Outdoor Temp (if configured)
        if (haSettings.outdoorTempEntityId && entities[haSettings.outdoorTempEntityId]) {
             const val = parseFloat(entities[haSettings.outdoorTempEntityId].state);
             if (!isNaN(val)) {
                 setWeather(prev => ({...prev, temp: val}));
             }
        }

        // Update Indoor Humidity
        if (haSettings.humidityEntityId && entities[haSettings.humidityEntityId]) {
          const val = parseFloat(entities[haSettings.humidityEntityId].state);
          if (!isNaN(val)) setHumidity(val);
        }

        // Update Battery
        if (haSettings.batteryEntityId && entities[haSettings.batteryEntityId]) {
          const val = parseFloat(entities[haSettings.batteryEntityId].state);
          if (!isNaN(val)) setBatteryLevel(val);
        }

        // Update Switch State (Feedback)
        if (haSettings.switchEntityId && entities[haSettings.switchEntityId]) {
          const state = entities[haSettings.switchEntityId].state;
          setIsHeating(state === 'on');
          if (state === 'on') {
            setLastHeatActiveTime(Date.now());
          }
        }

        // Update Humidifier State
        if (haSettings.humidifierEntityId && entities[haSettings.humidifierEntityId]) {
            setIsHumidifierOn(entities[haSettings.humidifierEntityId].state === 'on');
        }
      });

      // Initial History Fetch
      refreshHistory();
    };

    initHa();

    // Poll history every 15 minutes
    const historyInterval = setInterval(refreshHistory, 15 * 60 * 1000);

    return () => {
      haService.disconnect();
      setHaConnected(false);
      clearInterval(historyInterval);
    };
  }, [haSettings]);

  // Weather API Integration
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        
        if (data.current_weather) {
          const { weathercode, temperature, is_day } = data.current_weather;
          let condition: WeatherState['condition'] = 'cloudy';
          
          if (is_day === 0) {
            condition = 'night';
          } else {
             if (weathercode === 0) condition = 'sunny';
             else if (weathercode >= 1 && weathercode <= 3) condition = 'cloudy';
             else if ([45, 48].includes(weathercode)) condition = 'fog';
             else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weathercode)) condition = 'rain';
             else if ([71, 73, 75, 77, 85, 86].includes(weathercode)) condition = 'snow';
             else if ([95, 96, 99].includes(weathercode)) condition = 'thunder';
             else condition = 'cloudy';
          }

          setWeather(prev => ({
            condition,
            temp: haSettings.outdoorTempEntityId ? prev.temp : temperature
          }));
        }
      } catch (error) {
        console.error("Failed to fetch weather data", error);
      }
    };

    const runFetch = () => {
         if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => fetchWeather(p.coords.latitude, p.coords.longitude),
                () => fetchWeather(52.3676, 4.9041)
            );
        } else {
            fetchWeather(52.3676, 4.9041);
        }
    };

    runFetch();
    const interval = setInterval(runFetch, 1800000); // 30 mins
    return () => clearInterval(interval);
  }, [haSettings.outdoorTempEntityId]);

  // Mode Sync Logic
  useEffect(() => {
    const updateModeFromSchedule = () => {
      if (vacationSettings.enabled) {
        const today = new Date().toISOString().split('T')[0];
        if (today >= vacationSettings.startDate && today <= vacationSettings.endDate) {
          setMode(ThermostatMode.AWAY);
          return;
        }
      }

      const now = new Date();
      const currentDay = now.getDay();
      const isWeekend = currentDay === 0 || currentDay === 6;
      const currentTimeStr = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

      const type = isWeekend ? 'weekend' : 'workday';
      const todaysSlots = schedule
        .filter(s => s.type === type && s.active)
        .sort((a, b) => a.time.localeCompare(b.time));

      let currentSlot: ScheduleItem | null = null;
      for (const slot of todaysSlots) {
        if (slot.time <= currentTimeStr) {
          currentSlot = slot;
        } else {
          break;
        }
      }
      
      if (!currentSlot && todaysSlots.length > 0) {
        currentSlot = todaysSlots[todaysSlots.length - 1];
      }

      if (currentSlot) {
        const label = currentSlot.label.toLowerCase();
        if (label.includes('slapen')) setMode(ThermostatMode.SLEEP);
        else if (label.includes('vertrek') || label.includes('weg') || label.includes('werk')) setMode(ThermostatMode.AWAY);
        else setMode(ThermostatMode.HOME);
      }
    };

    updateModeFromSchedule();
    const interval = setInterval(updateModeFromSchedule, 60000); 
    return () => clearInterval(interval);
  }, [schedule, vacationSettings]);

  // Summer Mode Logic
  useEffect(() => {
    if (summerMode) {
      setTargetTemp(summerTemp);
    }
  }, [summerMode, summerTemp]);

  // Vacation Mode Logic
  useEffect(() => {
    if (vacationSettings.enabled) {
      const today = new Date().toISOString().split('T')[0];
      if (today >= vacationSettings.startDate && today <= vacationSettings.endDate) {
        setTargetTemp(vacationSettings.temp);
      }
    }
  }, [vacationSettings]);

  // Main Control Loop (Heat + Humidifier)
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        
        // --- Heating Logic ---
        const currentTemp = currentRawTemp + tempCalibration;
        const activeTarget = summerMode ? summerTemp : targetTemp;
        const msInDay = 24 * 60 * 60 * 1000;
        const maintenanceNeeded = (now - lastHeatActiveTime) > (maintenanceIntervalDays * msInDay);
        let maintenanceActive = false;

        if (maintenanceNeeded) {
            const maintenanceDurationMs = maintenanceDurationMins * 60 * 1000;
            const timeSinceMaintenanceStart = now - lastMaintenanceTime;

            if (timeSinceMaintenanceStart < maintenanceDurationMs) {
                maintenanceActive = true;
            } else if (timeSinceMaintenanceStart > maintenanceDurationMs && (now - lastMaintenanceTime) > msInDay) {
                setLastMaintenanceTime(now);
                maintenanceActive = true;
            }
        }

        let shouldHeat = isHeating;
        let heatReason = "";

        if (maintenanceActive) {
            shouldHeat = true;
            heatReason = `Onderhoudsmodus actief (${maintenanceDurationMins} min)`;
        } else if (currentTemp < activeTarget - hysteresis) {
            shouldHeat = true;
            heatReason = `Temperatuur te laag (${currentTemp.toFixed(1)} < ${activeTarget - hysteresis})`;
        } else if (currentTemp > activeTarget + hysteresis) {
            shouldHeat = false;
            heatReason = `Temperatuur bereikt (${currentTemp.toFixed(1)} > ${activeTarget + hysteresis})`;
        } else {
            heatReason = isHeating ? "Verwarmen (Binnen marge)" : "Stand-by (Binnen marge)";
        }

        if (haConnected && haSettings.switchEntityId) {
             if (shouldHeat !== isHeating) {
                 haService.setSwitch(haSettings.switchEntityId, shouldHeat);
             }
        } else if (!haConnected) {
            // Sim logic
            if (shouldHeat) setCurrentRawTemp(prev => Math.min(prev + 0.05, activeTarget + 1)); 
            else setCurrentRawTemp(prev => Math.max(prev - 0.05, 15));
            setIsHeating(shouldHeat);
            if (shouldHeat) setLastHeatActiveTime(Date.now());
        }

        // --- Humidifier Logic ---
        let shouldHumidify = isHumidifierOn;
        let humReason = "";
        
        const MIN_RUN_TIME_MS = 60 * 60 * 1000; // 60 mins on
        const MIN_REST_TIME_MS = 20 * 60 * 1000; // 20 mins off
        const curHum = humidity + humidifierCalibration;
        
        // 1. Safety Check: Sleep Mode = OFF
        if (mode === ThermostatMode.SLEEP) {
             shouldHumidify = false;
             humReason = "Slaapmodus actief";
        } else {
             // 2. Timer Protection
             const timeSinceStart = now - lastHumidifierStartTime;
             const timeSinceStop = now - lastHumidifierStopTime;
             
             if (isHumidifierOn) {
                 // Already running. Must run for at least MIN_RUN_TIME
                 if (timeSinceStart < MIN_RUN_TIME_MS) {
                     shouldHumidify = true;
                     humReason = `Minimale draaitijd (${Math.ceil((MIN_RUN_TIME_MS - timeSinceStart)/60000)}m resterend)`;
                 } else {
                     // Can turn off if target reached
                     if (curHum > humidifierTarget + humidifierHysteresis) {
                         shouldHumidify = false;
                         humReason = `Doel bereikt (${curHum} > ${humidifierTarget + humidifierHysteresis})`;
                     } else {
                         shouldHumidify = true;
                         humReason = "Bevochtigen...";
                     }
                 }
             } else {
                 // Currently off. Must rest for at least MIN_REST_TIME
                 if (timeSinceStop < MIN_REST_TIME_MS) {
                     shouldHumidify = false;
                     humReason = `Minimale rusttijd (${Math.ceil((MIN_REST_TIME_MS - timeSinceStop)/60000)}m resterend)`;
                 } else {
                     // Can turn on if needed
                     if (curHum < humidifierTarget - humidifierHysteresis) {
                         shouldHumidify = true;
                         humReason = `Te droog (${curHum} < ${humidifierTarget - humidifierHysteresis})`;
                     } else {
                         shouldHumidify = false;
                         humReason = "Vochtigheid OK";
                     }
                 }
             }
        }

        // Update Humidifier
        if (haConnected && haSettings.humidifierEntityId) {
             if (shouldHumidify !== isHumidifierOn) {
                 haService.setSwitch(haSettings.humidifierEntityId, shouldHumidify);
                 // Update timers for tracking
                 if (shouldHumidify) setLastHumidifierStartTime(now);
                 else setLastHumidifierStopTime(now);
                 // Optimistic update
                 setIsHumidifierOn(shouldHumidify);
             }
        } else if (!haConnected) {
             // Sim logic
             if (shouldHumidify !== isHumidifierOn) {
                 if (shouldHumidify) setLastHumidifierStartTime(now);
                 else setLastHumidifierStopTime(now);
                 setIsHumidifierOn(shouldHumidify);
             }
             // Sim effect
             if (shouldHumidify) setHumidity(h => Math.min(h + 0.1, 100));
             else setHumidity(h => Math.max(h - 0.05, 30));
        }

        setDebugLogic({
            lastHeat: new Date(lastHeatActiveTime).toLocaleString('nl-NL'),
            reason: heatReason,
            humidifierReason: humReason
        });

    }, 2000);

    return () => clearInterval(interval);
  }, [
    targetTemp, currentRawTemp, tempCalibration, hysteresis, summerMode, summerTemp, 
    isHeating, haConnected, haSettings, maintenanceIntervalDays, maintenanceDurationMins, 
    lastHeatActiveTime, lastMaintenanceTime,
    isHumidifierOn, humidity, humidifierCalibration, humidifierTarget, humidifierHysteresis, mode, lastHumidifierStartTime, lastHumidifierStopTime
  ]);

  // Temp Interaction Handlers
  const handleUserInteraction = () => {
     if (summerMode) return;
     setIsAdjusting(true);
     if (adjustTimeoutRef.current) clearTimeout(adjustTimeoutRef.current);
     adjustTimeoutRef.current = setTimeout(() => {
         setIsAdjusting(false);
     }, 3000);
  };

  const adjustTemp = (delta: number) => {
    if (summerMode) return; 
    setTargetTemp(prev => Math.min(30, Math.max(10, Math.round((prev + delta) * 2) / 2)));
    handleUserInteraction();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (summerMode) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentTemp.current = targetTemp;
    handleUserInteraction();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (summerMode || touchStartX.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const steps = Math.round(diffX / 30) * 0.5; 
    if (steps !== 0) {
      const newTemp = Math.min(30, Math.max(10, touchCurrentTemp.current + steps));
      setTargetTemp(newTemp);
      handleUserInteraction();
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (summerMode) return;
    isDragging.current = true;
    touchStartX.current = e.clientX;
    touchCurrentTemp.current = targetTemp;
    handleUserInteraction();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (summerMode || !isDragging.current || touchStartX.current === null) return;
    const diffX = e.clientX - touchStartX.current;
    const steps = Math.round(diffX / 30) * 0.5; 
    if (steps !== 0) {
      const newTemp = Math.min(30, Math.max(10, touchCurrentTemp.current + steps));
      setTargetTemp(newTemp);
      handleUserInteraction();
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    touchStartX.current = null;
  };

  const boxStyle = {
    backgroundColor: `rgba(0, 0, 0, ${boxTransparency / 100})`,
    backdropFilter: `blur(${boxBlur}px)`,
    WebkitBackdropFilter: `blur(${boxBlur}px)`,
  };

  const buttonStyle = {
     backgroundColor: `rgba(255, 255, 255, ${Math.max(0.1, boxTransparency / 200)})`,
  };
  
  const borderClass = boxTransparency < 5 ? 'border-transparent' : 'border-white/10';

  return (
    <div className="relative w-full h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col font-sans select-none text-white transition-all bg-black">
      
      {/* Background Layer - Explicit Z-0 */}
      <div className="fixed inset-0 z-0">
         <DynamicBackground weather={weather} />
      </div>

      {/* Content Layer - Z-10 */}
      <main className="relative z-10 flex flex-col items-center p-4 max-w-5xl mx-auto w-full min-h-[100dvh]" style={{ gap: `${verticalSpacing}px` }}>
        
        <header className="w-full flex justify-between items-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] shrink-0 pt-2">
            <div className="flex flex-col">
                <span className="text-3xl md:text-4xl font-light tracking-tight leading-tight">{new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-sm md:text-lg font-medium opacity-80">{new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-3xl md:text-4xl font-medium leading-tight">{weather.temp}°C</span>
                <span className="text-sm md:text-base uppercase tracking-wide opacity-80 font-semibold">
                    {weather.condition === 'rain' ? 'Regen' : weather.condition === 'sunny' ? 'Zonnig' : weather.condition === 'night' ? 'Nacht' : weather.condition === 'fog' ? 'Mist' : weather.condition === 'snow' ? 'Sneeuw' : weather.condition === 'thunder' ? 'Onweer' : 'Bewolkt'}
                </span>
            </div>
        </header>

        <div className="w-full flex flex-col items-center justify-center flex-1 shrink-0 relative py-4">
             <div 
                className="flex flex-col items-center justify-center w-full h-full transition-transform duration-300 ease-out origin-center"
                style={{ transform: `scale(${uiScale})` }}
             >
                <div 
                    className={`relative w-full max-w-2xl rounded-[2.5rem] border shadow-2xl p-4 md:p-6 flex flex-col items-center justify-between ${borderClass} cursor-grab active:cursor-grabbing`}
                    style={{ ...boxStyle, gap: `${verticalSpacing}px` }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="flex gap-4 w-full justify-center" onMouseDown={(e) => e.stopPropagation()}>
                        {summerMode ? (
                           <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-6 py-3 rounded-2xl flex items-center gap-2 w-full justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                             <Umbrella size={24} />
                             <span className="font-bold tracking-wider uppercase">Zomermodus Actief</span>
                           </div>
                        ) : (
                          [
                              { m: ThermostatMode.HOME, icon: Home, label: 'Thuis' },
                              { m: ThermostatMode.SLEEP, icon: Moon, label: 'Slapen' },
                              { m: ThermostatMode.AWAY, icon: Plane, label: 'Weg' }
                          ].map((item) => (
                              <div 
                                  key={item.m}
                                  style={mode !== item.m ? buttonStyle : {}}
                                  className={`px-4 py-2 md:py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 min-w-[90px] justify-center ${
                                      mode === item.m 
                                      ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] ring-1 ring-orange-300' 
                                      : 'text-gray-300'
                                  }`}
                              >
                                  <item.icon size={20} />
                                  <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{item.label}</span>
                              </div>
                          ))
                        )}
                    </div>

                    <div className="relative flex items-center justify-center w-full py-2 flex-1">
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 pointer-events-none ${isHeating ? 'opacity-30 animate-pulse' : 'opacity-0'}`}>
                            <Flame size={200} className="text-orange-500 blur-2xl" />
                        </div>

                        <div className="flex items-center gap-4 z-10 w-full justify-between px-2 md:px-4">
                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => adjustTemp(-0.5)}
                                disabled={summerMode}
                                className={`w-16 h-24 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all group ${summerMode ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                <ChevronDown size={48} strokeWidth={2} className="opacity-70 group-hover:opacity-100 group-hover:translate-y-1 transition-all" />
                            </button>

                            <div className="flex flex-col items-center flex-1 pointer-events-none">
                                <div className="relative flex justify-center items-baseline">
                                    <AnimatedNumber 
                                        value={bigNumberValue} 
                                        className={`text-[6rem] md:text-[8rem] leading-none font-bold tracking-tighter drop-shadow-2xl font-mono tabular-nums transition-colors duration-300 ${isAdjusting ? 'text-orange-200' : 'text-white'}`}
                                    />
                                    <span className="text-4xl md:text-5xl text-white/60 font-light ml-1 relative -top-8 md:-top-12">°C</span>
                                    {isHeating && !isAdjusting && (
                                        <Flame 
                                            className="absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 text-orange-500 animate-bounce drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" 
                                            size={40} 
                                            fill="currentColor" 
                                        />
                                    )}
                                </div>
                                
                                <div className="flex gap-3 md:gap-6 mt-2 md:mt-4 pointer-events-auto">
                                    {/* Small Pill - Switches content */}
                                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md border shadow-lg transition-colors duration-300 ${isAdjusting ? 'border-orange-500/50 bg-orange-500/10' : 'border-white/10 bg-white/5'}`} >
                                        {isAdjusting ? <Target size={16} className="text-orange-400"/> : <span className="text-xs text-gray-300 uppercase font-bold tracking-wider">{smallNumberLabel}</span>}
                                        <span className={`text-2xl font-bold ${isAdjusting ? 'text-orange-200' : 'text-white'}`}>
                                            {smallNumberValue.toFixed(1)}°
                                        </span>
                                    </div>
                                    <button 
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={() => setHumidityPopupOpen(true)}
                                      className="px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md border border-blue-500/30 shadow-lg hover:bg-blue-500/10 transition-colors" 
                                      style={{ backgroundColor: `rgba(59, 130, 246, ${Math.max(0.1, boxTransparency / 300)})` }}
                                    >
                                        <Droplets size={20} className={`text-blue-400 fill-blue-400/20 ${isHumidifierOn ? 'animate-pulse' : ''}`} />
                                        <span className="text-2xl font-bold text-blue-100">{currentCorrectedHumidity.toFixed(0)}%</span>
                                    </button>
                                </div>
                            </div>

                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => adjustTemp(0.5)}
                                disabled={summerMode}
                                className={`w-16 h-24 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all group ${summerMode ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                                <ChevronUp size={48} strokeWidth={2} className="opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {graphHeight > 0 && (
            <div 
                className={`w-full rounded-2xl border p-4 shrink-0 transition-all duration-300 overflow-hidden mb-6 ${borderClass}`}
                style={{ ...boxStyle, height: `${graphHeight}px` }}
            >
                <HistoryCharts data={haConnected ? historyData : MOCK_HISTORY_DATA} />
            </div>
        )}

      </main>

      <BrightnessOverlay 
        maxBrightness={screenBrightness} 
        minBrightness={minBrightness}
        timeoutSeconds={dimTimeout}
        onSettingsClick={() => setSettingsOpen(true)} 
      />

      {/* Humidity Popup */}
      {humidityPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setHumidityPopupOpen(false)}>
           <div className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 w-80 shadow-2xl transform scale-100 transition-all" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2"><Droplets /> Luchtvochtigheid</h3>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-gray-400 text-sm">Doel:</span>
                 <span className="text-3xl font-bold text-blue-400">{humidifierTarget}%</span>
              </div>
              <input 
                  type="range" min="30" max="80" step="5" value={humidifierTarget} 
                  onChange={(e) => setHumidifierTarget(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
                 <span>Huidig: {currentCorrectedHumidity.toFixed(0)}%</span>
                 <span>Status: {isHumidifierOn ? 'Aan' : 'Uit'}</span>
              </div>
              <button 
                onClick={() => setHumidityPopupOpen(false)}
                className="w-full py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Sluiten
              </button>
           </div>
        </div>
      )}
      
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        brightness={screenBrightness}
        setBrightness={setScreenBrightness}
        minBrightness={minBrightness}
        setMinBrightness={setMinBrightness}
        dimTimeout={dimTimeout}
        setDimTimeout={setDimTimeout}
        boxTransparency={boxTransparency}
        setBoxTransparency={setBoxTransparency}
        boxBlur={boxBlur}
        setBoxBlur={setBoxBlur}
        uiScale={uiScale}
        setUiScale={setUiScale}
        verticalSpacing={verticalSpacing}
        setVerticalSpacing={setVerticalSpacing}
        graphHeight={graphHeight}
        setGraphHeight={setGraphHeight}
        schedule={schedule}
        setSchedule={setSchedule}
        vacationSettings={vacationSettings}
        setVacationSettings={setVacationSettings}
        hysteresis={hysteresis}
        setHysteresis={setHysteresis}
        tempCalibration={tempCalibration}
        setTempCalibration={setTempCalibration}
        summerMode={summerMode}
        setSummerMode={setSummerMode}
        summerTemp={summerTemp}
        setSummerTemp={setSummerTemp}
        maintenanceIntervalDays={maintenanceIntervalDays}
        setMaintenanceIntervalDays={setMaintenanceIntervalDays}
        maintenanceDurationMins={maintenanceDurationMins}
        setMaintenanceDurationMins={setMaintenanceDurationMins}
        humidifierHysteresis={humidifierHysteresis}
        setHumidifierHysteresis={setHumidifierHysteresis}
        humidifierCalibration={humidifierCalibration}
        setHumidifierCalibration={setHumidifierCalibration}
        haSettings={haSettings}
        setHaSettings={setHaSettings}
        haConnected={haConnected}
        batteryLevel={batteryLevel}
        debugInfo={{
            lastHeat: new Date(lastHeatActiveTime).toLocaleString('nl-NL'),
            reason: debugLogic.reason,
            humidifierReason: debugLogic.humidifierReason,
            activeTarget: summerMode ? summerTemp : targetTemp,
            currentRaw: currentRawTemp
        }}
      />
      
      {!haConnected && haSettings.url && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 z-50">
            <WifiOff size={16} /> Geen verbinding met Home Assistant
        </div>
      )}

    </div>
  );
};

export default App;