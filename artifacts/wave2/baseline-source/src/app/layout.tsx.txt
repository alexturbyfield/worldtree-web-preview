import type { Metadata, Viewport } from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';
import './v08.css';
import './forest.css';
import './atelier.css';
export const metadata: Metadata = { title: 'Wildloom · Painterly forest explorer', description: 'Grow lush painterly canopies and explore ecological vegetation profiles for procedural worlds.', manifest:'/manifest.webmanifest', icons:{icon:'/icon.svg',apple:'/icon.svg'} };
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#163f35' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
