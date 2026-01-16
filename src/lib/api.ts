
export interface ExchangeRates {
  bcv: number;
  binance: number;
}

interface DolarApiRate {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export async function getRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch');

    const data: DolarApiRate[] = await response.json();

    // Map response
    // data[0] is usually Oficial, data[1] is Paralelo. Better to find by 'fuente'
    const oficialRate = data.find(d => d.fuente === 'oficial')?.promedio || 0;
    const paraleloRate = data.find(d => d.fuente === 'paralelo')?.promedio || 0;


    return {
      bcv: oficialRate,
      binance: paraleloRate
    };
  } catch (error) {
    console.error("API Error", error);
    return null;
  }
}
