import { api, parser } from '../api.js'
import type { Controller } from '../types.d.js'

export const getEpisode: Controller = async (req, res) => {
  try {
    const { id } = req.params
    const html = await parser(api.episode(id))

    // Título
    const title = html.querySelector('h2')?.text?.trim() || null

    // Servidores — botones con data-player en base64
    const videos = html.querySelectorAll('button.play-video').map(i => {
      const base64 = i.attributes['data-player'] || ''
      const name = i.text?.trim() || null
      const url = base64 ? Buffer.from(base64, 'base64').toString('utf-8') : null
      return { title: name, url }
    }).filter(i => i.url)

    // Navegación siguiente/anterior
    const nextLink = html.querySelector('a[href*="/ver/"][class*="bg-brand"]')?.attributes['href'] || null
    const prevLink = html.querySelector('a[href*="/ver/"][class*="border"]')?.attributes['href'] || null

    // Descargas
    const downloads = html.querySelectorAll('a.direct-link').map(i => ({
      title: i.text?.trim() || null,
      url: i.attributes['href'] || null,
    })).filter(i => i.url)

    // Sugerencias
    const suggestions = html.querySelectorAll('a.sug').map(i => {
      const img = i.querySelector('img.sug-img')
      const image = img?.attributes['data-src'] || img?.attributes['src'] || null
      const title = i.querySelector('h4.sug-title')?.text?.trim() || null
      const href = i.attributes['href'] || ''
      const epId = href.split('/ver/').pop() || null
      return { title, image, id: epId }
    }).filter(i => i.id)

    res.json({
      title,
      videos,
      nav: { next: !!nextLink, prev: !!prevLink },
      nextLink,
      prevLink,
      downloads,
      suggestions,
    })
  } catch (error) {
    res.status(500).json({ error })
  }
}
