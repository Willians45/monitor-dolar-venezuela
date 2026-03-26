"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRates, ExchangeRates } from '@/lib/api';
import { registerPlugin, Capacitor } from '@capacitor/core';

const WidgetSync = registerPlugin<any>('WidgetSync');

export interface HistoryEntry {
    date: string;
    rates: ExchangeRates;
}

export function useRates() {
    const [currentRates, setCurrentRates] = useState<ExchangeRates | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAndSave = useCallback(async (isRefetch = false) => {
        if (isRefetch) {
            setLoading(true);
            setError(false);
        }
        try {
            const rates = await getRates();
            if (rates) {
                // If API returns 0
                if (rates.bcv === 0 || rates.binance === 0 || rates.euroBcv === 0) {
                    setError(true);
                    setLoading(false);
                    return;
                }

                setCurrentRates(rates);

                if (Capacitor.isNativePlatform()) {
                    try {
                        const time = new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' });
                        WidgetSync.syncRates({
                            bcv: rates.bcv.toFixed(2),
                            binance: rates.binance.toFixed(2),
                            euro: rates.euroBcv.toFixed(2),
                            time: time
                        });
                    } catch (e) {
                        console.error("WidgetSync error:", e);
                    }
                }

                const todayStr = new Date().toLocaleDateString('es-VE');
                const storedHistory = localStorage.getItem('rate_history');
                let parsedHistory: HistoryEntry[] = [];

                if (storedHistory) {
                    parsedHistory = JSON.parse(storedHistory);
                }

                const alreadyToday = parsedHistory.find(h => h.date === todayStr);
                let newHistory = parsedHistory;

                if (!alreadyToday) {
                    newHistory = [...parsedHistory, { date: todayStr, rates }];
                    localStorage.setItem('rate_history', JSON.stringify(newHistory));
                } else {
                    newHistory = parsedHistory.map(h => h.date === todayStr ? { date: todayStr, rates } : h);
                    localStorage.setItem('rate_history', JSON.stringify(newHistory));
                }

                setHistory(newHistory);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Fetch offline or failed:", err);
            
            // Fallback to localStorage if available
            const storedHistory = localStorage.getItem('rate_history');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                const lastEntry = parsedHistory[parsedHistory.length - 1];
                if (lastEntry) {
                    setCurrentRates(lastEntry.rates);
                    setHistory(parsedHistory);
                    setLoading(false);
                    return; // Proceed without setting error state
                }
            }
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAndSave();
    }, [fetchAndSave]);

    const refetch = async () => {
        await fetchAndSave(true);
    };

    return { currentRates, history, loading, error, refetch };
}
