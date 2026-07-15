import type { Controller } from '../types.d.js'
import { parser, url } from '../api.js'

export const getLatest: Controller = async (_, res) => {
  try {
    const html = await parser(url)
    res.json(
      html.querySelectorAll('article').map(i => {
        const a = i.querySelector('a')
        const href = a?.attributes['href'] || ''
        const id = href.split('/ver/').pop() || null
        if (!id || !href.includes('/ver/')) return null
        const img = i.querySelector('img.card-img')
        const image = img?.attributes['src'] !== 'https://monoschinos.st/img/capblank.png'
          ? img?.attributes['src']
          : img?.attributes['data-src'] || null
        const title = i.querySelector('h3.card-title')?.text?.trim() || null
        const epText = i.querySelector('.absolute.top-2\\.5')?.text?.trim() || ''
        const no = parseInt(epText.replace('EP', '').trim()) || null
        const type = i.querySelector('.mt-1 span')?.text?.trim() || null
        return { id, title, image, type, no }
      }).filter(Boolean)
    )
  } catch (error) {
    res.status(500).json({ error })
  }
}
