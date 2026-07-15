import type { Controller } from '../types.d.js'
import { parser, attr, url } from '../api.js'

export const getLatest: Controller = async (_, res) => {
  try {
    const html = await parser(url)
    res.json(
      html.querySelectorAll('a[href*="/ver/"]').map(i => {
        const href = attr(i, 'a', 'href') || i.attributes['href'] || ''
        const id = href.split('/ver/').pop() || null
        const epMatch = i.querySelector('span')?.text?.match(/EP\s*(\d+)/)
        const no = epMatch ? parseInt(epMatch[1]) : null
        const title = i.querySelector('h3,h2,.animetitles')?.text?.trim() || null
        const image = attr(i, 'img', 'src') || attr(i, 'img', 'data-src') || null
        const type = i.querySelector('span:last-child')?.text?.trim() || null
        if (!id) return null
        return { id, title, image, type, no }
      }).filter(Boolean)
    )
  } catch (error) {
    res.status(500).json({ error })
  }
}
