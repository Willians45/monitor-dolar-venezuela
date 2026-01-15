import clsx from 'clsx';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

interface RateCardProps {
    title: string;
    rate: number;
    prevRate?: number; // For future diff calculation if we had yesterday's exact same-time rate
    icon?: React.ReactNode;
    colorClass?: string;
    delay?: number;
}

export function RateCard({ title, rate, icon, colorClass = "bg-blue-500", delay = 0 }: RateCardProps) {
    const formattedRate = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(rate);

    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl transition-all duration-700 hover:scale-[1.02]",
                "bg-white/5",
                "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            <div className={clsx("absolute top-0 right-0 p-4 opacity-20", colorClass)}>
                {icon ? (
                    <div className="w-[100px] h-[100px] flex items-center justify-center -mr-4 -mt-4 [&>svg]:w-full [&>svg]:h-full">
                        {icon}
                    </div>
                ) : (
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="40" />
                    </svg>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white tracking-tight">{formattedRate}</span>
                    <span className="text-xs text-gray-400 font-mono">VES</span>
                </div>
            </div>
        </div>
    );
}
