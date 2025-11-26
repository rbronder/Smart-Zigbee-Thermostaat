import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryDataPoint } from '../types';

interface HistoryChartsProps {
  data: HistoryDataPoint[];
}

export const HistoryCharts: React.FC<HistoryChartsProps> = ({ data }) => {
  return (
    <div className="w-full h-48 flex flex-col gap-2">
      {/* Temperature Chart */}
      <div className="flex-1 relative">
        <h4 className="absolute top-0 left-2 text-xs font-semibold text-orange-200/80 z-10 drop-shadow-md">Temperatuurverloop (24u)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
            <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fb923c' }}
                formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temp']}
            />
            <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Chart */}
      <div className="h-16 relative opacity-80">
        <h4 className="absolute top-0 left-2 text-xs font-semibold text-blue-200/80 z-10 drop-shadow-md">Luchtvochtigheid (24u)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
                 contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                 itemStyle={{ color: '#60a5fa' }}
                 formatter={(value: number) => [`${value.toFixed(0)}%`, 'Vocht']}
            />
            <Area 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHum)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};