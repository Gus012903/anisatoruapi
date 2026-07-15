import { api, parser } from '../api.js'
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
    const genders  = html.querySelectorAll('a[href*="/genero/"]').map((g: any) => g.text?.trim()).filter(Boolean)

    // Detalles de la tabla
    const dds  = html.querySelectorAll('dd.text-white.text-right')
    const tipo = dds[0]?.text?.trim() || null
    const date = dds[4]?.text?.trim() || null

    // ID del AJAX para episodios
    const ajaxUrl = html.querySelector('.caplist')?.attributes['data-ajax'] || null
    let episodes: { no: number, id: string }[] = []

    if (ajaxUrl) {
      const ajaxRes  = await fetch(ajaxUrl)
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
