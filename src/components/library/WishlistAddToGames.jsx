import { useState } from 'react'
import { createPortal } from 'react-dom'
import ConfirmModal from '../ui/ConfirmModal.jsx'

const resultLabels = {
  added: 'Added as uninstalled',
  existing: 'Already in Games',
  unmatched: 'No matching Atlas catalog entry',
  failed: 'Could not add',
}

// A single chooser supports both one title and a batch without changing
// how users select or open Wishlist cards elsewhere in the app.
export default function WishlistAddToGames({ games }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  // Start each selection from the current Wishlist.
  const openChooser = () => {
    setSelected([])
    setResults(null)
    setError('')
    setOpen(true)
  }

  // Keep the chooser visible on completion so skipped titles are easy to identify.
  const addSelected = async () => {
    setBusy(true)
    setError('')
    try {
      setResults(await window.electronAPI.addWishlistToGames(selected))
    } catch {
      setError('Could not add the selected games. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openChooser}
        className="mr-3 rounded bg-button px-2 py-1 text-sm hover:bg-buttonHover"
      >
        Add to Games
      </button>
      {open && createPortal(<ConfirmModal
        open={open}
        title="Add to Games without installing"
        confirmLabel="Add selected"
        confirmDisabled={selected.length === 0}
        busyLabel="Adding…"
        busy={busy}
        alert={results !== null}
        onConfirm={addSelected}
        onCancel={() => setOpen(false)}
        body={
          <div className="max-h-[55vh] space-y-2 overflow-y-auto">
            {error && <p role="alert">{error}</p>}
            {results ? (
              <>
                {results.length === 0 && <p>The selected entries are no longer in your Wishlist.</p>}
                {results.map(row => (
                  <p key={row.id}>{row.title} · {resultLabels[row.status]}</p>
                ))}
                {results.some(row => row.status === 'added') && (
                  <p>Set Library scope in Games to Installed and uninstalled to see the new entries.</p>
                )}
              </>
            ) : games.map(game => (
              <label key={game.wishlist_id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(game.wishlist_id)}
                  disabled={busy}
                  onChange={event => {
                    const checked = event.target.checked
                    setSelected(previous => checked
                      ? [...previous, game.wishlist_id]
                      : previous.filter(id => id !== game.wishlist_id))
                  }}
                />
                <span>{game.title} · {game.creator}</span>
              </label>
            ))}
          </div>
        }
      />, document.body)}
    </>
  )
}
