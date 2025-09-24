import React, { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

const STORAGE_KEY = "dcaSettings"

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function saveSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function projectDCA(monthly, years, returnRate, inflation){
  const months = years*12
  let invested=0, value=0
  const out=[]
  const monthlyRate = Math.pow(1+returnRate,1/12)-1
  const inflationRate = Math.pow(1+inflation,1/12)-1
  for(let m=1;m<=months;m++){
    invested+=monthly
    value=(value+monthly)*(1+monthlyRate)
    const realValue = value/Math.pow(1+inflationRate,m)
    out.push({month:m, invested, nominal:value, real:realValue})
  }
  return out
}

export default function DCA(){
  const [settings,setSettings] = useState(loadSettings()||{
    monthly:100,
    years:20,
    returnRate:0.06,
    inflation:0.02
  })

  useEffect(()=>{ saveSettings(settings) },[settings])

  const dataNeutral=projectDCA(settings.monthly,settings.years,settings.returnRate,settings.inflation)
  const dataOptim=projectDCA(settings.monthly,settings.years,settings.returnRate+0.02,settings.inflation)
  const dataPess=projectDCA(settings.monthly,settings.years,settings.returnRate-0.02,settings.inflation)

  const invested=settings.monthly*settings.years*12
  const finalNeutral=dataNeutral[dataNeutral.length-1]
  const finalOptim=dataOptim[dataOptim.length-1]
  const finalPess=dataPess[dataPess.length-1]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">DCA & Projections</h2>
      <div className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-3">
        <label>Mensuel (€)<input type="number" value={settings.monthly} onChange={e=>setSettings({...settings,monthly:+e.target.value})} className="border rounded p-2 w-full"/></label>
        <label>Années<input type="number" value={settings.years} onChange={e=>setSettings({...settings,years:+e.target.value})} className="border rounded p-2 w-full"/></label>
        <label>Rendement attendu (%)<input type="number" step="0.01" value={settings.returnRate*100} onChange={e=>setSettings({...settings,returnRate:+e.target.value/100})} className="border rounded p-2 w-full"/></label>
        <label>Inflation estimée (%)<input type="number" step="0.01" value={settings.inflation*100} onChange={e=>setSettings({...settings,inflation:+e.target.value/100})} className="border rounded p-2 w-full"/></label>
      </div>
      <div className="bg-white p-4 rounded shadow h-96">
        <h3 className="font-semibold mb-2">Projection 20 ans</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataNeutral}>
            <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
            <Line dataKey="nominal" data={dataNeutral} stroke="#2563eb" name="Neutre nominal"/>
            <Line dataKey="real" data={dataNeutral} stroke="#10b981" name="Neutre réel"/>
            <Line dataKey="nominal" data={dataOptim} stroke="#f59e0b" name="Optimiste"/>
            <Line dataKey="nominal" data={dataPess} stroke="#ef4444" name="Pessimiste"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Résultats après {settings.years} ans</h3>
        <ul className="list-disc pl-5">
          <li>Investi : €{invested.toFixed(2)}</li>
          <li>Neutre : €{finalNeutral.nominal.toFixed(0)} (réel: €{finalNeutral.real.toFixed(0)})</li>
          <li>Optimiste : €{finalOptim.nominal.toFixed(0)}</li>
          <li>Pessimiste : €{finalPess.nominal.toFixed(0)}</li>
        </ul>
      </div>
    </div>
  )
}
