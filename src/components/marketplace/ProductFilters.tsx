'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  slug: string
  name_vi: string
  name_en: string
  icon?: string
}

interface Props {
  categories: Category[]
  activeCategory?: string
  dppOnly: boolean
  activeSort: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'M\u1EDBi nh\u1EA5t' },
  { value: 'price_asc', label: 'Gi\u00E1 t\u0103ng d\u1EA7n' },
  { value: 'price_dsc', label: 'Gi\u00E1 gi\u1EA3m d\u1EA7n' },
  { value: 'rating', label: '\u0110\u00E1nh gi\u00E1 cao' },
  { value: 'bestsell', label: 'B\u00E1n ch\u1EA1y' },
  { value: 'discount', label: 'Gi\u1EA3m gi\u00E1 nhi\u1EC1u' },
]

export default function ProductFilters({ categories, activeCategory, dppOnly, activeSort }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/marketplace?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Danh m\u1EE5c</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateParam('category', null)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                !activeCategory ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              T\u1EA5t c\u1EA3
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeCategory === cat.slug ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.icon && <span className="mr-2">{cat.icon}</span>}
                {cat.name_vi}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">S\u1EAFp x\u1EBFp</h3>
        <ul className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                onClick={() => updateParam('sort', opt.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeSort === opt.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* DPP Filter */}
      <div>
        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={dppOnly}
            onChange={(e) => updateParam('dpp', e.target.checked ? 'true' : null)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Ch\u1EC9 s\u1EA3n ph\u1EA9m DPP</span>
        </label>
      </div>
    </div>
  )
}
