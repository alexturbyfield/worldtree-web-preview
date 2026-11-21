import Explorer from '@/components/Explorer';
import {Suspense} from 'react';
export default function Page() { return <Suspense fallback={<main className="forest-loading">WorldTree 1.0 · Opening the ecological world map…</main>}><Explorer/></Suspense>; }
