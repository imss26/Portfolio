import React, { useEffect, useRef, useState } from "react"

const KEYS = ["portfolioTransactions","dcaSettings","macroSettings","yahooData"]
const fmt2 = (x) => (isFinite(x) ? Number(x).toFixed(2) : "0.00")

function download(filename, text) {
  const blob = new Blob([text], {type: 'application/json;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function Settings(){
  const [theme, setTheme] = useState(localStorage.getItem("theme")||"light")
  const fileRef = useRef(null)

  useEffect(()=>{
    localStorage.setItem("theme", theme)
    const root = document.documentElement
    if(theme==="dark") root.classList.add("dark")
    else root.classList.remove("dark")
  },[theme])

  function resetAll(){
    if(!window.confirm("Réinitialiser TOUTES les données ?")) return
    KEYS.forEach(k=>localStorage.removeItem(k))
    alert("OK. Données effacées.")
    window.location.reload()
  }
  function clearYahoo(){
    localStorage.removeItem("yahooData")
    alert("Données Yahoo supprimées.")
  }
  function exportJSON(){
    const out={}
    KEYS.forEach(k=>{ out[k]=JSON.parse(localStorage.getItem(k)||"null") })
    download("portfolio_backup.json", JSON.stringify(out,null,2))
  }
  async function importJSON(e){
    const file = e.target.files?.[0]
    if(!file) return
    const txt = await file.text()
    try {
      const obj = JSON.parse(txt)
      Object.keys(obj).forEach(k=>{
        if(KEYS.includes(k)){
          localStorage.setItem(k, JSON.stringify(obj[k]))
        }
      })
      alert("Import terminé. Rechargement...")
      window.location.reload()
    } catch(err){
      alert("JSON invalide")
    } finally {
      if(fileRef.current) fileRef.current.value=""
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* Thème + resets */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-500">Thème</div>
          <select value={theme} onChange={e=>setTheme(e.target.value)} className="border rounded p-2 w-full">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={resetAll} className="bg-red-600 text-white rounded p-2 w-full">Reset complet</button>
        </div>
        <div className="flex items-end">
          <button onClick={clearYahoo} className="bg-orange-500 text-white rounded p-2 w-full">Effacer données Yahoo</button>
        </div>
      </div>

      {/* Export / Import JSON */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Export JSON (sauvegarde)</div>
          <button onClick={exportJSON} className="bg-gray-800 text-white rounded p-2">Exporter</button>
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">Import JSON (restauration)</div>
          <input ref={fileRef} type="file" accept="application/json" onChange={importJSON} className="border rounded p-2 w-full"/>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        PWA : le site est installable depuis le menu du navigateur (option “Installer l’application”).
      </div>
    </div>
  )
}
