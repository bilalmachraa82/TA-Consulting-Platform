
import * as React from 'react';

interface LeadWelcomeTemplateProps {
    leadName: string;
    matchesCount: number;
    topMatchName?: string;
    dashboardUrl: string;
}

export const LeadWelcomeTemplate: React.FC<LeadWelcomeTemplateProps> = ({
    leadName,
    matchesCount,
    topMatchName,
    dashboardUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Olá, {leadName}! 👋</h1>
        <p>Obrigado por usar o nosso Diagnóstico de Fundos UE.</p>

        <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
            <h2 style={{ color: '#0284c7', margin: 0 }}>Encontrámos {matchesCount} oportunidades para si</h2>
            {topMatchName && (
                <p style={{ marginTop: '10px' }}>
                    Principal destaque: <strong>{topMatchName}</strong>
                </p>
            )}
        </div>

        <p>Para ver todos os detalhes e iniciar a sua candidatura, aceda ao seu dashboard:</p>

        <a
            href={dashboardUrl}
            style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                marginTop: '10px'
            }}
        >
            Ver As Minhas Oportunidades &rarr;
        </a>

        <p style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            Precisa de ajuda? A nossa equipa de especialistas está à disposição.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />

        <p style={{ fontSize: '12px', color: '#999' }}>
            Eligivo - Especialistas em Incentivos Financeiros<br />
            © 2025 Eligivo
        </p>
    </div>
);
