import { useEffect, useState } from 'react'
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


function Badge({ partido, minutosRestantes }) {
  if (partido.jugado) {
    return <span className="text-xs font-semibold bg-green-900 text-green-400 px-2 py-0.5 rounded-md">✓ Jugado</span>
  }
  if (minutosRestantes < 0) {
    return <span className="text-xs font-semibold bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-md">⚽ En curso</span>
  }
  if (minutosRestantes < 60) {
    return <span className="text-xs font-semibold bg-orange-900 text-orange-400 px-2 py-0.5 rounded-md">🔒 Próximo</span>
  }
  if (minutosRestantes < 1440) {
    const hora = new Date(partido.fecha).toLocaleTimeString('es-CL', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago'
    })
    return <span className="text-xs font-semibold bg-blue-900 text-blue-400 px-2 py-0.5 rounded-md">⏳ Hoy {hora}</span>
  }
  const dias = Math.round(minutosRestantes / 1440)
  const label = dias < 1 ? `En ${Math.floor(minutosRestantes / 60)} h` : `En ${dias} d`
  return <span className="text-xs font-semibold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">📅 {label}</span>
}

export default function Resultados() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPartidos() {
      const { data } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: true })
      setPartidos(data || [])
      setLoading(false)
    }
    cargarPartidos()
  }, [])

  if (loading) return <p className="text-center text-gray-400 mt-16">Cargando partidos...</p>

  const ahora = new Date()

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1">Resultados ⚽</h1>
        <p className="text-gray-400">Todos los partidos del Mundial 2026</p>
      </div>

      {partidos.length === 0 ? (
        <div className="text-center bg-gray-900 border border-gray-800 rounded-xl p-8">
          <p className="text-gray-400 text-lg">⏳ Los partidos aún no están cargados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partidos.map(partido => {
            const fechaPartido = new Date(partido.fecha)
            const minutosRestantes = (fechaPartido - ahora) / 1000 / 60
            return (
              <div key={partido.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold bg-gray-800 text-green-400 px-2 py-0.5 rounded-md">
                    {partido.fase}
                  </span>
                  <Badge partido={partido} minutosRestantes={minutosRestantes} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex-1 text-right font-semibold">
                    {partido.equipo_local} {bandera(partido.equipo_local)}
                  </span>
                  <div className="flex items-center gap-3 text-2xl font-bold tabular-nums">
                    {partido.jugado ? (
                      <>
                        <span className="text-white">{partido.gol_local_real}</span>
                        <span className="text-gray-600">-</span>
                        <span className="text-white">{partido.gol_visita_real}</span>
                      </>
                    ) : (
                      <span className="text-gray-600 text-lg">— —</span>
                    )}
                  </div>
                  <span className="flex-1 font-semibold">
                    {bandera(partido.equipo_visita)} {partido.equipo_visita}
                  </span>
                </div>

                {partido.fecha && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {fechaPartido.toLocaleDateString('es-CL', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago'
                    })}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
