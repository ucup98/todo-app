const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const STATUS_STYLES = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'Dalam Proses',
  completed: 'Selesai',
}

const PRIORITY_LABELS = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
}

export default function TodoCard({ todo, onEdit, onDelete }) {
  // Format due_date: ambil hanya bagian tanggal (YYYY-MM-DD)
  const formattedDueDate = todo.due_date
    ? todo.due_date.toString().slice(0, 10)
    : null

  const isOverdue =
    formattedDueDate &&
    todo.status !== 'completed' &&
    new Date(formattedDueDate) < new Date()

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition group ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${todo.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{todo.description}</p>
          )}
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Hapus"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[todo.status]}`}>
          {STATUS_LABELS[todo.status]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[todo.priority]}`}>
          {PRIORITY_LABELS[todo.priority]}
        </span>
        {formattedDueDate && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue ? 'Terlambat: ' : ''}{formattedDueDate}
          </span>
        )}
      </div>
    </div>
  )
}

// v2

// rebuild trigger
