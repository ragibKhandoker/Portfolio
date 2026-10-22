'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Lenis from 'lenis';
import type { IconType } from 'react-icons';
import { FaJava } from 'react-icons/fa';
import { SiAngular, SiC, SiCplusplus, SiCss3, SiDjango, SiFlask, SiFlutter, SiGit, SiHtml5, SiJavascript, SiMongodb, SiMysql, SiNextdotjs, SiNodedotjs, SiNpm, SiPostgresql, SiPostman, SiPython, SiPytorch, SiReact, SiScikitlearn, SiTensorflow, SiVercel } from 'react-icons/si';
import { TbBrain, TbBrandCSharp, TbBrandVscode, TbCode, TbDatabase, TbLayout, TbServer, TbTool } from 'react-icons/tb';
import { ArrowRight, Download, Github, GraduationCap, Linkedin, Mail, MapPin, Menu, Moon, Rocket, Send, Sun, X } from 'lucide-react';

type Project = { id: number; title: string; description: string; technologies: string[]; project_url?: string; github_url?: string };
type Skill = { id: number; name: string; category: string };
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const initialProjects: Project[] = [
  { id: 1, title: 'Breast Cancer Detection (ML)', description: 'A comparative study of machine-learning models with a web-based implementation.', technologies: ['Python', 'TensorFlow', 'React'] },
  { id: 2, title: 'ShareMeal', description: 'A food donation and distribution platform designed to connect communities.', technologies: ['React', 'Node.js', 'PostgreSQL'] },
  { id: 3, title: 'Data Analysis Dashboard', description: 'Exploratory data analysis and visualization of real-world datasets.', technologies: ['Python', 'Pandas', 'Matplotlib'] },
  { id: 4, title: 'Personal Portfolio', description: 'A responsive portfolio with a premium dark interface.', technologies: ['Next.js', 'TypeScript', 'CSS'] }
];
const initialSkills: Skill[] = [
  { id: 1, name: 'JavaScript', category: 'Languages' }, { id: 2, name: 'C', category: 'Languages' }, { id: 3, name: 'C++', category: 'Languages' }, { id: 4, name: 'Python', category: 'Languages' }, { id: 5, name: 'Java', category: 'Languages' }, { id: 6, name: 'C#', category: 'Languages' }, { id: 7, name: 'HTML5', category: 'Languages' }, { id: 8, name: 'CSS3', category: 'Languages' },
  { id: 9, name: 'React', category: 'Frontend' }, { id: 10, name: 'Next.js', category: 'Frontend' }, { id: 11, name: 'Angular', category: 'Frontend' }, { id: 12, name: 'Flutter', category: 'Frontend' },
  { id: 13, name: 'Node.js', category: 'Backend' }, { id: 14, name: 'Django', category: 'Backend' }, { id: 15, name: 'Flask', category: 'Backend' },
  { id: 16, name: 'PostgreSQL', category: 'Database' }, { id: 17, name: 'MySQL', category: 'Database' }, { id: 18, name: 'MongoDB', category: 'Database' },
  { id: 19, name: 'scikit-learn', category: 'ML & Research' }, { id: 20, name: 'TensorFlow', category: 'ML & Research' }, { id: 21, name: 'PyTorch', category: 'ML & Research' },
  { id: 22, name: 'Git/GitHub', category: 'Tools' }, { id: 23, name: 'VS Code', category: 'Tools' }, { id: 24, name: 'npm', category: 'Tools' }, { id: 25, name: 'Postman', category: 'Tools' }, { id: 26, name: 'Vercel/Netlify', category: 'Tools' }
];

// Typed one after another in the hero; untyped text stays as invisible placeholder so the layout doesn't jump
const heroText = ['HELLO, I AM', 'Khandoker Md.', 'Ragib ', 'Ahsan'];
// One role is typed after the name each cycle, rotating through the list
const roles = ['I am a Data Scientist', 'I am a Machine Learning Engineer', 'I am a Full Stack Developer'];
const CYCLE_MS = 10000 / 3; // 3 times every 10 seconds
const CHAR_MS = 40;

