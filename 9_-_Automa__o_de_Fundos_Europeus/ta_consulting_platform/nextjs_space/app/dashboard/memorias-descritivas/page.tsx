import { Suspense } from 'react';
import { MemoriasDescritivasComponent } from '@/components/dashboard/memorias-descritivas-component';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Memórias Descritivas | TA Consulting',
  description: 'Geração automática de memórias descritivas com IA',
};

function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600">A carregar memórias descritivas...</p>
      </div>
    </div>
  );
}

export default function MemoriasDescritivasPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Memórias Descritivas</h1>
        <p className="text-muted-foreground">
          Geração automática de memórias descritivas com IA de última geração (Claude 4.5 Sonnet)
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MemoriasDescritivasComponent />
      </Suspense>
    </div>
  );
}
