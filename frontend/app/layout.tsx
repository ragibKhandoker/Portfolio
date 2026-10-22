import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ragib Ahsan | Portfolio',
  description: 'Data Science, Machine Learning and Full-Stack Development portfolio.'
};

// Runs before paint so the saved (or system) theme is applied without a flash
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body>{children}</body></html>;
}