// Decorative technology backdrops, one style per section. All geometry is fixed data, so server and client markup match.
type Point = [number, number];
// Circuit-board traces in a 1000x600 box, kept near the edges so they never sit behind the text
const traces: Point[][] = [
  [[0, 90], [160, 90], [200, 130], [340, 130]], [[0, 180], [90, 180], [130, 220], [130, 330]],
  [[60, 600], [60, 480], [110, 430], [230, 430]], [[0, 530], [180, 530], [220, 570], [400, 570]],
  [[1000, 60], [860, 60], [820, 100], [700, 100]], [[1000, 160], [920, 160], [880, 200], [880, 290]],
  [[1000, 470], [880, 470], [840, 510], [700, 510]], [[420, 0], [420, 40], [460, 80], [560, 80]],
  [[640, 600], [640, 570], [680, 540], [790, 540]], [[1000, 360], [950, 360], [950, 420]]
];
const tracePath = (pts: Point[]) => 'M' + pts.map(p => p.join(' ')).join('L');

// A loose "data network": nodes joined to their near neighbours
const netNodes: Point[] = [[60, 80], [180, 40], [140, 200], [300, 120], [260, 300], [80, 380], [200, 520], [380, 470],
  [620, 60], [760, 130], [880, 50], [940, 220], [820, 300], [960, 420], [860, 540], [700, 470], [560, 560], [480, 250]];
const netEdges = netNodes.flatMap((a, i) => netNodes.slice(i + 1).filter(b => Math.hypot(a[0] - b[0], a[1] - b[1]) < 200).map(b => [a, b]));

// Floating code glyphs: [text, left %, top %, font size px, delay s]
type Glyph = [string, number, number, number, number];
const glyphs: Record<string, Glyph[]> = {
  home: [['</>', 4, 18, 26, 0], ['AI', 44, 8, 20, -2], ['{ }', 6, 74, 24, -4], ['ML', 50, 84, 18, -1], ['01', 36, 62, 16, -3],
    ['∑', 94, 14, 26, -5], ['λ', 92, 84, 24, -2.5], ['SQL', 70, 6, 15, -6], ['=>', 28, 80, 18, -1.5], ['py', 2, 48, 18, -3.5]],
  about: [['def', 5, 14, 18, 0], ['import', 88, 14, 16, -2], ['[ ]', 46, 84, 22, -4], ['#', 94, 60, 24, -1], ['()', 3, 80, 20, -3],
    ['//', 56, 6, 20, -5], ['git', 90, 82, 16, -2.5]],
  projects: [['API', 4, 14, 18, 0], ['JSON', 90, 14, 16, -2], ['fetch()', 6, 82, 15, -4], ['200 OK', 86, 84, 15, -1],
    ['<div>', 48, 12, 16, -3], ['npm run', 44, 86, 14, -5]]
};

const backdrops: Record<string, { grid?: boolean; dots?: boolean; circuit?: boolean; network?: boolean }> = {
  home: { grid: true, circuit: true }, about: { dots: true }, skills: { circuit: true }, projects: { grid: true }, contact: { dots: true, network: true }
};

// Positions are in the 1000x600 drawing box, converted to percentages of the section
function TechDot({ at: [x, y], delay }: { at: Point; delay: number }) {
  return <span className="tech-dot" style={{ left: `${x / 10}%`, top: `${y / 6}%`, animationDelay: `${delay}s` }}/>;
}

