export default function ApresentacaoV3Minimal() {
    return (
        <div className="min-h-screen bg-white text-slate-900 p-20">
            <h1 className="text-5xl font-bold text-blue-600 mb-8">ConsultancyOS - V3 Test</h1>
            <p className="text-xl text-slate-700">Se vês isto, a página funciona!</p>

            <div className="mt-8 space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h2 className="text-2xl font-bold text-slate-900">Starter - €5.000 + €600/mês</h2>
                    <p className="text-slate-600">8 semanas</p>
                </div>
                <div className="p-4 bg-blue-600 text-white rounded-xl">
                    <h2 className="text-2xl font-bold">Professional - €7.500 + €800/mês</h2>
                    <p className="text-blue-100">10-12 semanas</p>
                </div>
                <div className="p-4 bg-slate-800 text-white rounded-xl">
                    <h2 className="text-2xl font-bold">Premium - €11.000 + €1.000/mês</h2>
                    <p className="text-slate-300">16-20 semanas</p>
                </div>
            </div>
        </div>
    );
}
