import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Registro() {
  const [modo, setModo] = useState('elegir') // 'elegir' | 'registro' | 'acceder'
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [emailAcceso, setEmailAcceso] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleRegistro(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('participantes')
      .insert([{ nombre, email }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        setError('Este email ya está registrado. Usa la opción "Ya tengo cuenta".')
      } else {
        setError('Error al registrarse. Intenta de nuevo.')
      }
      setLoading(false)
      return
    }

    navigate(`/predicciones/${data.id}`)
  }

  async function handleAcceso(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('participantes')
      .select('*')
      .eq('email', emailAcceso.trim().toLowerCase())
      .single()

    if (error || !data) {
      setError('No encontramos ese email. ¿Te registraste con otro?')
      setLoading(false)
      return
    }

    navigate(`/predicciones/${data.id}`)
  }

  // Pantalla inicial: elegir
  if (modo === 'elegir') return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">⚽ Polla Mundial 2026</h1>
        <p className="text-gray-400">¿Qué quieres hacer?</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setModo('registro')}
          className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl text-lg transition"
        >
          Quiero participar →
        </button>
        <button
          onClick={() => setModo('acceder')}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-4 rounded-xl text-lg transition"
        >
          Ya tengo cuenta, acceder →
        </button>
      </div>
    </div>
  )

  // Pantalla de registro
  if (modo === 'registro') return (
    <div className="max-w-md mx-auto">
      <button onClick={() => setModo('elegir')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← Volver
      </button>
      <h1 className="text-3xl font-bold text-center mb-2">Únete a la polla</h1>
      <p className="text-gray-400 text-center mb-8">Ingresa tus datos para hacer tus predicciones</p>

      <form onSubmit={handleRegistro} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            placeholder="Tu nombre"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Registrando...' : 'Entrar y hacer predicciones →'}
        </button>
      </form>
    </div>
  )

  // Pantalla de acceso por email
  if (modo === 'acceder') return (
    <div className="max-w-md mx-auto">
      <button onClick={() => setModo('elegir')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← Volver
      </button>
      <h1 className="text-3xl font-bold text-center mb-2">Acceder</h1>
      <p className="text-gray-400 text-center mb-8">Ingresa tu email para ir directo a tus predicciones</p>

      <form onSubmit={handleAcceso} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={emailAcceso}
            onChange={e => setEmailAcceso(e.target.value)}
            required
            placeholder="tu@email.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Buscando...' : 'Acceder a mis predicciones →'}
        </button>
      </form>
    </div>
  )
}