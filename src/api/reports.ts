import { api, queryString } from './client'
import type { TopAuthorsReport } from './types'
export function getTopAuthors(year: number) { return api<TopAuthorsReport>(`/reports/top-authors${queryString({ year })}`) }