function TechBackdrop({ variant }: { variant: string }) {
  const { grid, dots, circuit, network } = backdrops[variant];
  return <div className={`tech-bg tech-${variant}`} aria-hidden="true">
    {grid && <div className="tech-grid"/>}
    {dots && <div className="tech-dots"/>}
    {/* Lines are static SVG stretched to the section; only the glowing HTML dots animate (GPU-friendly, keeps scrolling smooth) */}
    {circuit && <>
      <svg className="tech-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">{traces.map((t, i) => <path key={i} d={tracePath(t)}/>)}</svg>
      {traces.map((t, i) => <TechDot key={i} at={t[t.length - 1]} delay={-i * 0.6}/>)}
    </>}
    {network && <>
      <svg className="tech-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">{netEdges.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}/>)}</svg>
      {netNodes.map((n, i) => <TechDot key={i} at={n} delay={-i * 0.37}/>)}
    </>}
    {glyphs[variant]?.map(([text, left, top, size, delay]) => <span key={text} className="glyph" style={{ left: `${left}%`, top: `${top}%`, fontSize: size, animationDelay: `${delay}s` }}>{text}</span>)}
  </div>;
}

// About section: education timeline, most recent first
const education: { level: string; school: string; period?: string }[] = [
  { level: 'Bachelor of Science in Computer Science (B.Sc. CS)', school: 'BRAC University', period: 'Expected Dec 2026' },
  { level: 'Higher Secondary Certificate (HSC)', school: 'Cantonment Public School and College, Saidpur' },
  { level: 'Secondary School Certificate (SSC)', school: 'Adarsha High School, Birampur' }
];

// About section: an editor window showing a small Python class describing me, with hand-rolled syntax colours
const str = (v: string) => <span className="tk-str">&quot;{v}&quot;</span>;
const list = (items: string[]) => <>[{items.map((v, i) => <span key={v}>{i > 0 && ', '}{str(v)}</span>)}]</>;
const self = <span className="tk-self">self</span>;
const field = (name: string, value: React.ReactNode) => <div className="ind2">{self}.{name} = {value}</div>;

function AboutCode() {
  return <div className="code-float"><div className="code-card">
    <div className="code-head"><span className="dot red"/><span className="dot yellow"/><span className="dot green"/><span className="code-file">about_me.py</span></div>
    <pre className="code-body"><code>
      <div><span className="tk-kw">class</span> <span className="tk-cls">Developer</span>:</div>
      <div className="ind1"><span className="tk-kw">def</span> <span className="tk-fn">__init__</span>({self}):</div>
      {field('name', str('Khandoker Md. Ragib Ahsan'))}
      {field('role', str('Data Scientist & ML Engineer'))}
      {field('education', str('B.Sc. CS @ BRAC University'))}
      {field('location', str('Bangladesh'))}
      {field('languages', list(['Python', 'JavaScript', 'SQL']))}
      {field('ml_stack', list(['TensorFlow', 'Pandas']))}
      {field('web_stack', list(['React', 'Node.js', 'PostgreSQL']))}
      {field('tools', list(['Git', 'Docker', 'VS Code']))}
      <div className="blank"/>
      <div className="ind1"><span className="tk-kw">def</span> <span className="tk-fn">build</span>({self}, <span className="tk-param">idea</span>):</div>
      <div className="ind2"><span className="tk-kw">return</span> <span className="tk-str">f&quot;Turning {'{'}<span className="tk-param">idea</span>{'}'} into real solutions&quot;</span></div>
      <div className="blank"/>
      <div className="tk-cmt"># Let&apos;s connect and build something great!</div>
      <div>me = <span className="tk-cls">Developer</span>()</div>
      <div><span className="tk-fn">print</span>(me.<span className="tk-fn">build</span>({str('data-driven products')}))<i className="caret code-caret"/></div>
    </code></pre>
    <div className="code-badge"><Rocket size={18}/> Open to Opportunities</div>
  </div></div>;
}

