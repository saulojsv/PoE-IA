import { useEffect, useMemo, useState } from 'react'
import type { BuildData, ItemDetail } from '../types/build'
import { loadDashboardData } from './poe-data'

export function usePoeBundle() {
  const [bundle, setBundle] = useState<{ data: BuildData; sprites: Record<string, string>; baseMods: any } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { loadDashboardData().then(setBundle).catch(() => setError('Não foi possível carregar o dataset local. Abra pelo launcher da dashboard.')) }, [])
  const itemCatalog = useMemo(() => {
    const items = new Map<string, ItemDetail>()
    bundle?.data.builds.forEach(build => build.item_details.forEach(item => items.set(`${item.name}|${item.base}`, item)))
    return Array.from(items.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [bundle])
  return { bundle, error, itemCatalog }
}
