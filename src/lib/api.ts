
export interface ExchangeRates {
  bcv: number;
  binance: number;
  euroBcv: number;
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
    const [dolarResponse, euroResponse] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares', { cache: 'no-store' }),
      fetch('https://ve.dolarapi.com/v1/euros', { cache: 'no-store' })
    ]);
    if (!dolarResponse.ok || !euroResponse.ok) throw new Error('Failed to fetch');

    const dolarData: DolarApiRate[] = await dolarResponse.json();
    const euroData: DolarApiRate[] = await euroResponse.json();

    // Map response
    // data[0] is usually Oficial, data[1] is Paralelo. Better to find by 'fuente'
    const oficialRate = dolarData.find(d => d.fuente === 'oficial')?.promedio || 0;
    const paraleloRate = dolarData.find(d => d.fuente === 'paralelo')?.promedio || 0;
    const euroOficialRate = euroData.find(d => d.fuente === 'oficial')?.promedio || 0;


    return {
      bcv: oficialRate,
      binance: paraleloRate,
      euroBcv: euroOficialRate
    };
  } catch (error) {
    console.error("API Error", error);
    return null;
  }
}
