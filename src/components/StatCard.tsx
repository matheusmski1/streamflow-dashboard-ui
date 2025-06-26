import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  loading: boolean;
  isCurrency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, loading, isCurrency = false }) => {
  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend >= 0 ? ArrowUp : ArrowDown;

  const formatValue = () => {
    if (loading) return <div className="h-6 bg-gray-200 rounded-md w-20 animate-pulse"></div>;
    if (isCurrency) {
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return Number(value).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-lg mr-4 text-blue-600">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue()}</p>
        </div>
      </div>
      <div className="flex items-center mt-3 text-sm">
        <div className={`flex items-center ${trendColor}`}>
          <TrendIcon size={16} className="mr-1" />
          <span>{Math.abs(trend)}%</span>
        </div>
        <p className="text-gray-500 ml-2">vs last month</p>
      </div>
    </div>
  );
};

export default StatCard; 