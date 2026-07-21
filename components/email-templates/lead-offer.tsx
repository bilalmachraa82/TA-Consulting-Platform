
import * as React from 'react';

interface LeadOfferTemplateProps {
    leadName: string;
    consultantName?: string;
    bookingUrl: string;
}

export const LeadOfferTemplate: React.FC<LeadOfferTemplateProps> = ({
    leadName,
    consultantName = 'Dra. Ana Silva',
    bookingUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>🎁 Convite Exclusivo para {leadName}</h1>
        <p>O seu projeto tem um elevado potencial de aprovação (Score &gt; 70%).</p>

        <p>Para garantir que maximiza as suas hipóteses, gostaríamos de oferecer uma <strong>sessão de consultoria estratégica de 30 minutos</strong>, totalmente gratuita.</p>

        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
            <h3 style={{ color: '#166534', margin: '0 0 10px 0' }}>Sessão de Estratégia PT2030</h3>
            <p style={{ margin: '0 0 20px 0' }}>Com {consultantName} - Especialista Sénior</p>

            <a
                href={bookingUrl}
                style={{
                    display: 'inline-block',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                }}
            >
                Agendar Minha Sessão Grátis
            </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666' }}>
            Nota: Esta oferta é válida apenas para as próximas 48 horas.
        </p>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
            Eligivo - Especialistas em Incentivos Financeiros
        </p>
    </div>
);
