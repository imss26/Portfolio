import React, { useEffect, useMemo, useRef, useState } from "react"

const STORAGE_KEY = "portfolioTransactions"

function loadTx() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function saveTx(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
function toCSV(rows) {
  const headers = ["date","ticker","type","qty","price","amount"]
  const lines = [headers.join(",")]
  rows.forEach(r => {
    const line = [r.date,r.ticker,r.type||"BUY",r.qty,r.price,r.amount].join(",")
    lines.push(line)
  })
  return lines.join("\n")
}
function download(filename, text) {
  const blob = new Blob([text], {type: 'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function parseCSVFile(file) {
  const text = await file.text()
  return parseCSVText(text)
}
function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length)
  if (lines.length < 2) return []
  const header = lines[0].split(",").map(h => h.trim().toLowerCase())
  const idx = name => header.indexOf(name.toLowerCase())

  const iDate = idx("date")
  const iTicker = idx("ticker") !== -1 ? idx("ticker") : idx("symbol")
  const iType = idx("type") !== -1 ? idx("type") : idx("transaction")
  const iQty = idx("qty") !== -1 ? idx("qty") : idx("quantity")
  const iPrice = idx("price") !== -1 ? idx("price") : idx("amount per share")
  const iAmount = idx("amount") !== -1 ? idx("amount") : idx("total")

  const out = []
  for (let l=1; l<lines.length; l++) {
    const cols = lines[l].split(",")
    if (!cols.length) continue
    const date = iDate !== -1 ? cols[iDate] : new Date().toISOString().slice(0,10)
    const ticker = iTicker !== -1 ? cols[iTicker].toUpperCase() : "XXX"
    const type = iType !== -1 ? cols[iType].toUpperCase() : "BUY"
    const qty = parseFloat(iQty !== -1 ? cols[iQty] : "0")
    const price = parseFloat(iPrice !== -1 ? cols[iPrice] : "0")
    let amount = iAmount !== -1 ? parseFloat(cols[iAmount]) : qty*price
    if (type==="SELL") amount = -Math.abs(amount)
    if (!ticker || !qty || !price) continue
    out.push({id:Date.now()+Math.random(),date,ticker,type,qty,price,amount})
  }
  return out
}

export default function Transactions(){
  const [tx, setTx] = useState([])
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0,10),
    ticker: "", type: "BUY", qty: "", price: ""
  })
  const [filters, setFilters] = useState({ticker:"",from:"",to:""})
  const fileRef = useRef(null)

  useEffect(()=>{setTx(loadTx())},[])

  function addTx(e){
    e.preventDefault()
    const qty = parseFloat(form.qty)
    const price = parseFloat(form.price)
    if(!form.ticker||!qty||!price) return
    const amount = qty*price
    const row={id:Date.now(),date:form.date,ticker:form.ticker.toUpperCase(),type:form.type,qty,price,amount:form.type==="SELL"?-Math.abs(amount):amount}
    const next=[row,...tx].sort((a,b)=>a.date<b.date?1:-1)
    setTx(next); saveTx(next)
    setForm({...form,ticker:"",qty:"",price:""})
  }
  function remove(id){const next=tx.filter(t=>t.id!==id);setTx(next);saveTx(next)}
  function clearAll(){if(!window.confirm("Supprimer toutes les transactions ?"))return;setTx([]);saveTx([])}
  function onExportCSV(){const csv=toCSV(tx);download("transactions.csv",csv)}
  async function onImportCSV(e){
    const file=e.target.files?.[0]
    if(!file) return
    const rows=await parseCSVFile(file)
    if(rows.length===0){alert("CSV vide ou non reconnu");return}
    const merged=[...rows,...tx].sort((a,b)=>a.date<b.date?1:-1)
    setTx(merged); saveTx(merged)
    if(fileRef.current) fileRef.current.value=""
  }

  const filtered=useMemo(()=>tx.filter(t=>{
    const tk=filters.ticker? t.ticker.includes(filters.ticker.toUpperCase()):true
    const f=filters.from? t.date>=filters.from:true
    const to=filters.to? t.date<=filters.to:true
    return tk&&f&&to}),[tx,filters])

  const totalInvested=useMemo(()=>filtered.reduce((s,t)=>s+(t.amount>0?t.amount:0),0),[filtered])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Transactions</h2>
      <form onSubmit={addTx} className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="border rounded p-2" required/>
        <input placeholder="Ticker" value={form.ticker} onChange={e=>setForm({...form,ticker:e.target.value})} className="border rounded p-2" required/>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="border rounded p-2"><option>BUY</option><option>SELL</option></select>
        <input type="number" step="0.0001" placeholder="Qty" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} className="border rounded p-2" required/>
        <input type="number" step="0.0001" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="border rounded p-2" required/>
        <button type="submit" className="bg-blue-600 text-white rounded p-2">Ajouter</button>
      </form>
      <div className="flex gap-3 items-center">
        <button onClick={clearAll} className="bg-red-600 text-white rounded p-2">Tout effacer</button>
        <button onClick={onExportCSV} className="bg-gray-800 text-white rounded p-2">Export CSV</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onImportCSV} className="border rounded p-2"/>
      </div>
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Filtrer ticker" value={filters.ticker} onChange={e=>setFilters({...filters,ticker:e.target.value})} className="border rounded p-2"/>
        <input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} className="border rounded p-2"/>
        <input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} className="border rounded p-2"/>
      </div>
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead><tr><th className="p-2 text-left">Date</th><th className="p-2">Ticker</th><th className="p-2">Type</th><th className="p-2">Qty</th><th className="p-2">Price</th><th className="p-2">Amount</th><th></th></tr></thead>
          <tbody>
            {filtered.map(r=>(<tr key={r.id} className="border-b"><td className="p-2">{r.date}</td><td className="p-2">{r.ticker}</td><td className="p-2">{r.type}</td><td className="p-2">{r.qty}</td><td className="p-2">€{r.price}</td><td className="p-2">€{r.amount}</td><td className="p-2"><button onClick={()=>remove(r.id)} className="text-red-600">Suppr</button></td></tr>))}
            {filtered.length===0 && <tr><td colSpan="7" className="text-center p-4 text-gray-500">Aucune transaction</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="p-2 text-gray-700">Investi (filtré) : <b>€{totalInvested.toFixed(2)}</b></div>
    </div>
  )
}
