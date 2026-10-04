import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { todoAPI } from '../services/api'
import TodoModal from '../components/TodoModal'
import TodoCard from '../components/TodoCard'
import toast from 'react-hot-toast'

export default function Todos() {
  const { user, logout } = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' })
  const [exporting, setExporting] = useState(false)

  const fetchTodos = useCallback(async () => {
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.search) params.search = filters.search

      const res = await todoAPI.getAll(params)
      setTodos(res.data.todos)
    } catch (err) {
      toast.error('Gagal memuat todos.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleCreate = async (formData) => {
    try {
      const res = await todoAPI.create(formData)
      setTodos([res.data.todo, ...todos])
      setModalOpen(false)
      toast.success('Todo berhasil ditambahkan!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan todo.')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      const res = await todoAPI.update(editingTodo.id, formData)
      setTodos(todos.map(t => t.id === editingTodo.id ? res.data.todo : t))
      setModalOpen(false)
      setEditingTodo(null)
      toast.success('Todo berhasil diperbarui!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui todo.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus todo ini?')) return
    try {
      await todoAPI.delete(id)
      setTodos(todos.filter(t => t.id !== id))
      toast.success('Todo berhasil dihapus!')
    } catch (err) {
      toast.error('Gagal menghapus todo.')
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const res = await todoAPI.exportCSV()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `todos-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('File CSV berhasil diunduh!')
    } catch (err) {
      toast.error('Gagal mengekspor CSV.')
    } finally {
      setExporting(false)
    }
  }

  const openCreateModal = () => {
    setEditingTodo(null)
    setModalOpen(true)
  }

  const openEditModal = (todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  // Stats
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    in_progress: todos.filter(t => t.status === 'in_progress').length,
    pending: todos.filter(t => t.status === 'pending').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Todo App</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">Halo, <strong>{user?.name}</strong></span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-600 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Pending', value: stats.pending, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Dalam Proses', value: stats.in_progress, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Selesai', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Cari todo..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">Dalam Proses</option>
            <option value="completed">Selesai</option>
          </select>
          <select
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Semua Prioritas</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting || todos.length === 0}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? 'Mengunduh...' : 'Export CSV'}
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah
            </button>
          </div>
        </div>

        {/* Todo List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            Memuat todos...
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-medium">Belum ada todo</p>
            <p className="text-sm mt-1">Klik "Tambah" untuk membuat todo pertamamu</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {todos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <TodoModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTodo(null) }}
        onSubmit={editingTodo ? handleUpdate : handleCreate}
        initialData={editingTodo}
      />
    </div>
  )
}
