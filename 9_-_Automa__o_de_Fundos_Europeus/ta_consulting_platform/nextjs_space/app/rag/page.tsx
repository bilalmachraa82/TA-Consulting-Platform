import { RAGChat } from '@/components/rag/RAGChat'
import { checkRAGHealth, listRAGStores } from '@/app/actions/rag'

export const metadata = {
  title: 'RAG - Assistente Portugal 2030',
  description: 'Assistente inteligente para avisos Portugal 2030',
}

export default async function RAGPage() {
  // Check system health
  const health = await checkRAGHealth()
  const stores = await listRAGStores()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assistente Portugal 2030
          </h1>
          <p className="text-gray-600">
            Pergunte sobre avisos, critérios de elegibilidade, e financiamento
          </p>

          {/* System Status */}
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div
              className={`flex items-center space-x-2 ${
                health.status === 'healthy'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  health.status === 'healthy' ? 'bg-green-600' : 'bg-red-600'
                }`}
              ></div>
              <span>
                {health.status === 'healthy' ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="text-gray-500">
              {health.stores_count} store{health.stores_count !== 1 ? 's' : ''}{' '}
              disponível{health.stores_count !== 1 ? 'is' : ''}
            </div>

            <div className="text-gray-500">
              API: {health.gemini_api === 'connected' ? '✓' : '✗'} Gemini
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg" style={{ height: '600px' }}>
          <RAGChat />
        </div>

        {/* Available Stores */}
        {stores.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Stores Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <div
                  key={store.name}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <h3 className="font-medium text-gray-900">
                    {store.display_name}
                  </h3>
                  {store.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {store.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    {store.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Como Usar
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>
                Digite sua pergunta sobre avisos Portugal 2030 (mínimo 10
                caracteres)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>
                O sistema irá procurar nos documentos indexados e retornar uma
                resposta
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>
                Cada resposta inclui citações diretas dos documentos fonte
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>
                A pontuação de confiança indica a certeza da resposta (0-100%)
              </span>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">
              Exemplos de Perguntas
            </h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Quais são os critérios de elegibilidade para PMEs?</li>
              <li>• Qual o montante máximo de financiamento disponível?</li>
              <li>• Quais documentos são necessários para candidatura?</li>
              <li>• Quando termina o prazo de submissão?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
