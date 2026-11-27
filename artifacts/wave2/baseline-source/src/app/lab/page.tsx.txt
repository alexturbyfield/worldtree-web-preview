import {Suspense} from 'react';
import TreeLaboratory from '@/components/TreeLaboratory';
export default function Page(){return <Suspense fallback={<main className="forest-loading">Wildloom 0.1 · Opening the tree atelier…</main>}><TreeLaboratory/></Suspense>;}
