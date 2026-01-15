"use client";

import { useState, useEffect } from 'react';
import { getRates, ExchangeRates } from '@/lib/api';

export interface HistoryEntry {
    date: string;
    rates: ExchangeRates;
}

export function useRates() {
    const [currentRates, setCurrentRates] = useState<ExchangeRates | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchAndSave = async () => {
            try {
                const rates = await getRates();
                if (rates) {
                    // Fix: If API returns 0 (failed scrape but success 200), treat as error/stale
                    if (rates.bcv === 0 || rates.binance === 0) {
                        setError(true);
                        setLoading(false);
                        return;
                    }

                    setCurrentRates(rates);

                    // History Logic
                    const todayStr = new Date().toLocaleDateString('es-VE');

                    const storedHistory = localStorage.getItem('rate_history');
                    let parsedHistory: HistoryEntry[] = [];

                    if (storedHistory) {
                        parsedHistory = JSON.parse(storedHistory);
                    }

                    // Check if today is already recorded
                    const alreadyToday = parsedHistory.find(h => h.date === todayStr);

                    let newHistory = parsedHistory;
                    if (!alreadyToday) {
                        newHistory = [...parsedHistory, { date: todayStr, rates }];
                        localStorage.setItem('rate_history', JSON.stringify(newHistory));
                    } else {
                        // Optional: Update today's rate if it changed? 
                        // For simple "daily check", keeping the first morning check or updating is a choice.
                        // Let's update it to keep it fresh.
                        newHistory = parsedHistory.map(h => h.date === todayStr ? { date: todayStr, rates } : h);
                        localStorage.setItem('rate_history', JSON.stringify(newHistory));
                    }

                    setHistory(newHistory);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSave();
    }, []);

    return { currentRates, history, loading, error };
}
