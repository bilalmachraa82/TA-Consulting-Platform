
'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  delay = 0,
}: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    success: 'from-green-500/20 to-green-500/5 text-green-600 dark:text-green-400',
    warning: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="card-modern overflow-hidden relative group hover:scale-105 transition-transform">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-50 group-hover:opacity-70 transition-opacity`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
              {icon}
            </div>
            
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gradient">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
