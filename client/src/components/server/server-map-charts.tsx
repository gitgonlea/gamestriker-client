// components/server/server-map-charts.tsx
'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ServerDetail, MapData } from '@/types/server';

interface ServerMapChartsProps {
  serverData: ServerDetail;
}

export default function ServerMapCharts({ serverData }: ServerMapChartsProps) {
  const { t } = useTranslation();
  
  // Check if map data exists
  const hasMapData = 
    serverData.WeeklyMapData && 
    serverData.WeeklyMapData.length > 0 && 
    serverData.WeeklyMapData[0].map_data && 
    serverData.WeeklyMapData[0].map_data.length > 0;
  
  if (!hasMapData) {
    return (
      <div className="flex justify-center items-center h-64 bg-black bg-opacity-70 rounded">
        <p className="text-amber-400">{t('noInfoAvailable')}</p>
      </div>
    );
  }
  
  // Colors for the pie chart
  const COLORS = [
    'rgb(32, 179, 228)', 
    'rgb(35, 165, 209)', 
    'rgb(255, 184, 28)', 
    'rgb(230, 173, 51)', 
    'rgb(247, 247, 236)', 
    'rgba(247, 247, 236, 0.897)'
  ];
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black p-1 text-white text-xs border border-gray-700">
          <p>{payload[0].name}</p>
          <p>
            {t('played')} {payload[0].payload.count} {payload[0].payload.count > 1 ? t('times') : t('time')}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label component for the pie chart
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN) + 10;
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const mapData = serverData.WeeklyMapData[0].map_data[index];
    const color = COLORS[index % COLORS.length];
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={color} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs"
      >
        {`${mapData.name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  return (
    <div className="bg-black bg-opacity-70 rounded p-2 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={serverData.WeeklyMapData[0].map_data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={60}
            dataKey="value"
          >
            {serverData.WeeklyMapData[0].map_data.map((entry: MapData, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}