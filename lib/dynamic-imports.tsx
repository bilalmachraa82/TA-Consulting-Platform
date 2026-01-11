import dynamic from 'next/dynamic';
import React from 'react';

export const ChartBar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-lg" />
});

export const ChartDoughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted/10 animate-pulse rounded-full" />
});
