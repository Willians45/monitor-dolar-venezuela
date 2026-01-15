import { HistoryEntry } from "@/hooks/useRates";

interface HistoryTableProps {
    data: HistoryEntry[];
}

export function HistoryTable({ data }: HistoryTableProps) {
    if (data.length === 0) {
        return <div className="text-center text-gray-500 py-10">No hay historial disponible aún.</div>;
    }

    // Sort by date descending
    const sortedData = [...data].reverse();

    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-200 uppercase font-medium text-xs">
                    <tr>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Binance</th>
                        <th className="px-6 py-4">BCV</th>
                        <th className="px-6 py-4">Diferencia</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sortedData.map((entry, idx) => {
                        const gap = entry.rates.binance - entry.rates.bcv;
                        const gapPercent = ((gap / entry.rates.bcv) * 100).toFixed(2);

                        return (
                            <tr key={idx} className="hover:bg-white/5 transition">
                                <td className="px-6 py-4 font-medium text-white">{entry.date}</td>
                                <td className="px-6 py-4 text-yellow-500 font-bold">{entry.rates.binance.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</td>
                                <td className="px-6 py-4 text-blue-400">{entry.rates.bcv.toLocaleString('es-VE', { style: 'currency', currency: 'VES' })}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                                        {gapPercent}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
