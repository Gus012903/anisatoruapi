import type { Controller } from '../types.d.js'
import { parser, api } from '../api.js'

export const getAll: Controller = async (req, res) => {
  try {
    const { page = '1' } = req.query
    const html = await parser(api.all(page))

    // Extrae el total de páginas
    const pageLinks = html.querySelectorAll('nav[aria-label="Paginación"] a')
    let totalPages = 1
    pageLinks.forEach((a: any) => {
      const text = a.text?.trim()
      const num = parseInt(text)
      if (!isNaN(num) && num > totalPages) totalPages = num
    })

    const animes = html.querySelectorAll('article').map((i: any) => {
      const a = i.querySelector('a')
      const href = a?.attributes['href'] || ''
      const id = href.split('/anime/').pop() || null
      if (!id || !href.includes('/anime/')) return null
      const img = i.querySelector('img.card-img')
      const image = img?.attributes['src'] !== 'https://monoschinos.st/img/anime.png'
        ? img?.attributes['src']
        : img?.attributes['data-src'] || null
      const title = i.querySelector('h3')?.text?.trim() || null
      const type = i.querySelector('.font-mono')?.text?.trim() || null
      return { id, title, image, type }
    }).filter(Boolean)

    res.status(200).json({
      animes,
      pages: totalPages,
      currentPage: parseInt(page as string),
    })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) })
  }
}
