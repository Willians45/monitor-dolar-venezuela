"use client";

import { useRates } from "@/hooks/useRates";
import { RateCard } from "@/components/RateCard";
import { HistoryChart } from "@/components/HistoryChart";
import { HistoryTable } from "@/components/HistoryTable";
import { Loader2, AlertCircle, Landmark, Bitcoin, Euro } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { Converter } from "@/components/Converter";
import { PullToRefresh } from "@/components/PullToRefresh";

import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const { currentRates, history, loading, error, refetch } = useRates();
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Immersive UI handling for Android
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Dark });
    }
    setCurrentDate(new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error("SW Registration failed", err);
        });
      });
    }
  }, []);

  if (loading && !currentRates) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-[#ededed]/50 text-sm">Cargando tasas...</p>
      </div>
    );
  }

  if (error && !currentRates) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-[#ededed] px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error al cargar tasas</h1>
        <p className="text-gray-400 text-center">No se pudo conectar con las fuentes de datos. Intente más tarde.</p>
        <button
          onClick={() => refetch()}
          className="mt-6 px-6 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Ensure currentRates exists for rendering
  if (!currentRates) return null;

  const gap = currentRates.binance - currentRates.bcv;
  const gapPercent = ((gap / currentRates.bcv) * 100).toFixed(2);

  return (
    <PullToRefresh onRefresh={refetch}>
      <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans pb-10 transition-colors duration-300">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4 flex flex-col gap-6" style={{ 
          paddingTop: 'calc(1rem + env(safe-area-inset-top))',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right))'
        }}>

          {/* Header */}
          <header className="flex justify-between items-start pt-2 pb-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Monitor Dólar
              </h1>
              <p className="text-gray-400 text-sm">
                Tasas actualizadas al momento para Venezuela
              </p>
              <div className="text-xs text-gray-500 mt-1 capitalize">
                {currentDate}
              </div>
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
              
              {/* Refetch Indicator */}
              {loading && <div className="text-xs text-center text-blue-500 animate-pulse">Actualizando tasas...</div>}

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
                  title="Euro BCV"
                  rate={currentRates.euroBcv}
                  colorClass="text-indigo-400"
                  delay={100}
                  icon={<Euro strokeWidth={1.5} />}
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

              {/* Converter */}
              <Converter rates={currentRates} />

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
          <footer className="py-6 text-center flex flex-col gap-2 text-xs text-gray-500">
            <p>Datos referenciales. No representa consejo financiero.</p>
            <p>Desliza hacia abajo para actualizar las tasas.</p>
          </footer>

        </div>
      </main>
    </PullToRefresh>
  );
}
