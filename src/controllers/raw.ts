import type { Controller } from '../types.d.js'

export const FembedRaw: Controller = async (_, res) => {
  res.status(410).json({ 
    error: 'Este endpoint ya no está disponible. Usa /ver/:id para obtener los servidores de video.' 
  })
}
