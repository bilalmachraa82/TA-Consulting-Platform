
import * as React from 'react';

interface LeadEducationalTemplateProps {
    leadName: string;
    guideUrl: string;
}

export const LeadEducationalTemplate: React.FC<LeadEducationalTemplateProps> = ({
    leadName,
    guideUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>📚 Guia Essencial: Aprovação de Fundos</h1>
        <p>Olá {leadName},</p>
        <p>Sabia que 60% das candidaturas são rejeitadas por erros evitáveis na memória descritiva?</p>

        <p>Preparámos um guia exclusivo com as <strong>5 Estratégias Comprovadas</strong> para aumentar a sua taxa de sucesso no Portugal 2030.</p>

        <ul style={{ lineHeight: '1.6', margin: '20px 0' }}>
            <li>✅ Como alinhar o investimento com os objetivos do aviso</li>
            <li>✅ Erros fatais na análise financeira</li>
            <li>✅ A importância da inovação demonstrada</li>
        </ul>

        <a
            href={guideUrl}
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
            Ler Guia Completo &rarr;
        </a>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
            Eligivo - Especialistas em Incentivos Financeiros
        </p>
    </div>
);
