'use client'

interface Citation {
  id: number
  document: string
  section: string
  page: number | null
  excerpt: string
  confidence: number
  display_text: string
}

interface CitationListProps {
  citations: Citation[]
}

export function CitationList({ citations }: CitationListProps) {
  if (!citations || citations.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Fontes:</h4>
      {citations.map((citation) => (
        <div
          key={citation.id}
          className="text-sm border-l-2 border-blue-500 pl-3 py-1"
        >
          <div className="font-medium">{citation.display_text}</div>
          {citation.excerpt && (
            <div className="text-gray-600 italic mt-1">
              &quot;{citation.excerpt.substring(0, 150)}
              {citation.excerpt.length > 150 ? '...' : ''}&quot;
            </div>
          )}
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
            <span>Confiança: {(citation.confidence * 100).toFixed(0)}%</span>
            {citation.page && <span>Página: {citation.page}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
