import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const banderas = {
  'Estados Unidos': '🇺🇸', 'México': '🇲🇽', 'Canadá': '🇨🇦',
  'Argentina': '🇦🇷', 'Brasil': '🇧🇷', 'Colombia': '🇨🇴',
  'Ecuador': '🇪🇨', 'Uruguay': '🇺🇾', 'Paraguay': '🇵🇾',
  'España': '🇪🇸', 'Francia': '🇫🇷', 'Alemania': '🇩🇪',
  'Portugal': '🇵🇹', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Países Bajos': '🇳🇱',
  'Bélgica': '🇧🇪', 'Austria': '🇦🇹', 'Suiza': '🇨🇭',
  'Noruega': '🇳🇴', 'Suecia': '🇸🇪', 'Turquía': '🇹🇷',
  'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Bosnia': '🇧🇦', 'República Checa': '🇨🇿',
  'Croacia': '🇭🇷', 'Panamá': '🇵🇦', 'Haití': '🇭🇹', 'Curazao': '🇨🇼',
  'Marruecos': '🇲🇦', 'Senegal': '🇸🇳', 'Egipto': '🇪🇬',
  'Ghana': '🇬🇭', 'Argelia': '🇩🇿', 'Túnez': '🇹🇳',
  'Costa de Marfil': '🇨🇮', 'Sudáfrica': '🇿🇦', 'Cabo Verde': '🇨🇻',
  'RD Congo': '🇨🇩', 'Japón': '🇯🇵', 'Corea del Sur': '🇰🇷',
  'Australia': '🇦🇺', 'Irán': '🇮🇷', 'Arabia Saudita': '🇸🇦',
  'Qatar': '🇶🇦', 'Uzbekistán': '🇺🇿', 'Jordania': '🇯🇴',
  'Irak': '🇮🇶', 'Nueva Zelanda': '🇳🇿',
}

const bandera = (equipo) => banderas[equipo] || '🏳️'

const grupos = {
  'Grupo A': ['México', 'Sudáfrica', 'Corea del Sur', 'República Checa'],
  'Grupo B': ['Canadá', 'Bosnia', 'Qatar', 'Suiza'],
  'Grupo C': ['Brasil', 'Marruecos', 'Escocia', 'Haití'],
  'Grupo D': ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  'Grupo E': ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  'Grupo F': ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  'Grupo G': ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  'Grupo H': ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  'Grupo I': ['Francia', 'Senegal', 'Irak', 'Noruega'],
  'Grupo J': ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  'Grupo K': ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
  'Grupo L': ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

export default function Predicciones() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partidos, setPartidos] = useState([])
  const [predicciones, setPredicciones] = useState({})
  const [participante, setParticipante] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => { cargarDatos() }, [id])

  async function cargarDatos() {
    const { data: part } = await supabase
      .from('participantes').select('*').eq('id', id).single()
    if (!part) { navigate('/registro'); return }
    setParticipante(part)

    const { data: partidos } = await supabase
      .from('partidos').select('*').order('fecha', { ascending: true })

    const { data: preds } = await supabase
      .from('predicciones').select('*').eq('participante_id', id)

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

  if (loading) return <p className="text-center text-gray-400 mt-16">Cargando partidos...</p>

  const ahora = new Date()

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1">Hola, {participante?.nombre} 👋</h1>
        <p className="text-gray-400 mb-3">Ingresa tu predicción para cada partido</p>
        <div className="inline-flex gap-4 text-xs bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
          <span className="text-gray-400">🏆 Marcador exacto <span className="text-yellow-400 font-bold">4 pts</span></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">✓ Ganador + diferencia <span className="text-green-400 font-bold">2 pts</span></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">✓ Solo ganador <span className="text-blue-400 font-bold">1 pt</span></span>
        </div>
      </div>

      {partidos.length === 0 ? (
        <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-8">
          <p className="text-gray-400 text-lg mb-2">⏳ Los partidos aún no están cargados</p>
          <p className="text-gray-500 text-sm">Vuelve pronto.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {partidos.map(partido => {
              const fechaPartido = new Date(partido.fecha)
              const minutosRestantes = (fechaPartido - ahora) / 1000 / 60
              const bloqueado = partido.jugado || minutosRestantes < 60
              const pred = predicciones[partido.id] || { gol_local: 0, gol_visita: 0 }
              const otrosEquipos = (grupos[partido.fase] || [])
                .filter(e => e !== partido.equipo_local && e !== partido.equipo_visita)

              return (
                <div key={partido.id} className={`bg-gray-900 border rounded-xl px-5 py-4 ${bloqueado ? 'border-gray-700 opacity-60' : 'border-gray-800'}`}>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold bg-gray-800 text-green-400 px-2 py-0.5 rounded-md">
                      {partido.fase}
                    </span>
                    {otrosEquipos.length > 0 && (
                      <span className="text-xs text-gray-600">
                        también: {otrosEquipos.map(e => `${bandera(e)} ${e}`).join('  ·  ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="flex-1 text-right font-semibold">
                      {partido.equipo_local} {bandera(partido.equipo_local)}
                    </span>
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
                    <span className="flex-1 font-semibold">
                      {bandera(partido.equipo_visita)} {partido.equipo_visita}
                    </span>
                  </div>

                  {partido.fecha && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                      {fechaPartido.toLocaleDateString('es-CL', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      })}
                      {partido.jugado
                        ? ' · 🔒 Partido jugado'
                        : minutosRestantes < 0
                        ? ' · 🔒 En curso'
                        : minutosRestantes < 60
                        ? ' · 🔒 Predicciones cerradas'
                        : minutosRestantes < 180
                        ? ` · ⏳ Cierra en ${Math.floor(minutosRestantes)} min`
                        : ''}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

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