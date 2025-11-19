import { SimuladorFinanceiro } from '@/components/dashboard/simulador-financeiro';

export default function SimuladorPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Simulador Financeiro</h1>
                    <p className="text-muted-foreground">
                        Validação de viabilidade económica e elegibilidade financeira com IA.
                    </p>
                </div>
            </div>

            <SimuladorFinanceiro />
        </div>
    );
}
