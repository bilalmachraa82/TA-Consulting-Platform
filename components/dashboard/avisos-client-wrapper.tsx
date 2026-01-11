'use client';

import { AvisosComponent } from './avisos-component';

export function AvisosClientWrapper(props: any) {
    // Temporary wrapper to satisfy build requirements.
    // Ideally, AvisosComponent should accept initialData for hydration.
    return <AvisosComponent />;
}
