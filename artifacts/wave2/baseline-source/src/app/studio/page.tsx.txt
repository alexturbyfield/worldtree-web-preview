import {Suspense} from 'react';
import FoliageStudio from '@/components/FoliageStudio';
import './studio.css';
export const metadata={title:'Wildloom · Foliage Studio prototype'};
export default function Page(){return <Suspense fallback={<main>Opening Foliage Studio…</main>}><FoliageStudio/></Suspense>;}
