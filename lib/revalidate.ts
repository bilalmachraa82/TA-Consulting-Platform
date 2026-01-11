import { revalidateTag, revalidatePath } from 'next/cache';

export function revalidateEmpresas() {
    revalidateTag('empresas');
    revalidatePath('/dashboard/empresas');
    revalidatePath('/api/empresas');
}

export function revalidateAvisos() {
    revalidateTag('avisos');
    revalidatePath('/dashboard/avisos');
    revalidatePath('/api/avisos');
}

export function revalidateCandidaturas() {
    revalidateTag('candidaturas');
    revalidatePath('/dashboard/candidaturas');
    revalidatePath('/api/candidaturas');
}
