import { api, parser } from '../api.js'
import type { Controller } from '../types.d.js'

export const getCalendar: Controller = async (_, res) => {
  try {
    const html = await parser(api.calendar)
    res.status(200).json(
      html.querySelectorAll('section.day-col').map(section => {
        const day = section.attributes['data-day'] || null
        return {
          day,
          animes: section.querySelectorAll('a.rel-card').map(i => {
            const href = i.attributes['href'] || ''
            const id = href.split('/anime/').pop() || null
            const img = i.querySelector('img.rel-thumb-img')
            const image = img?.attributes['data-src'] || img?.attributes['src'] || null
            const title = i.querySelector('h3.rel-title')?.text?.trim() || null
            const meta = i.querySelector('.font-mono.text-\\[10px\\]')?.text?.trim() || ''
            const epMatch = meta.match(/Ep\.\s*(\d+)/)
            const no = epMatch ? parseInt(epMatch[1]) : null
            const typeParts = meta.split('·')
            const type = typeParts.length > 2 ? typeParts[2].trim() : null
            return { id, title, image, no, type }
          })
        }
      })
    )
  } catch (error) {
    res.status(500).json({ error })
  }
}
