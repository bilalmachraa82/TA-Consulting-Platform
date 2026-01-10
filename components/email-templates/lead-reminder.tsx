
import * as React from 'react';

interface LeadReminderTemplateProps {
    leadName: string;
    daysRemaining: number;
    opportunitiesCount: number;
    dashboardUrl: string;
}

export const LeadReminderTemplate: React.FC<LeadReminderTemplateProps> = ({
    leadName,
    daysRemaining,
    opportunitiesCount,
    dashboardUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>⏰ Destaque para {leadName}</h1>
        <p>Notámos que ainda não avançou com a candidatura para as suas oportunidades.</p>

        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#c2410c' }}>
                As suas {opportunitiesCount} oportunidades identificadas têm prazos a decorrer.
            </p>
        </div>

        <p>Não deixe escapar o financiamento disponível para o seu projeto.</p>

        <a
            href={dashboardUrl}
            style={{
                display: 'inline-block',
                backgroundColor: '#ea580c',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                marginTop: '10px'
            }}
        >
            Ver Prazos no Dashboard &rarr;
        </a>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
            TA Consulting - Especialistas em Incentivos Financeiros
        </p>
    </div>
);
