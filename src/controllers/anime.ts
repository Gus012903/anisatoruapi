import { api, parser, headers } from '../api.js'
import fetch from 'node-fetch'
import type { Controller } from '../types.d.js'

export const getAnime: Controller = async (req, res) => {
  try {
    const { id } = req.params
    const html = await parser(api.anime(id))

    // Datos básicos del HTML
    const title    = html.querySelector('h1')?.text?.trim() || null
    const image    = html.querySelector('img.lazy')?.attributes['data-src'] || null
    const sinopsis = html.querySelector('p.text-white\\/75')?.text?.trim() || null
    const status   = html.querySelector('.animate-pulse')?.parentNode?.parentNode?.text?.trim() || null
    const genders  = [...new Set(html.querySelectorAll('a[href*="/genero/"]').map((g: any) => g.text?.trim()).filter(Boolean))]

    // Detalles de la tabla
    const dds  = html.querySelectorAll('dd.text-white.text-right')
    const tipo = dds[0]?.text?.trim() || null
    const date = dds[4]?.text?.trim() || null

    // Extrae el token CSRF del HTML
    const csrfToken = html.querySelector('meta[name="csrf-token"]')?.attributes['content'] || ''

    // ID del AJAX para episodios
    const ajaxUrl = html.querySelector('.caplist')?.attributes['data-ajax'] || null
    let episodes: { no: number, id: string }[] = []

    if (ajaxUrl) {
      const ajaxRes = await fetch(ajaxUrl, {
        headers: {
          ...headers,
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Referer': api.anime(id),
        }
      })
      const ajaxData: any = await ajaxRes.json()
      const animeSlug = id.replace('-sub-espanol', '')
      episodes = (ajaxData.eps || []).map((ep: { num: number }) => ({
        no: ep.num,
        id: `${animeSlug}-episodio-${ep.num}`,
      }))
    }

    res.status(200).json({ title, image, sinopsis, status, tipo, date, genders, episodes })

  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) })
  }
}
