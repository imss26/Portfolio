import React, { useEffect, useMemo, useState } from "react"

const MACRO_KEY = "macroSettings"
const DCA_KEY = "dcaSettings"
const DEFAULT_TARGET = { stocks: 70, bonds: 30 }

function loadMacro() {
  try { const raw = localStorage.getItem(MACRO_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
function saveMacro(obj) { localStorage.setItem(MACRO_KEY, JSON.stringify(obj)) }
function loadDCA() {
  try { const raw = localStorage.getItem(DCA_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
const fmt2 = (x) => (isFinite(x) ? Number(x).toFixed(2) : "0.00")

export default function Inflation(){
  const [macro, setMacro] = useState(loadMacro() || {
    inflation: 0.02, threshold: 0.04,
    highInflStocks: 60, highInflBonds: 40,
    baseStocks: DEFAULT_TARGET.stocks, baseBonds: DEFAULT_TARGET.bonds,
    notes: ""
  })
  const dca = loadDCA()

  useEffect(()=>{ saveMacro(macro) },[macro])

  const recommended = useMemo(()=>{
    const inf = Number(macro.inflation)||0
    const th = Number(macro.threshold)||0
    if (inf > th) {
      return { stocks: Number(macro.highInflStocks)||0, bonds: Number(macro.highInflBonds)||0, reason: "Inflation au-dessus du seuil" }
    }
    return { stocks: Number(macro.baseStocks)||DEFAULT_TARGET.stocks, bonds: Number(macro.baseBonds)||DEFAULT_TARGET.bonds, reason: "Inflation sous le seuil" }
  }, [macro])

  const nominalReturnPct = dca?.returnRate ? (dca.returnRate * 100) : 6
  const inflationPct = (Number(macro.inflation)||0) * 100
  const realReturnPct = ((1 + (nominalReturnPct/100)) / (1 + (inflationPct/100)) - 1) * 100

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Inflation & Macro</h2>

      {/* Paramètres */}
      <div className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600">Inflation estimée (%)</label>
          <input type="number" step="0.01"
            value={fmt2((macro.inflation||0)*100)}
            onChange={e=>setMacro({...macro, inflation: Number(e.target.value)/100})}
            className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Seuil réallocation (%)</label>
          <input type="number" step="0.01"
            value={fmt2((macro.threshold||0)*100)}
            onChange={e=>setMacro({...macro, threshold: Number(e.target.value)/100})}
            className="border rounded p-2 w-full" />
        </div>
        <div className="flex items-end">
          <div className="text-gray-700">Inflation actuelle : <b>{fmt2(inflationPct)}%</b></div>
        </div>
      </div>

      {/* Règles */}
      <div className="bg-white rounded shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Allocation de base (si inflation ≤ seuil)</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Actions (%)<input type="number" step="0.01" value={fmt2(macro.baseStocks)} onChange={e=>setMacro({...macro, baseStocks: Number(e.target.value)})} className="border rounded p-2 w-full"/></label>
            <label className="text-sm">Obligations (%)<input type="number" step="0.01" value={fmt2(macro.baseBonds)} onChange={e=>setMacro({...macro, baseBonds: Number(e.target.value)})} className="border rounded p-2 w-full"/></label>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Si inflation &gt; seuil</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Actions (%)<input type="number" step="0.01" value={fmt2(macro.highInflStocks)} onChange={e=>setMacro({...macro, highInflStocks: Number(e.target.value)})} className="border rounded p-2 w-full"/></label>
            <label className="text-sm">Obligations (%)<input type="number" step="0.01" value={fmt2(macro.highInflBonds)} onChange={e=>setMacro({...macro, highInflBonds: Number(e.target.value)})} className="border rounded p-2 w-full"/></label>
          </div>
        </div>
      </div>

      {/* Recommandation */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Recommandation d'allocation</h3>
        <p className="text-gray-700 mb-2">Motif : <b>{recommended.reason}</b></p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">Actions recommandées : <b>{fmt2(recommended.stocks)}%</b></div>
          <div className="bg-gray-50 p-3 rounded">Obligations recommandées : <b>{fmt2(recommended.bonds)}%</b></div>
          <div className="bg-gray-50 p-3 rounded">Somme : <b>{fmt2((recommended.stocks||0)+(recommended.bonds||0))}%</b></div>
        </div>
      </div>

      {/* Impact rendement réel */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Impact sur rendement réel</h3>
        <p className="text-gray-700">Rendement attendu (nominal, DCA) : <b>{fmt2(nominalReturnPct)}%</b></p>
        <p className="text-gray-700">Inflation : <b>{fmt2(inflationPct)}%</b></p>
        <p className="text-gray-900">Rendement réel estimé : <b>{fmt2(realReturnPct)}%</b></p>
        {!dca && <p className="text-sm text-gray-500 mt-2">Astuce : configure le rendement attendu dans l'onglet DCA pour un calcul plus précis.</p>}
      </div>

      {/* Notes */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Notes / Analyse macro</h3>
        <textarea rows={6} className="border rounded p-3 w-full"
          placeholder="Tes notes (BCE, emploi, PMI, spreads, etc.)"
          value={macro.notes} onChange={e=>setMacro({...macro, notes: e.target.value})} />
        <div className="text-sm text-gray-500 mt-2">Les notes sont sauvegardées automatiquement (LocalStorage).</div>
      </div>
    </div>
  )
}
