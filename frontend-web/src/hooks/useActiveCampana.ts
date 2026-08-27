import { useAuth } from '@/contexts/AuthContext'

/**
 * Casi todos los endpoints del backend (gastos, donaciones, eventos,
 * votantes, segmentos, comunicación) exigen campana_id, pero la app nunca
 * tuvo un selector de campaña -ningún formulario lo enviaba y todo fallaba
 * con 422 "Debe especificar campana_id". Como cada usuario normalmente
 * pertenece a una sola campaña (el array ya viene en /auth/me), se toma la
 * primera como la campaña activa implícita en lugar de construir un
 * selector completo.
 */
export function useActiveCampana() {
  const { user } = useAuth()
  const campana = user?.campanas?.[0]

  return {
    campanaId: campana?.id,
    campana,
    hasCampana: Boolean(campana),
  }
}
