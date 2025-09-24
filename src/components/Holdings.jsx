import React, { useEffect, useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

const STORAGE_KEY = "portfolioTransactions"
const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"]

function loadTx() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function Holdings(){
  const [tx, setTx] = useState([])
  useEffect(()=>{ setTx(loadTx()) },[])

  const holdings = useMemo(()=>{
    const map = {}
    tx.forEach(t=>{
      const key = t.ticker
      if(!map[key]) map[key]={ticker:key, qty:0, invested:0}
      if(t.type==="BUY"){
        map[key].qty += t.qty
        map[key].invested += t.amount
      } else if(t.type==="SELL"){
        map[key].qty -= t.qty
        map[key].invested -= t.amount
      }
    })
    return Object.values(map).filter(h=>h.qty>0).map(h=>{
      const avgPrice = h.invested/h.qty
      const lastPrice = avgPrice
      const value = h.qty*lastPrice
      const pnl = value - h.invested
      const pnlPct = (pnl/h.invested)*100
      return {...h, avgPrice, lastPrice, value, pnl, pnlPct}
    })
  },[tx])

  const totalValue = holdings.reduce((s,h)=>s+h.value,0)
  const allocationData = holdings.map(h=>({name:h.ticker, value: h.value}))

  const sectors = [
    {name:"Tech", value: totalValue*0.5},
    {name:"Finance", value: totalValue*0.3},
    {name:"Other", value: totalValue*0.2}
  ]
  const regions = [
    {name:"US", value: totalValue*0.6},
    {name:"Europe", value: totalValue*0.3},
    {name:"Asia", value: totalValue*0.1}
  ]

  const target = {actions:70, obligations:30}
  const realActions = 70
  const realOblig = 30
  const allocationCompare=[
    {name:"Actions", Cible:target.actions, Réelle:realActions},
    {name:"Obligations", Cible:target.obligations, Réelle:realOblig}
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Holdings</h2>
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr><th className="p-2">Ticker</th><th className="p-2">Qty</th><th className="p-2">Prix moyen</th><th className="p-2">Valeur</th><th className="p-2">P&L</th><th className="p-2">% Portefeuille</th></tr></thead>
          <tbody>
            {holdings.map(h=>(<tr key={h.ticker} className="border-b">
              <td className="p-2">{h.ticker}</td>
              <td className="p-2">{h.qty}</td>
              <td className="p-2">€{h.avgPrice.toFixed(2)}</td>
              <td className="p-2">€{h.value.toFixed(2)}</td>
              <td className={"p-2 "+(h.pnl>=0?"text-green-600":"text-red-600")}>
                €{h.pnl.toFixed(2)} ({h.pnlPct.toFixed(1)}%)
              </td>
              <td className="p-2">{((h.value/totalValue)*100).toFixed(1)}%</td>
            </tr>))}
            {holdings.length===0 && <tr><td colSpan="6" className="text-center p-4 text-gray-500">Aucune position</td></tr>}
          </tbody>
        </table>
        <div className="mt-2 font-semibold">Total portefeuille : €{totalValue.toFixed(2)}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow h-64"><h3 className="font-semibold mb-2">Répartition par titre</h3><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocationData} dataKey="value" nameKey="name" outerRadius={80} label>{allocationData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Legend/></PieChart></ResponsiveContainer></div>
        <div className="bg-white p-4 rounded shadow h-64"><h3 className="font-semibold mb-2">Répartition par secteur</h3><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sectors} dataKey="value" nameKey="name" outerRadius={80} label>{sectors.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Legend/></PieChart></ResponsiveContainer></div>
        <div className="bg-white p-4 rounded shadow h-64"><h3 className="font-semibold mb-2">Répartition par région</h3><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={regions} dataKey="value" nameKey="name" outerRadius={80} label>{regions.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Legend/></PieChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white p-4 rounded shadow h-64"><h3 className="font-semibold mb-2">Allocation cible vs réelle</h3><ResponsiveContainer width="100%" height="100%"><BarChart data={allocationCompare}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Cible" fill="#2563eb" /><Bar dataKey="Réelle" fill="#f59e0b" /></BarChart></ResponsiveContainer></div>
    </div>
  )
}
