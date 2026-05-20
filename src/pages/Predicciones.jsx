import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Predicciones() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partidos, setPartidos] = useState([])
  const [predicciones, setPredicciones] = useState({})
  const [participante, setParticipante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [id])

  async function cargarDatos() {
    const { data: part } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', id)
      .single()

    if (!part) { navigate('/registro'); return }
    setParticipante(part)

    const { data: partidos } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: true })

    const { data: preds } = await supabase
      .from('predicciones')
      .select('*')
      .eq('participante_id', id)

    const predsMap = {}
    preds?.forEach(p => {
      predsMap[p.partido_id] = { gol_local: p.gol_local, gol_visita: p.gol_visita }
    })

    setPartidos(partidos || [])
    setPredicciones(predsMap)
    setLoading(false)
  }

  function handleChange(partidoId, campo, valor) {
    const num = Math.max(0, parseInt(valor) || 0)
    setPredicciones(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [campo]: num }
    }))
  }

  async function guardar() {
    setGuardando(true)
    const inserts = partidos
      .filter(p => predicciones[p.id] !== undefined)
      .map(p => ({
        participante_id: id,
        partido_id: p.id,
        gol_local: predicciones[p.id]?.gol_local ?? 0,
        gol_visita: predicciones[p.id]?.gol_visita ?? 0,
      }))

    await supabase
      .from('predicciones')
      .upsert(inserts, { onConflict: 'participante_id,partido_id' })

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  if (loading) return <p className="text-center text-gray-400">Cargando partidos...</p>

  const fases = [...new Set(partidos.map(p => p.fase))]

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1">Hola, {participante?.nombre} 👋</h1>
        <p className="text-gray-400">Ingresa tu predicción para cada partido</p>
      </div>

      {partidos.length === 0 ? (
        <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-8">
          <p className="text-gray-400 text-lg mb-2">⏳ Los partidos aún no están cargados</p>
          <p className="text-gray-500 text-sm">El administrador debe cargar el fixture. Vuelve pronto.</p>
        </div>
      ) : (
        <>
          {fases.map(fase => (
            <div key={fase} className="mb-8">
              <h2 className="text-lg font-semibold text-green-400 mb-3 border-b border-gray-800 pb-2">{fase}</h2>
              <div className="space-y-3">
                {partidos.filter(p => p.fase === fase).map(partido => {
                  const bloqueado = partido.jugado
                  const pred = predicciones[partido.id] || { gol_local: 0, gol_visita: 0 }
                  return (
                    <div key={partido.id} className={`bg-gray-900 border rounded-xl px-5 py-4 ${bloqueado ? 'border-gray-700 opacity-60' : 'border-gray-800'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex-1 text-right font-semibold">{partido.equipo_local}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" max="20"
                            value={pred.gol_local}
                            onChange={e => handleChange(partido.id, 'gol_local', e.target.value)}
                            disabled={bloqueado}
                            className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white focus:outline-none focus:border-green-500 disabled:opacity-50"
                          />
                          <span className="text-gray-500 font-bold">-</span>
                          <input
                            type="number" min="0" max="20"
                            value={pred.gol_visita}
                            onChange={e => handleChange(partido.id, 'gol_visita', e.target.value)}
                            disabled={bloqueado}
                            className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white focus:outline-none focus:border-green-500 disabled:opacity-50"
                          />
                        </div>
                        <span className="flex-1 font-semibold">{partido.equipo_visita}</span>
                      </div>
                      {partido.fecha && (
                        <p className="text-center text-xs text-gray-500 mt-2">
                          {new Date(partido.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {bloqueado && ' · 🔒 Bloqueado'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 flex justify-center mt-6">
            <button
              onClick={guardar}
              disabled={guardando}
              className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold px-8 py-3 rounded-xl shadow-lg transition"
            >
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado!' : 'Guardar predicciones'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}