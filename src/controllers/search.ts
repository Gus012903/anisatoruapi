import { api, parser } from '../api.js'
import type { Controller } from '../types.d.js'

export const searchAnime: Controller = async (req, res) => {
  try {
    const { id } = req.params
    const { page = '1' } = req.query
    const html = await parser(api.search(id, page))
    res.json(
      html.querySelectorAll('article').map(i => {
        const a = i.querySelector('a')
        const href = a?.attributes['href'] || ''
        const animeId = href.split('/anime/').pop() || null
        if (!animeId || !href.includes('/anime/')) return null
        const img = i.querySelector('img.card-img')
        const image = img?.attributes['src'] !== 'https://monoschinos.st/img/anime.png'
          ? img?.attributes['src']
          : img?.attributes['data-src'] || null
        const title = i.querySelector('h3')?.text?.trim() || null
        const type = i.querySelector('.font-mono')?.text?.trim() || null
        return { id: animeId, title, image, type }
      }).filter(Boolean)
    )
  } catch (error) {
    res.status(500).json({ error })
  }
}
