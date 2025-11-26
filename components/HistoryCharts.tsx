import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { HistoryDataPoint } from '../types';

interface HistoryChartsProps {
  data: HistoryDataPoint[];
}

export const HistoryCharts: React.FC<HistoryChartsProps> = ({ data }) => {
  
  // Find current time index to draw reference line
  const now = new Date();
  const currentHourLabel = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full h-full flex flex-col gap-2 relative">
      {/* Temperature Chart */}
      <div className="flex-1 relative min-h-0">
        <h4 className="absolute top-0 left-2 text-xs font-semibold text-orange-200/80 z-10 drop-shadow-md">Temperatuur (°C)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
            <ReferenceLine x={currentHourLabel} stroke="white" strokeOpacity={0.5} strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              interval={2} 
              tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} 
              tickLine={false}
              axisLine={false}
              height={15}
            />
            <YAxis domain={['auto', 'auto']} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} tickLine={false} axisLine={false} />
            <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ padding: 0 }}
                labelStyle={{ marginBottom: '4px', color: '#aaa' }}
                formatter={(value: number) => [isNaN(value) ? '-' : value.toFixed(1), '']}
                // Force tooltip to show Binnen (Indoor) first, then Buiten (Outdoor)
                itemSorter={(item: any) => item.name === 'Binnen' ? -1 : 1}
            />
            <Legend verticalAlign="top" height={20} iconSize={8} wrapperStyle={{ fontSize: '10px', right: 0, top: 0, color: '#aaa' }}/>
            
            {/* Outdoor Temp (Line) - Rendered first in SVG (back) */}
            <Area 
                type="monotone" 
                dataKey="outdoorTemp" 
                name="Buiten"
                stroke="#60a5fa" 
                strokeWidth={2}
                fill="transparent" 
                dot={false}
                connectNulls={false}
            />
            
            {/* Indoor Temp (Area) - Rendered second (front) */}
            <Area 
                type="monotone" 
                dataKey="temp" 
                name="Binnen"
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity Chart */}
      <div className="h-1/3 relative opacity-90 min-h-0">
        <h4 className="absolute top-0 left-2 text-xs font-semibold text-blue-200/80 z-10 drop-shadow-md">Vochtigheid (%)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
            <ReferenceLine x={currentHourLabel} stroke="white" strokeOpacity={0.5} strokeDasharray="3 3" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} tickLine={false} axisLine={false} />
            <Tooltip 
                 contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                 formatter={(value: number) => [isNaN(value) ? '-' : value.toFixed(0), '']}
                 // Force tooltip to show Binnen first
                 itemSorter={(item: any) => item.name === 'Binnen' ? -1 : 1}
            />
            
            {/* Outdoor Hum (Line) */}
             <Area 
                type="monotone" 
                dataKey="outdoorHumidity" 
                name="Buiten"
                stroke="#94a3b8" 
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="transparent" 
                dot={false}
                connectNulls={false}
            />

            {/* Indoor Hum (Area) */}
            <Area 
                type="monotone" 
                dataKey="humidity" 
                name="Binnen"
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHum)" 
                connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};