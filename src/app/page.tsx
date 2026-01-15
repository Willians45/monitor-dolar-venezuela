"use client";

import { useRates } from "@/hooks/useRates";
import { RateCard } from "@/components/RateCard";
import { HistoryChart } from "@/components/HistoryChart";
import { HistoryTable } from "@/components/HistoryTable";
import { Loader2, AlertCircle, Landmark, Bitcoin } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

export default function Home() {
  const { currentRates, history, loading, error } = useRates();
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Fix hydration issue for date
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !currentRates) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error al cargar tasas</h1>
        <p className="text-gray-400 text-center">No se pudo conectar con las fuentes de datos. Intente más tarde.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const gap = currentRates.binance - currentRates.bcv;
  const gapPercent = ((gap / currentRates.bcv) * 100).toFixed(2);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 font-sans pb-10">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto p-4 flex flex-col gap-6">

        {/* Header */}
        <header className="flex flex-col gap-2 pt-6 pb-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Monitor Dólar
          </h1>
          <p className="text-gray-400 text-sm">
            Tasas actualizadas al momento para Venezuela
          </p>
          <div className="text-xs text-gray-500 mt-1 capitalize">
            {currentDate}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('monitor')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'monitor' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            Monitor
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === 'history' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            Historial
          </button>
        </div>

        {/* Content */}
        {activeTab === 'monitor' ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Rate Cards Grid */}
            <div className="grid gap-4">
              <RateCard
                title="Dólar BCV"
                rate={currentRates.bcv}
                colorClass="text-blue-500"
                delay={0}
                icon={<Landmark strokeWidth={1.5} />}
              />
              <RateCard
                title="Binance USDT"
                rate={currentRates.binance}
                colorClass="text-yellow-500"
                delay={200}
                icon={<Bitcoin strokeWidth={1.5} />}
              />
            </div>

            {/* Differential Stats */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 backdrop-blur-md">
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Brecha Cambiaria</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white">{gapPercent}%</span>
                <span className="text-sm text-gray-400 mb-1">diferencia (Binance vs BCV)</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                1 USDT = {currentRates.binance.toFixed(2)} VES vs 1 USD BCV = {currentRates.bcv.toFixed(2)} VES
              </div>
            </div>

            {/* Chart Preview */}
            <div className="pt-2">
              <HistoryChart data={history} />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HistoryTable data={history} />
            <p className="text-center text-xs text-gray-500 mt-4">El historial se guarda localmente en tu dispositivo desde el primer día de uso.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-gray-600">
          <p>Datos referenciales. No representa consejo financiero.</p>
        </footer>

      </div>
    </main>
  );
}
