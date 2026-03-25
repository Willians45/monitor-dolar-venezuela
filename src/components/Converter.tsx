"use client";

import { useState, useEffect, useCallback } from "react";
import { ExchangeRates } from "@/lib/api";
import { ArrowLeftRight } from "lucide-react";

interface ConverterProps {
  rates: ExchangeRates;
}

export function Converter({ rates }: ConverterProps) {
  const [values, setValues] = useState({
    ves: "0",
    usd: "0",
    eur: "0",
    usdt: "0"
  });

  const handleValueChange = useCallback((currency: "ves" | "usd" | "eur" | "usdt", value: string) => {
    // allow only numbers and decimals
    const numValue = parseFloat(value) || 0;
    
    let ves = 0;
    if (currency === "ves") ves = numValue;
    else if (currency === "usd") ves = numValue * rates.bcv;
    else if (currency === "eur") ves = numValue * rates.euroBcv;
    else if (currency === "usdt") ves = numValue * rates.binance;

    const usd = ves / rates.bcv;
    const eur = rates.euroBcv > 0 ? ves / rates.euroBcv : 0;
    const usdt = ves / rates.binance;

    setValues({
      ves: currency === "ves" ? value : ves.toFixed(2),
      usd: currency === "usd" ? value : usd.toFixed(2),
      eur: currency === "eur" ? value : eur.toFixed(2),
      usdt: currency === "usdt" ? value : usdt.toFixed(2),
    });
  }, [rates]);

  // Default initial conversion based on 1 USD
  useEffect(() => {
    if (rates.bcv > 0 && values.usd === "0") {
      handleValueChange("usd", "1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.bcv, handleValueChange]);

  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-2 mb-2">
        <ArrowLeftRight className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-white">Conversor</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* VES */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Bolívares (VES)</label>
          <div className="relative">
            <input
              type="number"
              value={values.ves}
              onChange={(e) => handleValueChange("ves", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* USD BCV */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Dólar BCV (USD)</label>
          <div className="relative">
            <input
              type="number"
              value={values.usd}
              onChange={(e) => handleValueChange("usd", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* EUR BCV */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Euro BCV (EUR)</label>
          <div className="relative">
            <input
              type="number"
              value={values.eur}
              onChange={(e) => handleValueChange("eur", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* USDT Binance */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Binance (USDT)</label>
          <div className="relative">
            <input
              type="number"
              value={values.usdt}
              onChange={(e) => handleValueChange("usdt", e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
