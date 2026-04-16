import { useState, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Info,
  ChevronRight,
  RefreshCcw,
  Boxes,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Help tooltips/descriptions in Spanish as per user template
const TOOL_TIPS = {
  trm: "Tasa Representativa del Mercado (COP por USD)",
  vm3: "Valor contratado con el Club de Importadores por metro cúbico",
  pml: "Comisión que cobra MercadoLibre según la categoría y tipo de publicación (ej. 16%)",
  imp: "Impuestos fijos que aplica MercadoLibre por venta",
  envio: "Costo de envío si lo ofrece el vendedor (o 0 si lo paga el comprador)"
};

export default function App() {
  // --- States ---
  const [trm, setTrm] = useState<number>(3623);
  const [precioUsd, setPrecioUsd] = useState<number | ''>('');
  const [fleteChinaUsd, setFleteChinaUsd] = useState<number>(0);
  const [l1, setL1] = useState<number | ''>('');
  const [l2, setL2] = useState<number | ''>('');
  const [l3, setL3] = useState<number | ''>('');
  const [cajas, setCajas] = useState<number>(1);
  const [vm3, setVm3] = useState<number>(2400000);
  const [unidades, setUnidades] = useState<number | ''>('');
  const [pVenta, setPVenta] = useState<number | ''>('');
  const [pMl, setPMl] = useState<number>(16);
  const [impuestosFijos, setImpuestosFijos] = useState<number>(1912);
  const [envioMl, setEnvioMl] = useState<number>(0);

  const [showResults, setShowResults] = useState(false);

  // --- Logic ---
  const results = useMemo(() => {
    if (!precioUsd || !pVenta || !unidades) return null;

    const pu = Number(precioUsd);
    const pv = Number(pVenta);
    const und = Number(unidades);
    const dim1 = Number(l1) || 0;
    const dim2 = Number(l2) || 0;
    const dim3 = Number(l3) || 0;

    // Alibaba & Transaction Costs
    const precioCop = pu * trm;
    const comAliUsd = 0.03 * pu;
    const comAliCop = comAliUsd * trm;
    const subtotalUsd = pu + comAliUsd;
    const subtotalCop = precioCop + comAliCop;
    // REMOVED: cuatroMil = subtotalCop * 4 / 1000;

    // Logistics (Club Importadores)
    const volCaja = dim1 * dim2 * dim3;
    const volTotal = volCaja * cajas;
    const fleteTotalCop = volTotal * vm3;
    const fleteUnd = und > 0 ? fleteTotalCop / und : 0;

    // Internal China
    const fleteChinaCop = fleteChinaUsd * trm;

    // Unit Cost Calculation (REMOVED 4x1000)
    const costoUnd = subtotalCop + fleteUnd;

    // Total Investment
    const inversionTotal = (costoUnd * und) + fleteChinaCop;

    // MercadoLibre
    const comMlVal = pv * (pMl / 100);
    // impuestosFijos is already in state, being used here
    const gananciaBrutaMl = pv - comMlVal - impuestosFijos - envioMl;

    // Final Profitability
    const facturacionUnd = gananciaBrutaMl;
    const utilidadUnd = facturacionUnd - costoUnd;
    const facturacionTotal = facturacionUnd * und;
    const utilidadTotal = facturacionTotal - inversionTotal;
    const porcentajeUtilidad = facturacionTotal > 0 ? utilidadTotal / facturacionTotal : 0;

    return {
      precioCop,
      comAliCop,
      fleteChinaCop,
      fleteUnd,
      costoUnd,
      inversionTotal,
      facturacionUnd,
      utilidadUnd,
      facturacionTotal,
      utilidadTotal,
      porcentajeUtilidad,
      volTotal,
      // USD conversions
      costoUndUsd: costoUnd / trm,
      facturacionUndUsd: facturacionUnd / trm,
      utilidadUndUsd: utilidadUnd / trm,
      utilidadTotalUsd: utilidadTotal / trm,
      facturacionTotalUsd: facturacionTotal / trm,
      inversionTotalUsd: inversionTotal / trm
    };
  }, [trm, precioUsd, fleteChinaUsd, l1, l2, l3, cajas, vm3, unidades, pVenta, pMl, impuestosFijos, envioMl]);

  const handleCalculate = () => {
    if (!precioUsd || !pVenta || !unidades) {
      alert("Por favor completa los campos principales: Precio Alibaba, Precio de Venta y Unidades.");
      return;
    }
    setShowResults(true);
  };

  const formatCop = (n: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const formatUsd = (n: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="min-h-screen bg-bg text-zinc-50 font-sans p-6 lg:p-8 flex flex-col gap-6 max-w-[1200px] mx-auto selection:bg-zinc-800 selection:text-emerald-400">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-800 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Rentabilidad</h1>
          <p className="text-zinc-500 text-sm mt-1">Logística de importación · China a MercadoLibre Colombia</p>
        </div>
        <div className="flex flex-col items-start md:items-end group">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">TRM Actual</span>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 focus-within:border-emerald-500/50 transition-colors">
            <span className="text-zinc-600 font-mono text-sm leading-none">$</span>
            <input 
              type="number" 
              value={trm} 
              onChange={(e) => setTrm(Number(e.target.value))}
              className="bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 w-24 outline-none font-mono"
            />
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_300px] gap-4 flex-grow">
        {/* Input Panel (Left Column) */}
        <section className="bg-card border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 md:row-span-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Parámetros del Pedido</div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 ml-0.5">Precio Unitario (Alibaba)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">$</span>
                <input 
                  type="number" 
                  value={precioUsd} 
                  onChange={(e) => setPrecioUsd(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="4.25"
                  className="w-full pl-7 pr-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 ml-0.5">Unidades</label>
                <input 
                  type="number" 
                  value={unidades} 
                  onChange={(e) => setUnidades(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 ml-0.5">Flete China</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={fleteChinaUsd} 
                    onChange={(e) => setFleteChinaUsd(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Cubicaje (Cajas)</div>
            <div className="grid grid-cols-3 gap-2">
              {[l1, l2, l3].map((val, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] text-zinc-600 block text-center uppercase tracking-wider">{['L', 'W', 'H'][i]} (m)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={val} 
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : Number(e.target.value);
                      if (i === 0) setL1(v); else if (i === 1) setL2(v); else setL3(v);
                    }}
                    placeholder="0.40"
                    className="w-full px-2 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs text-center focus:border-zinc-600 transition-colors outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 ml-0.5">Nº Cajas</label>
                <input type="number" value={cajas} onChange={(e) => setCajas(Number(e.target.value))} className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 ml-0.5">m³ Club</label>
                <input type="number" value={vm3} onChange={(e) => setVm3(Number(e.target.value))} className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-600 transition-colors outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">MercadoLibre</div>
            <div className="space-y-2">
                <label className="text-[11px] text-zinc-500 ml-0.5">Precio de Venta</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={pVenta} 
                    onChange={(e) => setPVenta(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-500 ml-0.5">Comisión %</label>
                  <input type="number" value={pMl} onChange={(e) => setPMl(Number(e.target.value))} className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-zinc-500 ml-0.5">Impuesto COP</label>
                  <input type="number" value={impuestosFijos} onChange={(e) => setImpuestosFijos(Number(e.target.value))} className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-sm focus:border-zinc-600 transition-colors outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[11px] text-zinc-500 ml-0.5">Envío COP</label>
                  <input type="number" value={envioMl} onChange={(e) => setEnvioMl(Number(e.target.value))} className="w-full px-3 py-2 bg-bg border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:border-zinc-600 transition-colors outline-none" />
                </div>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full mt-auto bg-zinc-50 hover:bg-white text-zinc-950 py-3 px-4 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-[0.98] cursor-pointer"
          >
            RECALCULAR ESCENARIO
          </button>
        </section>

        {/* Hero Result Card */}
        <section className={`bg-card border border-zinc-800 rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-500 ${!showResults ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent)] pointer-events-none" />
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4 z-10">Rentabilidad Estimada</div>
          <div className={`text-7xl lg:text-8xl font-extrabold tracking-tighter z-10 ${
            !results ? 'text-zinc-500' :
            results.porcentajeUtilidad >= 0.4 ? 'text-emerald-500' : 
            results.porcentajeUtilidad >= 0.2 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {results ? (results.porcentajeUtilidad * 100).toFixed(1) : '--'}%
          </div>
          <div className="text-zinc-500 text-sm mt-4 z-10 max-w-[200px] leading-snug">
            {results ? `Total: ${formatUsd(results.utilidadTotalUsd)} USD` : 'Margen de utilidad neta sobre ventas'}
          </div>
        </section>

        {/* Breakdown Card (Right Column) */}
        <section className={`bg-card border border-zinc-800 rounded-2xl p-6 md:row-span-2 transition-all duration-500 ${!showResults ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6 font-sans">Estructura de Costos (Unit)</div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Producto (TRM)', value: results?.precioCop },
              { label: 'Comisión Alibaba (3%)', value: results?.comAliCop },
              { label: 'Flete Internacional', value: results?.fleteUnd },
              { label: 'Comisión ML', value: (Number(pVenta || 0) * (pMl / 100)) },
              { label: 'Impuesto / Envío ML', value: (impuestosFijos + envioMl) },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center text-[13px] border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500 font-sans">{row.label}</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-zinc-100 leading-none">{row.value ? formatCop(row.value) : '--'}</span>
                  <span className="font-mono text-[10px] text-zinc-600 mt-1">{row.value ? formatUsd(row.value / trm) : ''}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center text-[15px] font-bold pt-2 mt-1">
              <span className="text-zinc-100 font-sans">Costo Total</span>
              <div className="flex flex-col items-end">
                <span className="font-mono text-zinc-50 leading-none">{results ? formatCop(results.costoUnd + (Number(pVenta || 0) * (pMl / 100)) + envioMl + impuestosFijos) : '--'}</span>
                <span className="font-mono text-xs text-zinc-500 mt-1">{results ? formatUsd(results.costoUndUsd + (Number(pVenta || 0) * (pMl / 100) / trm) + (envioMl / trm) + (impuestosFijos / trm)) : ''}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Inversión Inicial</div>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-bold font-mono text-zinc-50">
                {results ? formatCop(results.inversionTotal) : '--'}
              </div>
              <div className="text-xs font-mono text-zinc-500">
                {results ? `${formatUsd(results.inversionTotalUsd)} USD` : '--'}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">Capital requerido para {unidades || '--'} unidades</p>
          </div>
        </section>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 gap-4 transition-all duration-500 ${!showResults ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className="bg-card border border-zinc-800 rounded-2xl p-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">Utilidad Total</div>
            <div className="text-2xl font-bold font-mono text-emerald-500">
              {results ? formatCop(results.utilidadTotal) : '--'}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              {results ? `${formatUsd(results.utilidadTotalUsd)} USD` : '--'}
            </div>
          </div>
          <div className="bg-card border border-zinc-800 rounded-2xl p-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-3">Utilidad / Unidad</div>
            <div className="text-2xl font-bold font-mono text-zinc-50">
              {results ? formatCop(results.utilidadUnd) : '--'}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              {results ? `${formatUsd(results.utilidadUndUsd)} USD` : '--'}
            </div>
          </div>
        </div>

        {/* Verdict Card */}
        <section className={`bg-zinc-50/5 border border-emerald-500/20 rounded-2xl p-6 lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all duration-500 ${!showResults ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-zinc-950 font-bold text-2xl ${
            !results ? 'bg-zinc-800' :
            results.porcentajeUtilidad >= 0.4 ? 'bg-emerald-500' : 
            results.porcentajeUtilidad >= 0.2 ? 'bg-amber-500' : 'bg-rose-500'
          }`}>
            {results?.porcentajeUtilidad >= 0.4 ? '✓' : results?.porcentajeUtilidad >= 0 ? '!' : '×'}
          </div>
          <div className="flex flex-col gap-1">
            <h4 className={`font-bold tracking-tight ${
              !results ? 'text-zinc-500' :
              results.porcentajeUtilidad >= 0.4 ? 'text-emerald-500' : 
              results.porcentajeUtilidad >= 0.2 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {results?.porcentajeUtilidad >= 0.4 ? 'Producto Altamente Rentable' : 
               results?.porcentajeUtilidad >= 0.2 ? 'Producto con Margen Aceptable' :
               results?.porcentajeUtilidad > 0 ? 'Margen bajo / Riesgo Alto' : 'Pérdida Proyectada'}
            </h4>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
              {results?.porcentajeUtilidad >= 0.4 ? 'El margen neto supera el umbral del 40%. Este producto es ideal para escalamiento agresivo en MercadoLibre con pauta publicitaria.' : 
               results?.porcentajeUtilidad >= 0.2 ? 'Nivel óptimo para validación inicial. Se recomienda buscar eficiencias logísticas para subir al umbral del 40%.' :
               results?.porcentajeUtilidad > 0 ? 'Cuidado. Los gastos operativos o devoluciones podrían absorber la utilidad. Reevalúa costos de origen.' : 'Los números no cierran. Busca un proveedor con mejor precio o sube el precio de venta.'}
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center mt-6">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] py-4">Validación Técnica de Marketplace · 2024</p>
      </footer>
    </div>
  );
}
