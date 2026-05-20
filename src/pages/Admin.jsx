import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CLAVE_ADMIN = 'mundial2026'

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const [clave, setClave] = useState('')
  const [partidos, setPartidos] = useState([])
  const [participantes, setParticipantes] = useState([])
  const [resultados, setResultados] = useState({})
  const [nuevoPartido, setNuevoPartido] = useState({ equipo_local: '', equipo_visita: '', fase: 'Grupos', fecha: '' })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('partidos')

  useEffect(() => {
    if (autenticado) { cargarPartidos(); cargarParticipantes() }
  }, [autenticado])

  async function cargarPartidos() {
    const { data } = await supabase.from('partidos').select('*').order('fecha', { ascending: true })
    setPartidos(data || [])
    const res = {}
    data?.forEach(p => { res[p.id] = { gol_local: p.gol_local_real ?? '', gol_visita: p.gol_visita_real ?? '' } })
    setResultados(res)
  }

  async function cargarParticipantes() {
    const { data } = await supabase.from('participantes').select('*').order('created_at', { ascending: false })
    setParticipantes(data || [])
  }

async function eliminarParticipante(id, nombre) {
  if (!confirm(`¿Eliminar a ${nombre}? Se borrarán también todas sus predicciones.`)) return
  await supabase.from('predicciones').delete().eq('participante_id', id)
  const { error } = await supabase.from('participantes').delete().eq('id', id)
  if (error) {
    setMsg('Error al eliminar ❌')
  } else {
    setMsg(`${nombre} eliminado ✓`)
    setParticipantes(prev => prev.filter(p => p.id !== id))
  }
  setTimeout(() => setMsg(''), 3000)
}

  async function agregarPartido() {
    if (!nuevoPartido.equipo_local || !nuevoPartido.equipo_visita) return
    await supabase.from('partidos').insert([nuevoPartido])
    cargarPartidos()
    setNuevoPartido({ equipo_local: '', equipo_visita: '', fase: 'Grupos', fecha: '' })
  }

  async function guardarResultado(partidoId) {
    setGuardando(true)
    const r = resultados[partidoId]
    const { error } = await supabase.from('partidos').update({
      gol_local_real: parseInt(r.gol_local),
      gol_visita_real: parseInt(r.gol_visita),
      jugado: true
    }).eq('id', partidoId)
    setMsg(error ? 'Error al guardar ❌' : 'Resultado guardado ✓')
    setTimeout(() => setMsg(''), 2000)
    setGuardando(false)
    cargarPartidos()
  }

  if (!autenticado) return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">Panel Admin</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={e => setClave(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (clave === CLAVE_ADMIN ? setAutenticado(true) : alert('Clave incorrecta'))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
        />
        <button
          onClick={() => clave === CLAVE_ADMIN ? setAutenticado(true) : alert('Clave incorrecta')}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg"
        >
          Entrar
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Panel Admin ⚙️</h1>
      {msg && <p className="text-green-400 mb-4">{msg}</p>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setTab('partidos')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${tab === 'partidos' ? 'bg-gray-900 text-green-400 border border-b-0 border-gray-800' : 'text-gray-400 hover:text-white'}`}
        >
          ⚽ Partidos y resultados
        </button>
        <button
          onClick={() => setTab('usuarios')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${tab === 'usuarios' ? 'bg-gray-900 text-green-400 border border-b-0 border-gray-800' : 'text-gray-400 hover:text-white'}`}
        >
          👥 Usuarios ({participantes.length})
        </button>
      </div>

      {/* Tab Partidos */}
      {tab === 'partidos' && (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
            <h2 className="font-semibold text-lg mb-4">Agregar partido</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input placeholder="Equipo local" value={nuevoPartido.equipo_local}
                onChange={e => setNuevoPartido(p => ({ ...p, equipo_local: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
              <input placeholder="Equipo visita" value={nuevoPartido.equipo_visita}
                onChange={e => setNuevoPartido(p => ({ ...p, equipo_visita: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
              <select value={nuevoPartido.fase}
                onChange={e => setNuevoPartido(p => ({ ...p, fase: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500">
                <option>Grupos</option>
                <option>Octavos</option>
                <option>Cuartos</option>
                <option>Semifinal</option>
                <option>Final</option>
              </select>
              <input type="datetime-local" value={nuevoPartido.fecha}
                onChange={e => setNuevoPartido(p => ({ ...p, fecha: e.target.value }))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500" />
            </div>
            <button onClick={agregarPartido}
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-lg">
              + Agregar partido
            </button>
          </div>

          <h2 className="font-semibold text-lg mb-4">Ingresar resultados</h2>
          <div className="space-y-3">
            {partidos.map(partido => (
              <div key={partido.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex-1 text-right font-semibold text-sm">{partido.equipo_local}</span>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0"
                      value={resultados[partido.id]?.gol_local ?? ''}
                      onChange={e => setResultados(r => ({ ...r, [partido.id]: { ...r[partido.id], gol_local: e.target.value } }))}
                      className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white focus:outline-none focus:border-green-500" />
                    <span className="text-gray-500 font-bold">-</span>
                    <input type="number" min="0"
                      value={resultados[partido.id]?.gol_visita ?? ''}
                      onChange={e => setResultados(r => ({ ...r, [partido.id]: { ...r[partido.id], gol_visita: e.target.value } }))}
                      className="w-12 text-center bg-gray-800 border border-gray-700 rounded-lg py-1 text-white focus:outline-none focus:border-green-500" />
                  </div>
                  <span className="flex-1 font-semibold text-sm">{partido.equipo_visita}</span>
                  <button onClick={() => guardarResultado(partido.id)} disabled={guardando}
                    className={`px-4 py-1 rounded-lg text-sm font-semibold transition ${partido.jugado ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-500 hover:bg-green-400 text-black'}`}>
                    {partido.jugado ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {partido.fecha
                      ? new Date(partido.fecha).toLocaleDateString('es-CL', {
                          weekday: 'short', day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })
                      : ''}
                  </p>
                  {partido.jugado && (
                    <p className="text-xs text-green-500">✓ Resultado oficial: {partido.gol_local_real} - {partido.gol_visita_real}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tab Usuarios */}
      {tab === 'usuarios' && (
        <div className="space-y-3">
          {participantes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay participantes registrados aún.</p>
          ) : (
            participantes.map((p, i) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-900 flex items-center justify-center text-green-400 font-bold text-sm">
                    {p.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-600">
                    {new Date(p.created_at).toLocaleDateString('es-CL')}
                  </p>
                  <button
                    onClick={() => eliminarParticipante(p.id, p.nombre)}
                    className="bg-red-900 hover:bg-red-700 text-red-300 text-sm px-3 py-1 rounded-lg transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}