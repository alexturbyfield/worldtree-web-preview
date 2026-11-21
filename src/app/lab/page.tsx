import {Suspense} from 'react';
import TreeLaboratory from '@/components/TreeLaboratory';
export default function Page(){return <Suspense fallback={<main className="forest-loading">WorldTree 1.0 · Opening the tree atelier…</main>}><TreeLaboratory/></Suspense>;}
