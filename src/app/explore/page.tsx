import {Suspense} from 'react';
import ForestExplorer from '@/components/ForestExplorer';
export default function Page(){return <Suspense fallback={<main className="forest-loading">WorldTree 1.0 · Opening the procedural forest explorer…</main>}><ForestExplorer/></Suspense>;}