// Kept in its own component so the typing ticks re-render only this text, not the whole page (keeps scrolling smooth)
function HeroIntro() {
  const [anim, setAnim] = useState({ cycle: 0, typed: 0 });

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setAnim({ cycle: 0, typed: Infinity }); return; }
    // Each cycle: type the name, then one role, then hold until the next cycle starts. Paused while the hero is off screen.
    const start = performance.now();
    let visible = true;
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    observer.observe(document.getElementById('home')!);
    const timer = setInterval(() => {
      if (!visible) return;
      const elapsed = performance.now() - start;
      const next = { cycle: Math.floor(elapsed / CYCLE_MS), typed: Math.floor((elapsed % CYCLE_MS) / CHAR_MS) };
      setAnim(prev => prev.cycle === next.cycle && prev.typed === next.typed ? prev : next);
    }, 30);
    return () => { clearInterval(timer); observer.disconnect(); };
  }, []);

  // Part i of the hero text: typed letters, the blinking caret while it is being typed (or at the very end), then the hidden rest
  const heroParts = [...heroText, roles[anim.cycle % roles.length]];
  const heroLength = heroParts.join('').length;
  function typedPart(i: number) {
    const text = heroParts[i];
    const offset = heroParts.slice(0, i).join('').length;
    const shown = Math.max(0, Math.min(anim.typed - offset, text.length));
    const typing = anim.typed < heroLength ? anim.typed - offset >= 0 && shown < text.length : i === heroParts.length - 1;
    return <>{text.slice(0, shown)}{typing && <i className="caret"/>}<span className="ghost">{text.slice(shown)}</span></>;
  }

  return <>
    <span className="eyebrow" aria-label="Hello, I am">✦ &nbsp; <span aria-hidden="true">{typedPart(0)}</span></span>
    <h1 aria-label="Khandoker Md. Ragib Ahsan"><span aria-hidden="true"><small>{typedPart(1)}</small> {typedPart(2)}<span className="accent">{typedPart(3)}</span></span></h1>
    <p className="role"><span className="sr-only">{roles.join('. ')}</span><span aria-hidden="true">{typedPart(4)}</span></p>
  </>;
}

// Skills: category order and heading icons, plus a brand icon (and brand colour) per technology.
// Brands whose logo is black/white use the text colour so they stay visible in both themes.
const skillCategories: [string, IconType][] = [['Languages', TbCode], ['Frontend', TbLayout], ['Backend', TbServer], ['Database', TbDatabase], ['ML & Research', TbBrain], ['Tools', TbTool]];
const skillIcons: Record<string, [IconType, string?]> = {
  JavaScript: [SiJavascript, '#f7df1e'], C: [SiC, '#5c6bc0'], 'C++': [SiCplusplus, '#00599c'], Python: [SiPython, '#3776ab'], Java: [FaJava, '#f89820'],
  'C#': [TbBrandCSharp, '#9b4f96'], HTML5: [SiHtml5, '#e34f26'], CSS3: [SiCss3, '#1572b6'],
  React: [SiReact, '#61dafb'], 'Next.js': [SiNextdotjs], Angular: [SiAngular, '#dd0031'], Flutter: [SiFlutter, '#54c5f8'],
  'Node.js': [SiNodedotjs, '#5fa04e'], Django: [SiDjango, '#44b78b'], Flask: [SiFlask],
  PostgreSQL: [SiPostgresql, '#4169e1'], MySQL: [SiMysql, '#00758f'], MongoDB: [SiMongodb, '#47a248'],
  'scikit-learn': [SiScikitlearn, '#f7931e'], TensorFlow: [SiTensorflow, '#ff6f00'], PyTorch: [SiPytorch, '#ee4c2c'],
  'Git/GitHub': [SiGit, '#f05032'], 'VS Code': [TbBrandVscode, '#007acc'], npm: [SiNpm, '#cb3837'], Postman: [SiPostman, '#ff6c37'], 'Vercel/Netlify': [SiVercel]
};

const sections = [['Home', 'home'], ['About', 'about'], ['Skills', 'skills'], ['Projects', 'projects'], ['Contact', 'contact']];

