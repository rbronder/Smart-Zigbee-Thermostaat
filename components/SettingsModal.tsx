import React, { useState } from 'react';
import { X, Sun, Battery, Wifi, Clock, Layers, Move, Maximize, ArrowUpDown, GripHorizontal, Palette, LayoutDashboard, CalendarClock, Settings2, ThermometerSnowflake, Wrench, Snowflake, Moon, Link, Database, Info, Activity } from 'lucide-react';
import { ScheduleTab } from './ScheduleSettings';
import { ScheduleItem, VacationSettings, HaSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // General
  brightness: number;
  setBrightness: (val: number) => void;
  minBrightness: number;
  setMinBrightness: (val: number) => void;
  dimTimeout: number;
  setDimTimeout: (val: number) => void;
  boxTransparency: number;
  setBoxTransparency: (val: number) => void;
  boxBlur: number;
  setBoxBlur: (val: number) => void;
  // Layout
  uiScale: number;
  setUiScale: (val: number) => void;
  verticalSpacing: number;
  setVerticalSpacing: (val: number) => void;
  graphHeight: number;
  setGraphHeight: (val: number) => void;
  // Schedule
  schedule: ScheduleItem[];
  setSchedule: (val: ScheduleItem[]) => void;
  vacationSettings: VacationSettings;
  setVacationSettings: (val: VacationSettings) => void;
  // Advanced / System
  hysteresis: number;
  setHysteresis: (val: number) => void;
  tempCalibration: number;
  setTempCalibration: (val: number) => void;
  summerMode: boolean;
  setSummerMode: (val: boolean) => void;
  summerTemp: number;
  setSummerTemp: (val: number) => void;
  maintenanceIntervalDays: number;
  setMaintenanceIntervalDays: (val: number) => void;
  maintenanceDurationMins: number;
  setMaintenanceDurationMins: (val: number) => void;
  // HA Connection
  haSettings: HaSettings;
  setHaSettings: (val: HaSettings) => void;
  // Status (Read only)
  haConnected: boolean;
  batteryLevel: number | null;
  // Debug info passed from App
  debugInfo?: {
    lastHeat: string;
    reason: string;
    activeTarget: number;
    currentRaw: number;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  brightness, setBrightness,
  minBrightness, setMinBrightness,
  dimTimeout, setDimTimeout,
  boxTransparency, setBoxTransparency,
  boxBlur, setBoxBlur,
  uiScale, setUiScale,
  verticalSpacing, setVerticalSpacing,
  graphHeight, setGraphHeight,
  schedule, setSchedule,
  vacationSettings, setVacationSettings,
  hysteresis, setHysteresis,
  tempCalibration, setTempCalibration,
  summerMode, setSummerMode,
  summerTemp, setSummerTemp,
  maintenanceIntervalDays, setMaintenanceIntervalDays,
  maintenanceDurationMins, setMaintenanceDurationMins,
  haSettings, setHaSettings,
  haConnected,
  batteryLevel,
  debugInfo
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'schedule' | 'system' | 'connection'>('general');

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
          <h3 className="text-xl font-bold text-white">Instellingen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 shrink-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-white/10 text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Palette size={16} /> Weergave
          </button>
          <button 
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'layout' ? 'bg-white/10 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <LayoutDashboard size={16} /> Layout
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white/10 text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <CalendarClock size={16} /> Programma
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'system' ? 'bg-white/10 text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Settings2 size={16} /> Systeem
          </button>
          <button 
            onClick={() => setActiveTab('connection')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'connection' ? 'bg-white/10 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Link size={16} /> Connectie
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Brightness Control */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Sun size={16} className="text-orange-400" /> Maximale Helderheid ({brightness}%)
                </label>
                <input 
                  type="range" min="10" max="100" step="5" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

               {/* Min Brightness Control */}
               <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Moon size={16} className="text-gray-400" /> Minimale Helderheid (Dim) ({minBrightness}%)
                </label>
                <input 
                  type="range" min="0" max="50" step="5" value={minBrightness} 
                  onChange={(e) => setMinBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
                />
              </div>

              {/* Timeout Control */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Clock size={16} className="text-blue-400" /> Dim Time-out ({dimTimeout}s)
                </label>
                <input 
                  type="range" min="5" max="120" step="5" value={dimTimeout} 
                  onChange={(e) => setDimTimeout(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="h-px bg-white/10 my-2" />

              {/* Transparency Control */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Layers size={16} className="text-purple-400" /> Achtergrond Transparantie ({boxTransparency}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="5" value={boxTransparency} 
                  onChange={(e) => setBoxTransparency(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Blur Control */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <GripHorizontal size={16} className="text-pink-400" /> Achtergrond Blur ({boxBlur}px)
                </label>
                <input 
                  type="range" min="0" max="40" step="1" value={boxBlur} 
                  onChange={(e) => setBoxBlur(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
             <div className="space-y-6 max-w-xl mx-auto">
              <p className="text-xs text-gray-400 mb-4 bg-gray-800 p-2 rounded border border-white/5">
                Pas de afmetingen aan om de interface passend te maken voor jouw scherm.
              </p>

              {/* UI Scale */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Maximize size={16} className="text-green-400" /> Kaart Grootte ({(uiScale * 100).toFixed(0)}%)
                </label>
                <input 
                  type="range" min="0.5" max="1.5" step="0.05" value={uiScale} 
                  onChange={(e) => setUiScale(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* Vertical Spacing */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <ArrowUpDown size={16} className="text-yellow-400" /> Verticale Afstand ({verticalSpacing}px)
                </label>
                <input 
                  type="range" min="0" max="60" step="4" value={verticalSpacing} 
                  onChange={(e) => setVerticalSpacing(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              {/* Graph Height */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-medium">
                  <Move size={16} className="text-red-400" /> Grafiek Hoogte ({graphHeight}px)
                </label>
                <input 
                  type="range" min="0" max="300" step="10" value={graphHeight} 
                  onChange={(e) => setGraphHeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
             </div>
          )}

          {activeTab === 'schedule' && (
             <ScheduleTab 
                schedule={schedule}
                onUpdateSchedule={setSchedule}
                vacationSettings={vacationSettings}
                onUpdateVacation={setVacationSettings}
             />
          )}

          {activeTab === 'system' && (
             <div className="space-y-8 max-w-xl mx-auto">

               {/* Debug / Status Block */}
               <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                 <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Activity size={18} className="text-green-400"/> Status & Diagnose
                  </h4>
                  <div className="text-xs font-mono space-y-1 text-gray-300">
                    <div className="flex justify-between">
                      <span>Laatst gestookt:</span>
                      <span>{debugInfo?.lastHeat || 'Onbekend'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Huidige meting (ongecorrigeerd):</span>
                      <span>{debugInfo?.currentRaw.toFixed(2)} °C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calibratie:</span>
                      <span>{tempCalibration > 0 ? '+' : ''}{tempCalibration} °C</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1 mt-1 font-bold text-white">
                      <span>Doel Temperatuur:</span>
                      <span>{debugInfo?.activeTarget.toFixed(1)} °C</span>
                    </div>
                    <div className="mt-2 p-2 bg-gray-800 rounded text-blue-200">
                      <strong>Logica:</strong> {debugInfo?.reason || 'Wachten op data...'}
                    </div>
                  </div>
               </div>
               
               {/* Hysteresis */}
               <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <ThermometerSnowflake size={18} className="text-blue-400"/> Thermostaat Gevoeligheid
                  </h4>
                  <div className="flex items-center gap-4">
                     <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Schakel marge (Hysteresis)</label>
                        <input 
                          type="range" min="0.1" max="0.5" step="0.1" value={hysteresis} 
                          onChange={(e) => setHysteresis(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                     <span className="font-mono text-white text-lg w-12 text-right">±{hysteresis}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    CV schakelt in bij doel - {hysteresis}°C en uit bij doel + {hysteresis}°C.
                  </p>
               </div>

               {/* Calibration */}
               <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Settings2 size={18} className="text-purple-400"/> Sensor Calibratie
                  </h4>
                  <div className="flex items-center gap-4">
                     <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Temperatuur Correctie</label>
                        <input 
                          type="range" min="-5" max="5" step="0.1" value={tempCalibration} 
                          onChange={(e) => setTempCalibration(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                     </div>
                     <span className="font-mono text-white text-lg w-16 text-right">{tempCalibration > 0 ? '+' : ''}{tempCalibration.toFixed(1)}</span>
                  </div>
               </div>

               {/* Summer Mode */}
               <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <Sun size={18} className="text-yellow-400"/> Zomermodus (Anti-vorst)
                      </h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={summerMode}
                          onChange={(e) => setSummerMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                   </div>
                   
                   <div className={`transition-opacity ${summerMode ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <label className="text-xs text-gray-400 mb-1 block">Vaste Zomer Temperatuur</label>
                      <div className="flex items-center gap-3">
                         <input 
                            type="range" min="5" max="20" step="1" value={summerTemp} 
                            onChange={(e) => setSummerTemp(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                          />
                          <span className="font-mono text-white text-lg w-12 text-right">{summerTemp}°C</span>
                      </div>
                   </div>
               </div>

                {/* Maintenance */}
               <div className="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Wrench size={18} className="text-green-400"/> Onderhoud (Vastroesten voorkomen)
                  </h4>
                  <div className="flex gap-4">
                     <div className="flex-1">
                       <label className="text-xs text-gray-400 mb-1 block">Frequentie (Dagen)</label>
                       <input 
                         type="number" value={maintenanceIntervalDays} 
                         onChange={(e) => setMaintenanceIntervalDays(Number(e.target.value))}
                         className="bg-gray-700 text-white rounded p-2 w-full text-center"
                       />
                     </div>
                     <div className="flex-1">
                       <label className="text-xs text-gray-400 mb-1 block">Duur (Minuten)</label>
                       <input 
                         type="number" value={maintenanceDurationMins} 
                         onChange={(e) => setMaintenanceDurationMins(Number(e.target.value))}
                         className="bg-gray-700 text-white rounded p-2 w-full text-center"
                       />
                     </div>
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-cyan-500/20">
                <p className="text-sm text-cyan-200 mb-4 flex gap-2">
                  <Database size={16} />
                  Vul hier je Home Assistant gegevens in om Zigbee apparaten uit te lezen.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Home Assistant URL</label>
                    <input 
                      type="text" 
                      placeholder="http://192.168.1.5:8123"
                      value={haSettings.url}
                      onChange={(e) => setHaSettings({...haSettings, url: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Long-Lived Access Token</label>
                    <input 
                      type="password" 
                      placeholder="ey..."
                      value={haSettings.token}
                      onChange={(e) => setHaSettings({...haSettings, token: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Maak aan in je profiel (helemaal onderaan).</p>
                  </div>

                  <div className="h-px bg-white/5 my-4"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Temperatuursensor ID</label>
                        <input 
                        type="text" 
                        placeholder="sensor.woonkamer_temperatuur"
                        value={haSettings.sensorEntityId}
                        onChange={(e) => setHaSettings({...haSettings, sensorEntityId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Luchtvochtigheid ID</label>
                        <input 
                        type="text" 
                        placeholder="sensor.woonkamer_vocht"
                        value={haSettings.humidityEntityId}
                        onChange={(e) => setHaSettings({...haSettings, humidityEntityId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">CV Ketel Schakelaar ID</label>
                        <input 
                        type="text" 
                        placeholder="switch.cv_ketel"
                        value={haSettings.switchEntityId}
                        onChange={(e) => setHaSettings({...haSettings, switchEntityId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Sensor Batterij ID</label>
                        <input 
                        type="text" 
                        placeholder="sensor.temp_batterij"
                        value={haSettings.batteryEntityId || ''}
                        onChange={(e) => setHaSettings({...haSettings, batteryEntityId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                        />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                     <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-2">
                        <Sun size={12}/> Buitentemperatuur Sensor ID (Optioneel)
                     </label>
                     <input 
                        type="text" 
                        placeholder="sensor.buiten_temperatuur (laat leeg voor internet weer)"
                        value={haSettings.outdoorTempEntityId || ''}
                        onChange={(e) => setHaSettings({...haSettings, outdoorTempEntityId: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none"
                     />
                     <p className="text-[10px] text-gray-500 mt-1">
                        Indien ingevuld, wordt deze waarde gebruikt in plaats van de weer-API.
                     </p>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* System Status (Real Data) */}
          {activeTab === 'general' && (
            <div className="pt-4 border-t border-white/10 space-y-3 mt-6 max-w-xl mx-auto">
              <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-400"><Wifi size={16} /> Netwerk</span>
                  <span className={`font-medium ${haConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {haConnected ? 'Verbonden' : 'Verbroken'}
                  </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-gray-400"><Battery size={16} /> Sensor Batterij</span>
                  <span className={`font-medium ${!batteryLevel ? 'text-gray-500' : batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}`}>
                    {batteryLevel !== null ? `${batteryLevel}%` : 'Onbekend'}
                  </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};