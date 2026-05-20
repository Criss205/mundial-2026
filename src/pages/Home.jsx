import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarRanking()
  }, [])

  async function cargarRanking() {
    const { data: participantes, error } = await supabase
      .from('participantes')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !participantes || participantes.length === 0) {
      setRanking([])
      setLoading(false)
      return
    }

    const { data: predicciones } = await supabase
      .from('predicciones')
      .select('*')

    const { data: partidos } = await supabase
      .from('partidos')
      .select('*')
      .eq('jugado', true)

    const ranking = participantes.map(p => {
      const misPredicciones = (predicciones || []).filter(pr => pr.participante_id === p.id)
      let puntos = 0

      misPredicciones.forEach(pred => {
        const partido = (partidos || []).find(pa => pa.id === pred.partido_id)
        if (!partido) return

        const gl = partido.gol_local_real
        const gv = partido.gol_visita_real
        const pl = pred.gol_local
        const pv = pred.gol_visita

        if (pl === gl && pv === gv) { puntos += 4; return }

        const ganadorReal = gl > gv ? 'local' : gl < gv ? 'visita' : 'empate'
        const ganadorPred = pl > pv ? 'local' : pl < pv ? 'visita' : 'empate'

        if (ganadorReal === ganadorPred) {
          puntos += (gl - gv) === (pl - pv) ? 2 : 1
        }
      })

      return { ...p, puntos }
    })

    ranking.sort((a, b) => b.puntos - a.puntos)
    setRanking(ranking)
    setLoading(false)
  }

  const medallas = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400 mb-2">⚽ Mundial 2026</h1>
        <p className="text-gray-400">Ranking en tiempo real</p>
      </div>

      <div className="flex justify-center mb-8">
        <Link to="/registro" className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-lg transition">
          + Quiero participar
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Cargando ranking...</p>
      ) : ranking.length === 0 ? (
        <p className="text-center text-gray-400">Aún no hay participantes. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-3">
          {ranking.map((p, i) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl w-8">{medallas[i] || `#${i + 1}`}</span>
                <div>
                  <p className="font-semibold text-white">{p.nombre}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">{p.puntos}</p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}