// Header + side dots. Own component so the active-section highlight re-renders only the navigation, not the page
function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // The inline script in layout.tsx has already applied the saved theme before paint
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
  }

  // Highlight the nav item of the section that fills most of the screen
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(([, id]) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return <>
    <header className="topbar">
      <a className="brand" href="#home"><span className="brand-mark">RA</span>Portfolio</a>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>{sections.map(([label, id]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <div className="topbar-actions">
        <button suppressHydrationWarning className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
        <a className="button button-small" href="/resume.pdf" download aria-label="Download Resume"><span className="resume-label">Download Resume</span> <Download size={14}/></a>
        <button suppressHydrationWarning className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>

    <nav className="page-dots" aria-label="Section navigation">{sections.map(([label, id]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-label={label}><span>{label}</span></a>)}</nav>
  </>;
}

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [skills, setSkills] = useState(initialSkills);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`${API}/portfolio/projects`).then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setProjects(d.data)).catch(() => {});
    fetch(`${API}/portfolio/skills`).then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setSkills(d.data)).catch(() => {});
  }, []);

  // Smooth inertial scrolling, and 1.8s eased scrolls when clicking in-page links (#about, #skills, ...)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, autoRaf: true });
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function onClick(e: MouseEvent) {
      const link = (e.target as Element).closest?.('a[href^="#"]');
      const target = link && document.getElementById(link.getAttribute('href')!.slice(1));
      if (!target) return;
      e.preventDefault();
      history.pushState(null, '', link.getAttribute('href'));
      const topbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar')) || 0;
      const fromBelow = target.getBoundingClientRect().top > topbar;
      window.dispatchEvent(new CustomEvent('section-nav', { detail: { target, fromBelow } }));
      lenis.scrollTo(target, { offset: -topbar, duration: 1.8, easing: easeInOutCubic });
    }
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('click', onClick); lenis.destroy(); };
  }, []);

  // Background animations only run while their section is on screen
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting)));
    document.querySelectorAll('.tech-bg').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Headings, text and cards float into place: from below when scrolling down, from above when scrolling up. A whole
  // section reveals in sequence when it reaches the middle of the screen, a single element once it is clearly on screen,
  // and a section reached from a nav link as the scroll arrives. Everything resets once fully off screen.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const revealSelector = '.hero-description, .hero-buttons, .hero-copy > .socials, .hero-art, .kicker, .page:not(.hero) h2, .lead, .page:not(.hero) .muted-text, .info-card, .code-card, .skill-group, .project-card, .section-heading .text-link, .contact-line, .contact-grid .socials, .contact-form';
    const reveal = (els: HTMLElement[], fromBelow: boolean) => els.filter(el => !el.classList.contains('in')).forEach((el, i) => {
      el.style.setProperty('--reveal-from', fromBelow ? '60px' : '-60px');
      el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 0.08}s`);
      el.classList.add('in');
    });
    const fromBelow = (e: IntersectionObserverEntry) => e.boundingClientRect.top > (e.rootBounds?.top ?? 0);

    const pages = [...document.querySelectorAll<HTMLElement>('.page')];
    const items = new Map(pages.map(page => [page, [...page.querySelectorAll<HTMLElement>(revealSelector)]]));
    const tall = (page: HTMLElement) => page.offsetHeight > innerHeight * 1.15;

    // A section reached by clicking a nav link is revealed as the 1.8s scroll arrives, not as it passes the middle
    let pending: Element | null = null, pendingTimer = 0;
    function onNav(e: Event) {
      const { target, fromBelow } = (e as CustomEvent<{ target: HTMLElement; fromBelow: boolean }>).detail;
      if (!items.has(target)) return;
      clearTimeout(pendingTimer);
      pending = target;
      pendingTimer = window.setTimeout(() => { pending = null; reveal(items.get(target)!, fromBelow); }, 1100);
    }
    window.addEventListener('section-nav', onNav);

    const bySection = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting && !tall(e.target as HTMLElement) && e.target !== pending) reveal(items.get(e.target as HTMLElement)!, fromBelow(e));
    }), { rootMargin: '-45% 0px -45% 0px' });
    const byElement = new IntersectionObserver(entries => {
      // Anything clearly on screen shows even if its section never reaches the middle (wheel stopped between sections, tall sections)
      const shown = entries.filter(e => e.isIntersecting && (e.target as HTMLElement).closest('.page') !== pending);
      if (shown.length) reveal(shown.map(e => e.target as HTMLElement), fromBelow(shown[0]));
    }, { rootMargin: '-10% 0px -15% 0px' });
    // The 1px inset makes "just touching the screen edge" count as off screen
    const hide = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) e.target.classList.remove('in');
    }), { rootMargin: '-1px 0px -1px 0px' });

    items.forEach((els, page) => {
      bySection.observe(page);
      els.forEach(el => { el.classList.add('reveal'); byElement.observe(el); hide.observe(el); });
    });
    return () => { bySection.disconnect(); byElement.disconnect(); hide.disconnect(); window.removeEventListener('section-nav', onNav); clearTimeout(pendingTimer); };
  }, []);

  async function submitContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSending(true); setStatus('');
    try {
      const response = await fetch(`${API}/portfolio/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Message could not be sent.');
      setStatus('Message sent successfully!'); setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Message could not be sent.');
    } finally { setSending(false); }
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((groups, s) => { (groups[s.category] ||= []).push(s); return groups; }, {});
  // Known categories first in a fixed order, anything new from the database after them
  const skillGroups = [...skillCategories.map(([c]) => c), ...Object.keys(grouped).filter(c => !skillCategories.some(([k]) => k === c))]
    .filter(c => grouped[c]).map(c => [c, grouped[c]] as const);

  return <main>
    <Navigation/>

    <section className="page hero" id="home">
      <TechBackdrop variant="home"/>
      <div className="section-wrap hero-inner">
        <div className="hero-copy">
          <HeroIntro/>
          <p className="hero-description">I build data-driven solutions and web applications that create real impact. I enjoy Machine Learning, Data Science, and building scalable web systems.</p>
          <div className="hero-buttons"><a className="button" href="#projects">View My Projects <ArrowRight size={16}/></a><a className="button button-outline" href="#contact">Contact Me <Mail size={15}/></a></div>
          <div className="socials"><a href="https://github.com/" aria-label="GitHub" target="_blank" rel="noreferrer"><Github/></a><a href="https://linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin/></a><a href="mailto:ragibahsan@gmail.com" aria-label="Email"><Mail/></a></div>
        </div>
        <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="portrait"><img src="/profile.png" alt="Khandoker Md. Ragib Ahsan" width={435} height={551}/></div><div className="floating-card"><span>✳</span><p>Turning Data<br/>into Insights<br/>and Ideas into<br/>Real Solutions.</p><b>⌁⌁⌁⌁⌁</b></div><div className="tech-floater"><span>Python</span><span>TensorFlow</span><span>React</span><span>Node.js</span><span>PostgreSQL</span></div></div>
      </div>
    </section>

    <section className="page" id="about">
      <TechBackdrop variant="about"/>
      <div className="section-wrap about-grid">
        <div>
          <p className="kicker">01 / ABOUT ME</p>
          <h2>A little bit about me</h2>
          <div className="about-text">
            <p className="lead">I&apos;m a <mark>Computer Science</mark> student at <mark>BRAC University</mark>. I enjoy exploring <mark>data</mark>, building <mark>intelligent systems</mark>, and creating user-friendly <mark>web applications</mark> that solve real-world problems.</p>
            <p className="muted-text">My work covers the whole journey of a data product: collecting and cleaning data, finding patterns through analysis and visualisation, training and evaluating machine-learning models, and then putting them in people&apos;s hands through fast, responsive web apps built with React, Next.js and Node.js. I love learning new tools, writing clean and maintainable code, and working with teams to turn ideas into products that make a real difference.</p>
          </div>
          <div className="info-card">
            <h3><GraduationCap size={16}/>Education</h3>
            <ol className="edu-list">{education.map(({ level, school, period }) => <li key={level}><div className="edu-top"><strong>{level}</strong>{period && <em>{period}</em>}</div><span>{school}</span></li>)}</ol>
          </div>
        </div>
        <AboutCode/>
      </div>
    </section>

    <section className="page" id="skills">
      <TechBackdrop variant="skills"/>
      <div className="section-wrap">
        <div className="page-heading"><p className="kicker">02 / MY SKILLS</p><h2>Technologies I work with</h2><p className="muted-text">A toolkit spanning data science, machine learning and full-stack development.</p></div>
        <div className="skill-groups">{skillGroups.map(([category, items]) => {
          const CategoryIcon = skillCategories.find(([c]) => c === category)?.[1] ?? TbCode;
          return <div className="skill-group" key={category}>
            <h3><CategoryIcon size={18}/>{category}</h3>
            <div className="skill-list">{items.map(s => {
              const [Icon, color] = skillIcons[s.name] ?? [];
              return <span className="skill-chip" key={s.id}>{Icon ? <Icon size={18} style={color ? { color } : undefined}/> : <b>{s.name.slice(0, 1)}</b>}{s.name}</span>;
            })}</div>
          </div>;
        })}</div>
      </div>
    </section>

    <section className="page" id="projects">
      <TechBackdrop variant="projects"/>
      <div className="section-wrap">
        <div className="section-heading"><div><p className="kicker">03 / SELECTED WORK</p><h2>Featured Projects</h2></div><a className="text-link" href="https://github.com/" target="_blank" rel="noreferrer">View GitHub <ArrowRight size={15}/></a></div>
        <div className="project-grid">{projects.map((p, i) => <article className="project-card" key={p.id}><div className={`project-art art-${i % 4}`}><span>{['◫', '✳', '⌁', '</>'][i % 4]}</span><small>PROJECT / 0{i + 1}</small></div><div className="project-body"><h3>{p.title}</h3><p>{p.description}</p><div className="tags">{p.technologies?.map(t => <span key={t}>{t}</span>)}</div><div className="project-links">{p.project_url && <a href={p.project_url} target="_blank" rel="noreferrer">Live Demo ↗</a>}{p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer">Source Code ↗</a>}{!p.project_url && !p.github_url && <small>Set project URLs in Supabase</small>}</div></div></article>)}</div>
      </div>
    </section>

    <section className="page contact-page" id="contact">
      <TechBackdrop variant="contact"/>
      <div className="section-wrap contact-grid">
        <div>
          <p className="kicker">04 / GET IN TOUCH</p><h2>Let's work together</h2>
          <p className="lead">Open to internship opportunities, collaborations, or a friendly chat.</p>
          <a className="contact-line" href="mailto:ragibahsan@gmail.com"><Mail size={18}/><span><small>Email</small>ragibahsan@gmail.com</span></a>
          <div className="contact-line"><MapPin size={18}/><span><small>Location</small>Bangladesh</span></div>
          <div className="socials"><a href="https://github.com/" aria-label="GitHub" target="_blank" rel="noreferrer"><Github/></a><a href="https://linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin/></a></div>
        </div>
        <form className="contact-form" onSubmit={submitContact}><div className="form-row"><input suppressHydrationWarning placeholder="Your name" aria-label="Your name" minLength={2} maxLength={100} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><input suppressHydrationWarning type="email" placeholder="Email address" aria-label="Email address" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div><input suppressHydrationWarning placeholder="Subject (optional)" aria-label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}/><textarea suppressHydrationWarning placeholder="Your message..." aria-label="Your message" minLength={10} maxLength={5000} required rows={7} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}/><button suppressHydrationWarning className="button" disabled={sending}>{sending ? 'Sending…' : 'Send Message'} <Send size={14}/></button>{status && <small role="status" className="status">{status}</small>}</form>
      </div>
      <footer className="footer section-wrap"><a className="brand" href="#home"><span className="brand-mark">RA</span>Ragib Ahsan</a><span>Designed with intention. Built with curiosity.</span><a className="text-link" href="#home">Back to top ↑</a></footer>
    </section>
  </main>;
}
