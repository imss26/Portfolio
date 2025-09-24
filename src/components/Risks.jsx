import React, { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const fmt2 = (x) => (isFinite(x) ? Number(x).toFixed(2) : "0.00")

// Petite projection DCA pour générer une courbe (240 mois = 20 ans)
function projectSeries(months = 240, annualReturn = 0.06, monthlyInvest = 100) {
  const mRate = Math.pow(1 + annualReturn, 1 / 12) - 1
  let value = 0
  const data = []
  for (let m = 1; m <= months; m++) {
    value = (value + monthlyInvest) * (1 + mRate)
    data.push({ m, value })
  }
  return data
}

function seriesReturns(data) {
  const rets = []
  for (let i = 1; i < data.length; i++) {
    const r = data[i].value / data[i - 1].value - 1
    rets.push(r)
  }
  return rets
}

function volatility(returns) {
  if (returns.length === 0) return 0
  const mean = returns.reduce((s, x) => s + x, 0) / returns.length
  const variance = returns.reduce((s, x) => s + (x - mean) ** 2, 0) / returns.length
  return Math.sqrt(variance) * Math.sqrt(12) // annualisée
}

function maxDrawdown(data) {
  let peak = -Infinity
  let mdd = 0
  data.forEach((p) => {
    peak = Math.max(peak, p.value)
    const dd = p.value / peak - 1
    if (dd < mdd) mdd = dd
  })
  return mdd
}

function sharpe(returns, rf = 0) {
  if (returns.length === 0) return 0
  // Approx ann. return via produit des (1+r) puis annualisation
  const total = returns.reduce((acc, r) => acc * (1 + r), 1)
  const annRet = Math.pow(total, 12 / returns.length) - 1
  const vol = volatility(returns)
  return vol > 0 ? (annRet - rf) / vol : 0
}

export default function Risks() {
  // Scénario neutre : 6%/an, 100€/mois
  const base = useMemo(() => projectSeries(240, 0.06, 100), [])
  // Stress test : -20% instantané sur la dernière valeur (choc de marché)
  const shockCrash = useMemo(
    () => base.map((p, i) => (i === base.length - 1 ? { m: p.m, value: p.value * 0.8 } : p)),
    [base]
  )

  const retsBase = useMemo(() => seriesReturns(base), [base])
  const retsCrash = useMemo(() => seriesReturns(shockCrash), [shockCrash])

  const volBase = volatility(retsBase)
  const volCrash = volatility(retsCrash)
  const mddBase = maxDrawdown(base)
  const mddCrash = maxDrawdown(shockCrash)
  const sharpeBase = sharpe(retsBase, 0.0)
  const sharpeCrash = sharpe(retsCrash, 0.0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Risks & Stress Tests</h2>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Volatilité (annuelle)</div>
          <div className="text-2xl font-semibold">{fmt2(volBase * 100)}%</div>
          <div className="text-xs text-gray-500">Stress (-20%) : {fmt2(volCrash * 100)}%</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Max Drawdown</div>
          <div className="text-2xl font-semibold">{fmt2(mddBase * 100)}%</div>
          <div className="text-xs text-gray-500">Stress (-20%) : {fmt2(mddCrash * 100)}%</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Sharpe</div>
          <div className="text-2xl font-semibold">{fmt2(sharpeBase)}</div>
          <div className="text-xs text-gray-500">Stress (-20%) : {fmt2(sharpeCrash)}</div>
        </div>
      </div>

      {/* Courbe base vs stress */}
      <div className="bg-white p-4 rounded shadow h-96">
        <h3 className="font-semibold mb-2">Courbe valeur — Base vs Stress (-20% actions)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <XAxis dataKey="m" type="number" domain={['dataMin', 'dataMax']} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line data={base} dataKey="value" name="Base" stroke="#2563eb" dot={false} />
            <Line data={shockCrash} dataKey="value" name="Stress -20%" stroke="#ef4444" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
