/**
 * Officer decision form.
 * Props:
 *   appId     : string
 *   onDecision: (result) => void  — called after successful decision
 */
import { useState } from 'react'
import { submitReview } from '../../api.js'

const DECISIONS = [
  {
    id:      'CONFIRM_CLEAR',
    label:   'Confirm Clear',
    style:   'bg-green-600 hover:bg-green-700 text-white',
    comment: false,
  },
  {
    id:      'RETURN_DEFICIENT',
    label:   'Return as Deficient',
    style:   'bg-red-600 hover:bg-red-700 text-white',
    comment: true,
  },
  {
    id:      'ASK_FOR_INFO',
    label:   'Ask for Info',
    style:   'bg-yellow-500 hover:bg-yellow-600 text-white',
    comment: true,
  },
]

export default function DecisionBar({ appId, onDecision }) {
  const [selected, setSelected] = useState(null)   // DECISIONS[].id
  const [comment,  setComment]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const decisionConfig = DECISIONS.find(d => d.id === selected)

  async function handleSubmit() {
    if (!selected) return
    if (decisionConfig?.comment && !comment.trim()) {
      setError('Comment is required for this decision.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await submitReview(
        appId, selected,
        comment.trim() || null,
        'officer:demo'
      )
      onDecision(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Decision failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-sm mb-3">Officer Decision</h3>

      {/* Decision buttons */}
      <div className="flex gap-2 flex-wrap mb-4">
        {DECISIONS.map((d) => (
          <button
            key={d.id}
            onClick={() => { setSelected(d.id); setError('') }}
            className={`px-4 py-2 rounded text-sm font-medium transition-all
              ${selected === d.id
                ? d.style + ' ring-2 ring-offset-1 ring-gray-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Comment box */}
      {selected && (
        <div className="mb-3">
          <label className="block text-sm mb-1">
            Comment
            {decisionConfig?.comment
              ? <span className="text-red-500 ml-1">* required</span>
              : <span className="text-gray-400 ml-1">(optional)</span>
            }
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add your review comment here…"
            className="w-full border border-gray-300 rounded px-3 py-2
                       text-sm resize-none focus:outline-none
                       focus:ring-2 focus:ring-gray-300"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      {selected && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-5 py-2 rounded text-sm font-medium
            disabled:opacity-50 ${decisionConfig?.style}`}
        >
          {loading ? 'Submitting…' : `Submit — ${decisionConfig?.label}`}
        </button>
      )}
    </div>
  )
}
