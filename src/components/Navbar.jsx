import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-green-400">
          ⚽ Polla Mundial 2026
        </Link>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="text-gray-300 hover:text-white transition">Ranking</Link>
          <Link to="/resultados" className="text-gray-300 hover:text-white transition">Resultados</Link>
          <Link to="/registro" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-3 py-1 rounded transition">
            Participar
          </Link>
        </div>
      </div>
    </nav>
  )
}