import {Suspense} from 'react';
import ForestExplorer from '@/components/ForestExplorer';
export default function Page(){return <Suspense fallback={<main className="forest-loading">Wildloom 0.1 · Opening the procedural forest explorer…</main>}><ForestExplorer/></Suspense>;}
