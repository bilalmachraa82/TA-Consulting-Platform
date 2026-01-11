'use client';

import { EmpresasComponent } from './empresas-component';

export function EmpresasClientWrapper(props: any) {
    // Temporary wrapper to satisfy build requirements.
    // Ideally, EmpresasComponent should accept initialData for hydration.
    return <EmpresasComponent />;
}
