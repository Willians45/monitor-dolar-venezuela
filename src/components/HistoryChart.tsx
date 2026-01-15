"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import clsx from "clsx";
import { HistoryEntry } from "@/hooks/useRates";

interface HistoryChartProps {
    data: HistoryEntry[];
}

export function HistoryChart({ data }: HistoryChartProps) {
    // Transform data for chart
    const chartData = data.map(item => ({
        date: item.date, // Assuming date is "DD/MM/YYYY" or similar locale string
        bcv: item.rates.bcv,
        binance: item.rates.binance
    }));

    if (data.length === 0) {
        return <div className="text-center text-gray-500 py-10">Esperando datos de mañana...</div>;
    }

    return (
        <div className="w-full h-[300px] p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Historial Diferencial</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickFormatter={(value) => `${value}`}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        itemStyle={{ color: '#e5e7eb' }}
                        formatter={(value: number) => [`${value.toFixed(2)} VES`, '']}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="bcv"
                        name="BCV"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="binance"
                        name="Binance"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#f59e0b' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
