// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import WishlistAddToGames from '../src/components/library/WishlistAddToGames.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('adds only selected Wishlist games and displays the result for each', async () => {
  const addWishlistToGames = vi.fn().mockResolvedValue([
    { id: 1, title: 'First Game', status: 'added' },
    { id: 3, title: 'Third Game', status: 'unmatched' },
  ])
  vi.stubGlobal('electronAPI', { addWishlistToGames })
  render(<WishlistAddToGames games={[
    { wishlist_id: 1, title: 'First Game', creator: 'Studio A' },
    { wishlist_id: 2, title: 'Second Game', creator: 'Studio B' },
    { wishlist_id: 3, title: 'Third Game', creator: 'Studio C' },
  ]} />)

  fireEvent.click(screen.getByRole('button', { name: 'Add to Games' }))
  const confirm = screen.getByRole('button', { name: 'Add selected' })
  expect(confirm.disabled).toBe(true)
  fireEvent.click(screen.getByRole('checkbox', { name: /First Game/ }))
  fireEvent.click(screen.getByRole('checkbox', { name: /Third Game/ }))
  fireEvent.click(confirm)

  expect(addWishlistToGames).toHaveBeenCalledWith([1, 3])
  expect(await screen.findByText('First Game · Added as uninstalled')).toBeTruthy()
  expect(screen.getByText('Third Game · No matching Atlas catalog entry')).toBeTruthy()
})
