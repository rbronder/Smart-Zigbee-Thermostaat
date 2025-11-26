import React, { useState } from 'react';
import { ScheduleItem, VacationSettings } from '../types';
import { Clock, Thermometer, Trash2, Plus, Calendar, Briefcase, Coffee, Sun } from 'lucide-react';

interface ScheduleTabProps {
  schedule: ScheduleItem[];
  onUpdateSchedule: (newSchedule: ScheduleItem[]) => void;
  vacationSettings: VacationSettings;
  onUpdateVacation: (settings: VacationSettings) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ 
  schedule, 
  onUpdateSchedule,
  vacationSettings,
  onUpdateVacation
}) => {
  const [activeSection, setActiveSection] = useState<'workday' | 'weekend' | 'vacation'>('workday');

  const handleTimeChange = (id: string, newTime: string) => {
    onUpdateSchedule(schedule.map(item => item.id === id ? { ...item, time: newTime } : item));
  };

  const handleTempChange = (id: string, newTemp: number) => {
    onUpdateSchedule(schedule.map(item => item.id === id ? { ...item, temp: newTemp } : item));
  };
  
  const handleLabelChange = (id: string, newLabel: string) => {
    onUpdateSchedule(schedule.map(item => item.id === id ? { ...item, label: newLabel } : item));
  };

  const handleDelete = (id: string) => {
    onUpdateSchedule(schedule.filter(item => item.id !== id));
  };

  const handleAdd = (type: 'workday' | 'weekend') => {
    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: 'Nieuw',
      time: '12:00',
      temp: 19.0,
      active: true
    };
    onUpdateSchedule([...schedule, newItem]);
  };

  const filteredSchedule = schedule
    .filter(item => item.type === activeSection)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs for Schedule Type */}
      <div className="flex p-2 bg-gray-800/50 rounded-lg mb-4 gap-2">
        <button 
          onClick={() => setActiveSection('workday')}
          className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center gap-2 transition-colors ${activeSection === 'workday' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Briefcase size={14} /> Werkdagen
        </button>
        <button 
          onClick={() => setActiveSection('weekend')}
          className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center gap-2 transition-colors ${activeSection === 'weekend' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Coffee size={14} /> Weekend
        </button>
        <button 
          onClick={() => setActiveSection('vacation')}
          className={`flex-1 py-2 text-sm rounded-md flex items-center justify-center gap-2 transition-colors ${activeSection === 'vacation' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Calendar size={14} /> Vakantie
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {activeSection === 'vacation' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-blue-500/30">
              <span className="font-medium text-blue-100 flex items-center gap-2">
                <Sun size={18} /> Vakantiemodus inschakelen
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={vacationSettings.enabled}
                  onChange={(e) => onUpdateVacation({ ...vacationSettings, enabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className={`space-y-4 transition-opacity ${vacationSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
               <div>
                  <label className="text-sm text-gray-400 mb-1 block">Periode</label>
                  <div className="flex gap-4">
                    <input 
                      type="date" 
                      value={vacationSettings.startDate}
                      onChange={(e) => onUpdateVacation({ ...vacationSettings, startDate: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                    />
                    <span className="self-center text-gray-500">-</span>
                    <input 
                      type="date" 
                      value={vacationSettings.endDate}
                      onChange={(e) => onUpdateVacation({ ...vacationSettings, endDate: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded p-2 text-white w-full"
                    />
                  </div>
               </div>

               <div>
                  <label className="text-sm text-gray-400 mb-1 block">Vaste Temperatuur</label>
                  <div className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
                    <Thermometer size={20} className="text-blue-400" />
                    <input 
                      type="range" 
                      min="10" 
                      max="25" 
                      step="0.5" 
                      value={vacationSettings.temp}
                      onChange={(e) => onUpdateVacation({ ...vacationSettings, temp: parseFloat(e.target.value) })}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="font-mono text-xl w-16 text-right">{vacationSettings.temp}°C</span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <>
            {filteredSchedule.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-gray-800/50 hover:bg-gray-800 transition-colors group"
              >
                {/* Time Input */}
                <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded">
                  <Clock size={14} className="text-gray-400" />
                  <input 
                    type="time" 
                    value={item.time}
                    onChange={(e) => handleTimeChange(item.id, e.target.value)}
                    className="bg-transparent text-white font-mono text-lg w-16 focus:outline-none"
                  />
                </div>

                {/* Label Input */}
                <input 
                    type="text" 
                    value={item.label}
                    onChange={(e) => handleLabelChange(item.id, e.target.value)}
                    className="bg-transparent text-sm font-medium text-orange-200 w-24 focus:outline-none border-b border-transparent focus:border-orange-500/50 placeholder-gray-600"
                    placeholder="Label..."
                />

                {/* Temp Slider & Display */}
                <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="range" 
                    min="15" 
                    max="25" 
                    step="0.5" 
                    value={item.temp}
                    onChange={(e) => handleTempChange(item.id, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-lg font-bold text-white w-14 text-right">{item.temp.toFixed(1)}°</span>
                </div>

                {/* Delete Button - Always visible for touch usage */}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button 
              onClick={() => handleAdd(activeSection as 'workday' | 'weekend')}
              className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> Tijdslot toevoegen
            </button>
          </>
        )}
      </div>
    </div>
  );
};