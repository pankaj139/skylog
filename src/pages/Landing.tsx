/**
 * Public marketing landing page for SkyLog.
 *
 * Renders at `/` for unauthenticated visitors (authed users see Dashboard).
 * Interactive sections:
 *   - Animated hero with rotating live-flight ticker
 *   - Live demo card (route auto-cycles)
 *   - Animated counters (IntersectionObserver-driven)
 *   - Interactive feature tabs
 *   - Achievement carousel
 *   - How-it-works stepper
 *   - FAQ accordion
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
    Plane,
    Globe2,
    Trophy,
    BarChart3,
    MapPinned,
    Sparkles,
    ArrowRight,
    Camera,
    Users,
    IndianRupee,
    LineChart,
    Compass,
    CheckCircle2,
    ChevronDown,
    PlayCircle,
    MapPin,
    Calendar,
    Star,
    Zap,
    Route,
} from 'lucide-react';

/** Primary CTA link styles (matches Button primary + lg) */
const ctaPrimaryLg =
    'inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg gap-2 bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg hover:shadow-neon transition-all duration-200';

/** Primary CTA — compact (matches Button primary + sm) */
const ctaPrimarySm =
    'inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg hover:shadow-neon transition-all duration-200';

/** Rotating demo routes used in hero + ticker */
const DEMO_ROUTES = [
    { from: 'DEL', fromCity: 'Delhi', to: 'SFO', toCity: 'San Francisco', airline: 'Air India', no: 'AI 173', km: 12380, dur: '15h 40m', tail: 'VT-ALW', aircraft: 'Boeing 777-300ER' },
    { from: 'BOM', fromCity: 'Mumbai', to: 'LHR', toCity: 'London', airline: 'British Airways', no: 'BA 138', km: 7196, dur: '9h 30m', tail: 'G-STBG', aircraft: 'Boeing 777-300ER' },
    { from: 'BLR', fromCity: 'Bengaluru', to: 'SIN', toCity: 'Singapore', airline: 'Singapore Airlines', no: 'SQ 509', km: 3156, dur: '4h 35m', tail: '9V-SMF', aircraft: 'Airbus A350-900' },
    { from: 'HYD', fromCity: 'Hyderabad', to: 'DXB', toCity: 'Dubai', airline: 'Emirates', no: 'EK 525', km: 2216, dur: '3h 50m', tail: 'A6-EQO', aircraft: 'Boeing 777-300ER' },
    { from: 'MAA', fromCity: 'Chennai', to: 'KUL', toCity: 'Kuala Lumpur', airline: 'Malaysia Airlines', no: 'MH 181', km: 3025, dur: '4h 15m', tail: '9M-MAC', aircraft: 'Airbus A330-300' },
] as const;

/** Feature tab content */
const FEATURE_TABS = [
    {
        id: 'globe',
        label: 'Globe & maps',
        icon: Globe2,
        title: 'See every flight on an interactive 3D globe',
        description:
            'Rotate, zoom and replay your journeys in a living visualization. Switch between 3D globe and 2D maps to spot patterns you never noticed.',
        bullets: ['3D globe + 2D map views', 'Timeline replay of routes', 'Color modes: airline, year, distance'],
    },
    {
        id: 'records',
        label: 'Rich records',
        icon: Plane,
        title: 'Log more than just airports',
        description:
            'Capture the details that make each trip real — cabin class, aircraft type, tail number, seat, PNR, passenger count, INR spent and points redeemed.',
        bullets: ['Aircraft type & registration', 'Seats, class, PNR, notes', 'INR spend + loyalty points'],
    },
    {
        id: 'trips',
        label: 'Trips',
        icon: MapPinned,
        title: 'Group flights into trips that tell a story',
        description:
            'Bundle connecting segments and long trips under one name, add photos, cover images and tags, and share a public trip page.',
        bullets: ['Multi-segment trip grouping', 'Photos & cover images', 'Shareable public trip pages'],
    },
    {
        id: 'achievements',
        label: 'Achievements',
        icon: Trophy,
        title: 'Unlock badges as you explore the world',
        description:
            'Bronze → Platinum tiers across flights, countries, continents, distance, spending and points. Repeat an aircraft tail? There is a badge for that too.',
        bullets: ['Bronze / Silver / Gold / Platinum tiers', 'Spending & points milestones', '"Familiar Airframe" & special badges'],
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        title: 'Understand your travel at a glance',
        description:
            'Airlines, aircraft, geography, carbon footprint — all charted cleanly. See your Year in Review with highlights and shareable stats.',
        bullets: ['Airline & aircraft breakdowns', 'Carbon footprint estimates', 'Year in Review highlights'],
    },
] as const;

/** Achievements previewed in the carousel */
const ACHIEVEMENT_PREVIEW = [
    { icon: '🎫', name: 'First Flight', tier: 'Bronze', desc: 'Log your first flight' },
    { icon: '🌍', name: 'World Traveler', tier: 'Silver', desc: 'Visit 15 different countries' },
    { icon: '🏆', name: 'Nomad', tier: 'Platinum', desc: 'Visit 50 different countries' },
    { icon: '🔁', name: 'Familiar Airframe', tier: 'Silver', desc: 'Fly the same tail number twice' },
    { icon: '₹', name: 'Lakh Club', tier: 'Gold', desc: 'Log ₹1,00,000 in cash spend' },
    { icon: '⚡', name: 'Points Power User', tier: 'Gold', desc: 'Redeem 1,00,000 loyalty points' },
    { icon: '🌙', name: 'To The Moon', tier: 'Platinum', desc: 'Fly 384,400 km total' },
    { icon: '👨‍👩‍👧', name: 'Flying Together', tier: 'Bronze', desc: 'Log a flight with 2+ seats' },
] as const;

/** Tier color mapping (matches app colors) */
const TIER_COLOR: Record<string, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2',
};

/** FAQ data */
const FAQS = [
    {
        q: 'Is SkyLog free?',
        a: 'Yes — you can create an account and log flights without a credit card. Core features like the globe, achievements, trips and analytics are free.',
    },
    {
        q: 'Do I need to upload a CSV?',
        a: 'No. You add flights one at a time with a simple form. Airport, airline and aircraft searches help you fill details fast.',
    },
    {
        q: 'Can I track money and points I spend on flights?',
        a: 'Absolutely. Each flight supports optional INR spend and loyalty points. Totals drive the Spending & Points achievements.',
    },
    {
        q: 'Will my friends be able to see my flights?',
        a: 'Only if you choose to share. Trips can be shared via a public link, and the Social feed highlights activity you opt into.',
    },
    {
        q: 'Does SkyLog estimate my carbon footprint?',
        a: 'Yes. The analytics page estimates CO₂ per flight and shows your overall footprint alongside airline and aircraft breakdowns.',
    },
] as const;

/**
 * Hook: counts up a numeric value when the target element enters the viewport.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   const value = useCountUp(ref, 4479, 1400);
 *   return <div ref={ref}>{value.toLocaleString()}</div>;
 *
 * @param ref - Ref to the element that should trigger the count-up
 * @param target - Final number to count to
 * @param durationMs - Animation duration in milliseconds (default 1200)
 * @returns Current integer value; starts at 0 until the element is visible
 */
function useCountUp(ref: React.RefObject<HTMLElement | null>, target: number, durationMs = 1200): number {
    const [value, setValue] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || startedRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting && !startedRef.current) {
                        startedRef.current = true;
                        const start = performance.now();
                        const tick = (now: number) => {
                            const progress = Math.min(1, (now - start) / durationMs);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            setValue(Math.round(target * eased));
                            if (progress < 1) requestAnimationFrame(tick);
                        };
                        requestAnimationFrame(tick);
                        observer.disconnect();
                    }
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [ref, target, durationMs]);

    return value;
}

/**
 * Hook: exposes a rotating index that advances every `intervalMs`.
 *
 * @param length - Number of items to cycle through
 * @param intervalMs - Rotation interval, default 3500ms
 * @param paused - Pauses rotation while true
 * @returns Current index in [0, length)
 */
function useRotatingIndex(length: number, intervalMs = 3500, paused = false): number {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (paused || length <= 1) return;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % length);
        }, intervalMs);
        return () => window.clearInterval(id);
    }, [length, intervalMs, paused]);
    return index;
}

export default function Landing() {
    const [activeTab, setActiveTab] = useState<(typeof FEATURE_TABS)[number]['id']>('globe');
    const [hoverDemo, setHoverDemo] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const demoIndex = useRotatingIndex(DEMO_ROUTES.length, 4000, hoverDemo);
    const demo = DEMO_ROUTES[demoIndex];

    // Stats counters
    const airportsRef = useRef<HTMLDivElement>(null);
    const airlinesRef = useRef<HTMLDivElement>(null);
    const achievementsRef = useRef<HTMLDivElement>(null);
    const countriesRef = useRef<HTMLDivElement>(null);

    const airportsCount = useCountUp(airportsRef, 4479);
    const airlinesCount = useCountUp(airlinesRef, 900);
    const achievementsCount = useCountUp(achievementsRef, 40);
    const countriesCount = useCountUp(countriesRef, 195);

    const activeTabDef = useMemo(
        () => FEATURE_TABS.find((t) => t.id === activeTab) ?? FEATURE_TABS[0],
        [activeTab]
    );

    return (
        <div className="min-h-screen bg-gradient-radial from-dark-surface via-dark-bg to-dark-bg text-white overflow-x-hidden">
            {/* Background accents */}
            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(0,240,255,0.18), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 20%, rgba(0,255,255,0.08), transparent 60%), radial-gradient(ellipse 50% 40% at 0% 60%, rgba(183,148,244,0.08), transparent 60%)',
                }}
            />
            {/* Subtle grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.06]"
                aria-hidden
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                }}
            />

            {/* Top nav */}
            <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-dark-bg/60 sticky top-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden>
                            ✈️
                        </span>
                        <span className="text-lg font-bold gradient-text">SkyLog</span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <a href="#features" className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                            Features
                        </a>
                        <a href="#achievements" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                            Achievements
                        </a>
                        <a href="#how" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                            How it works
                        </a>
                        <a href="#faq" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                            FAQ
                        </a>
                        <Link to="/auth" className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                            Sign in
                        </Link>
                        <Link to="/auth" className={ctaPrimarySm}>
                            Get started
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-20">
                    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 text-neon-cyan/95 text-xs sm:text-sm font-medium mb-6 px-3 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/5 animate-pulse-neon">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75 animate-ping" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
                                </span>
                                <Sparkles size={14} aria-hidden />
                                The flight journal built for frequent flyers
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.05] mb-6">
                                Every route you fly,{' '}
                                <span className="gradient-text">remembered beautifully</span>
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed mb-8 max-w-xl">
                                Log flights on a 3D globe, group them into trips, track INR and points you spend, and
                                unlock achievements as you explore — all in one fast, private journal.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-8">
                                <Link to="/auth" className={`${ctaPrimaryLg} w-full sm:w-auto`}>
                                    Start logging flights
                                    <ArrowRight size={18} aria-hidden />
                                </Link>
                                <a
                                    href="#demo"
                                    className="inline-flex items-center justify-center gap-2 text-gray-200 hover:text-white text-sm font-medium py-3 px-4 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 transition-colors"
                                >
                                    <PlayCircle size={18} aria-hidden />
                                    See live demo
                                </a>
                            </div>

                            {/* Quick value props */}
                            <ul className="grid grid-cols-2 gap-2 text-sm max-w-lg">
                                {[
                                    'No CSV uploads needed',
                                    '3D globe visualization',
                                    'INR & points tracking',
                                    '40+ achievements',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle2 size={16} className="text-neon-cyan shrink-0" aria-hidden />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Live demo card */}
                        <div
                            id="demo"
                            className="relative"
                            onMouseEnter={() => setHoverDemo(true)}
                            onMouseLeave={() => setHoverDemo(false)}
                        >
                            <DemoFlightCard demo={demo} index={demoIndex} total={DEMO_ROUTES.length} />
                        </div>
                    </div>

                    {/* Live ticker */}
                    <Ticker />
                </section>

                {/* Stats */}
                <section className="relative z-10 border-y border-white/10 bg-dark-surface/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard
                            refEl={airportsRef}
                            value={airportsCount}
                            suffix="+"
                            label="Airports in database"
                            icon={MapPin}
                        />
                        <StatCard
                            refEl={airlinesRef}
                            value={airlinesCount}
                            suffix="+"
                            label="Airlines supported"
                            icon={Plane}
                        />
                        <StatCard
                            refEl={countriesRef}
                            value={countriesCount}
                            label="Countries you can visit"
                            icon={Globe2}
                        />
                        <StatCard
                            refEl={achievementsRef}
                            value={achievementsCount}
                            suffix="+"
                            label="Achievements to unlock"
                            icon={Trophy}
                        />
                    </div>
                </section>

                {/* Interactive feature tabs */}
                <section id="features" className="relative z-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Built for people who live in the air
                            </h2>
                            <p className="text-gray-400 text-base sm:text-lg">
                                Explore each capability — hover or tap a tab.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {FEATURE_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const active = tab.id === activeTab;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        onMouseEnter={() => setActiveTab(tab.id)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                                            active
                                                ? 'bg-neon-blue/15 border-neon-blue/50 text-white shadow-neon'
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                                        }`}
                                        aria-pressed={active}
                                    >
                                        <Icon size={16} aria-hidden />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab content */}
                        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-stretch">
                            <div
                                key={activeTabDef.id}
                                className="glass rounded-2xl p-6 sm:p-8 border border-white/10 animate-fade-in"
                            >
                                <h3 className="text-2xl font-bold mb-3 text-white">{activeTabDef.title}</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">{activeTabDef.description}</p>
                                <ul className="space-y-3">
                                    {activeTabDef.bullets.map((b) => (
                                        <li key={b} className="flex items-start gap-3 text-gray-200">
                                            <CheckCircle2 size={18} className="text-neon-cyan shrink-0 mt-0.5" aria-hidden />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contextual visual */}
                            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden min-h-[280px] flex items-center justify-center">
                                <TabVisual id={activeTabDef.id} />
                            </div>
                        </div>

                        {/* Secondary features grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                            {[
                                { icon: Camera, title: 'Photos', desc: 'Attach photos to flights and trips.' },
                                { icon: Users, title: 'Together', desc: 'Log seats for family & friends.' },
                                { icon: IndianRupee, title: 'Spend in INR', desc: 'Track cash per flight.' },
                                { icon: Star, title: 'Points', desc: 'Log loyalty points redeemed.' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="glass rounded-xl p-5 border border-white/10 hover:border-neon-blue/30 transition-colors">
                                    <Icon className="text-neon-cyan mb-3" size={20} aria-hidden />
                                    <h4 className="text-white font-semibold mb-1">{title}</h4>
                                    <p className="text-sm text-gray-400">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Achievements carousel */}
                <section id="achievements" className="relative z-10 border-t border-white/10 bg-dark-surface/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                            <div className="max-w-xl">
                                <h2 className="text-3xl sm:text-4xl font-bold mb-3">Earn badges as you explore</h2>
                                <p className="text-gray-400 text-base sm:text-lg">
                                    Over 40 achievements across destinations, distance, aircraft, spending and points.
                                </p>
                            </div>
                            <Link
                                to="/auth"
                                className="inline-flex items-center gap-2 text-neon-cyan hover:text-white transition-colors text-sm font-medium"
                            >
                                Start unlocking
                                <ArrowRight size={16} aria-hidden />
                            </Link>
                        </div>

                        <AchievementsMarquee />
                    </div>
                </section>

                {/* How it works */}
                <section id="how" className="relative z-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Set up in under a minute</h2>
                            <p className="text-gray-400 text-base sm:text-lg">Three quick steps, no spreadsheets.</p>
                        </div>
                        <ol className="grid md:grid-cols-3 gap-6 relative">
                            {/* Connector line */}
                            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" aria-hidden />
                            {[
                                {
                                    icon: Zap,
                                    title: 'Create your account',
                                    desc: 'Sign up with Google or email. Free, no credit card.',
                                },
                                {
                                    icon: Plane,
                                    title: 'Log a flight',
                                    desc: 'Pick airports, airline, aircraft — add INR, points, photos if you want.',
                                },
                                {
                                    icon: Trophy,
                                    title: 'Watch it come alive',
                                    desc: 'Routes appear on the globe, analytics update, achievements unlock.',
                                },
                            ].map(({ icon: Icon, title, desc }, idx) => (
                                <li key={title} className="relative glass rounded-2xl p-6 border border-white/10 hover:border-neon-blue/30 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative w-12 h-12 rounded-full bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                                            <Icon className="text-neon-cyan" size={20} aria-hidden />
                                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-dark-bg border border-neon-blue/40 text-[11px] font-bold text-neon-cyan flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-semibold text-lg">{title}</h3>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="relative z-10 border-t border-white/10 bg-dark-surface/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by people who love flying</h2>
                            <p className="text-gray-400 text-base sm:text-lg">
                                What early users say about SkyLog.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    quote:
                                        "Finally a clean way to remember every route. The 3D globe is ridiculously satisfying.",
                                    name: 'Aarav Mehta',
                                    role: 'Product designer',
                                },
                                {
                                    quote:
                                        "I love that I can track INR and points per flight. My spend-vs-miles insights are spot on.",
                                    name: 'Priya Sharma',
                                    role: 'Management consultant',
                                },
                                {
                                    quote:
                                        "Unlocking the 'Familiar Airframe' badge when I flew the same tail number was so cool.",
                                    name: 'Rahul Iyer',
                                    role: 'Aviation geek',
                                },
                            ].map((t) => (
                                <figure key={t.name} className="glass rounded-2xl p-6 border border-white/10 hover:border-neon-blue/30 transition-all">
                                    <div className="flex gap-1 mb-3" aria-label="5 star rating">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={14} className="fill-neon-cyan text-neon-cyan" aria-hidden />
                                        ))}
                                    </div>
                                    <blockquote className="text-gray-200 leading-relaxed mb-4">“{t.quote}”</blockquote>
                                    <figcaption className="text-sm">
                                        <div className="text-white font-medium">{t.name}</div>
                                        <div className="text-gray-500">{t.role}</div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="relative z-10">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Frequently asked</h2>
                            <p className="text-gray-400">Everything you might want to know before signing up.</p>
                        </div>
                        <div className="space-y-3">
                            {FAQS.map((f, i) => {
                                const open = openFaq === i;
                                return (
                                    <div
                                        key={f.q}
                                        className={`glass rounded-xl border transition-colors ${open ? 'border-neon-blue/40' : 'border-white/10 hover:border-white/20'}`}
                                    >
                                        <button
                                            onClick={() => setOpenFaq(open ? null : i)}
                                            className="w-full flex items-center justify-between gap-4 p-5 text-left"
                                            aria-expanded={open}
                                        >
                                            <span className="text-white font-medium">{f.q}</span>
                                            <ChevronDown
                                                size={18}
                                                className={`text-gray-400 transition-transform ${open ? 'rotate-180 text-neon-cyan' : ''}`}
                                                aria-hidden
                                            />
                                        </button>
                                        <div
                                            className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="px-5 pb-5 text-gray-400 leading-relaxed">{f.a}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Big CTA */}
                <section className="relative z-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
                        <div className="glass rounded-2xl p-8 sm:p-12 border border-neon-blue/30 text-center bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-cyan/5 relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-40 pointer-events-none"
                                aria-hidden
                                style={{
                                    backgroundImage:
                                        'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(0,240,255,0.25), transparent 60%)',
                                }}
                            />
                            <div className="relative">
                                <h2 className="text-2xl sm:text-4xl font-bold mb-4">
                                    Ready to map your sky?
                                </h2>
                                <p className="text-gray-400 max-w-xl mx-auto mb-8">
                                    Create a free SkyLog account, add your first flight in under a minute, and watch your
                                    world come together.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                                    <Link to="/auth" className={ctaPrimaryLg}>
                                        Create your SkyLog
                                        <ArrowRight size={18} aria-hidden />
                                    </Link>
                                    <a href="#features" className="text-gray-300 hover:text-white text-sm font-medium px-4 py-3 transition-colors">
                                        Explore features first →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/10 py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span aria-hidden>✈️</span>
                        <span className="gradient-text font-semibold">SkyLog</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <a href="#features" className="hover:text-neon-cyan transition-colors">Features</a>
                        <a href="#achievements" className="hover:text-neon-cyan transition-colors">Achievements</a>
                        <a href="#faq" className="hover:text-neon-cyan transition-colors">FAQ</a>
                        <Link to="/auth" className="hover:text-neon-cyan transition-colors">Sign in</Link>
                        <span className="text-gray-600">·</span>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/**
 * Animated stat card with IntersectionObserver-driven counter.
 *
 * @param refEl - Ref attached to the card (trigger for the counter)
 * @param value - Current animated value
 * @param label - Caption shown under the number
 * @param icon - Lucide icon component
 * @param suffix - Optional suffix appended after the number (e.g. "+")
 */
function StatCard({
    refEl,
    value,
    label,
    icon: Icon,
    suffix = '',
}: {
    refEl: React.RefObject<HTMLDivElement | null>;
    value: number;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    suffix?: string;
}) {
    return (
        <div
            ref={refEl}
            className="glass rounded-xl p-5 border border-white/10 text-center hover:border-neon-blue/30 transition-colors"
        >
            <Icon className="text-neon-cyan mx-auto mb-2" size={20} />
            <div className="text-3xl sm:text-4xl font-extrabold tabular-nums gradient-text">
                {value.toLocaleString()}
                {suffix}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 mt-1">{label}</div>
        </div>
    );
}

/**
 * Renders the rotating demo flight card used in the hero.
 *
 * @param demo - One of DEMO_ROUTES entries to show
 * @param index - Current index for the progress dots
 * @param total - Total number of demos
 */
function DemoFlightCard({
    demo,
    index,
    total,
}: {
    demo: (typeof DEMO_ROUTES)[number];
    index: number;
    total: number;
}): ReactNode {
    return (
        <div className="relative glass rounded-2xl p-6 sm:p-7 border border-white/10 shadow-neon/30 overflow-hidden">
            {/* Corner tag */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-neon-cyan/90 bg-neon-blue/10 border border-neon-blue/30 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                Live preview
            </div>

            <div className="flex items-center gap-3 mb-5">
                <div className="text-2xl">🛫</div>
                <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500">Flight</div>
                    <div className="text-white font-semibold text-sm">
                        {demo.airline} · {demo.no}
                    </div>
                </div>
            </div>

            {/* Route with animated plane */}
            <div key={index} className="relative py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white">{demo.from}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{demo.fromCity}</div>
                    </div>
                    <div className="flex-1 mx-3 sm:mx-5 relative h-8">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-neon-blue/40 via-neon-cyan to-neon-blue/40" />
                        <Plane
                            className="absolute top-1/2 -translate-y-1/2 text-neon-cyan"
                            size={18}
                            aria-hidden
                            style={{ left: 0, animation: 'landing-plane 4s ease-in-out infinite' }}
                        />
                    </div>
                    <div className="text-right">
                        <div className="text-3xl sm:text-4xl font-extrabold text-white">{demo.to}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{demo.toCity}</div>
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Detail icon={Route} label="Distance" value={`${demo.km.toLocaleString()} km`} />
                <Detail icon={Calendar} label="Duration" value={demo.dur} />
                <Detail icon={Plane} label="Aircraft" value={demo.aircraft} />
                <Detail icon={Compass} label="Tail" value={demo.tail} />
            </div>

            {/* Rotation dots */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
                {Array.from({ length: total }).map((_, i) => (
                    <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                            i === index ? 'w-6 bg-neon-cyan' : 'w-1.5 bg-white/20'
                        }`}
                    />
                ))}
            </div>

            <style>{`
                @keyframes landing-plane {
                    0% { left: 0%; transform: translate(-50%, -50%) rotate(0deg); opacity: 0.5; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: 100%; transform: translate(-50%, -50%) rotate(0deg); opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}

/**
 * Small detail tile used inside the demo flight card.
 */
function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <div className="text-white text-sm font-medium truncate">{value}</div>
        </div>
    );
}

/**
 * Scrolling live-flight-style ticker shown below the hero.
 */
function Ticker() {
    const items = [
        { from: 'DEL', to: 'SFO', airline: 'AI' },
        { from: 'BOM', to: 'LHR', airline: 'BA' },
        { from: 'BLR', to: 'SIN', airline: 'SQ' },
        { from: 'MAA', to: 'KUL', airline: 'MH' },
        { from: 'HYD', to: 'DXB', airline: 'EK' },
        { from: 'CCU', to: 'BKK', airline: 'TG' },
        { from: 'GOI', to: 'AUH', airline: 'EY' },
        { from: 'AMD', to: 'DOH', airline: 'QR' },
        { from: 'COK', to: 'MCT', airline: 'WY' },
        { from: 'PNQ', to: 'CDG', airline: 'AF' },
    ];
    const doubled = [...items, ...items];

    return (
        <div className="relative mt-14 sm:mt-16 overflow-hidden border-y border-white/10 bg-dark-bg/40">
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-dark-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-dark-bg to-transparent z-10 pointer-events-none" />
            <div className="flex gap-8 py-3 whitespace-nowrap animate-[landing-ticker_40s_linear_infinite]">
                {doubled.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="text-neon-cyan font-mono text-xs">{it.airline}</span>
                        <span className="font-semibold text-white">{it.from}</span>
                        <Plane size={14} className="text-gray-500" aria-hidden />
                        <span className="font-semibold text-white">{it.to}</span>
                        <span className="text-gray-600">•</span>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes landing-ticker {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

/**
 * Contextual illustration shown in the feature tabs panel.
 */
function TabVisual({ id }: { id: string }) {
    switch (id) {
        case 'globe':
            return <GlobeVisual />;
        case 'records':
            return <RecordVisual />;
        case 'trips':
            return <TripsVisual />;
        case 'achievements':
            return <BadgesVisual />;
        case 'analytics':
            return <AnalyticsVisual />;
        default:
            return null;
    }
}

function GlobeVisual() {
    return (
        <div className="relative w-full h-64 flex items-center justify-center">
            <div className="relative w-52 h-52 rounded-full bg-gradient-to-br from-neon-blue/20 via-dark-surface to-dark-bg border border-neon-blue/30 animate-[landing-spin_18s_linear_infinite] shadow-neon">
                <div className="absolute inset-3 rounded-full border border-white/10" />
                <div className="absolute inset-6 rounded-full border border-white/10" />
                <div className="absolute inset-10 rounded-full border border-white/10" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
            </div>
            {/* Route arcs */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
                <defs>
                    <linearGradient id="arcGrad" x1="0" x2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
                <path d="M40,120 Q100,30 160,100" fill="none" stroke="url(#arcGrad)" strokeWidth="1.2" strokeDasharray="2 3">
                    <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.6s" repeatCount="indefinite" />
                </path>
                <path d="M50,90 Q100,160 160,70" fill="none" stroke="url(#arcGrad)" strokeWidth="1.2" strokeDasharray="2 3">
                    <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.2s" repeatCount="indefinite" />
                </path>
            </svg>
            <style>{`
                @keyframes landing-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function RecordVisual() {
    return (
        <div className="w-full space-y-3">
            {[
                { label: 'Airline', value: 'Singapore Airlines' },
                { label: 'Aircraft', value: 'A350-900' },
                { label: 'Registration', value: '9V-SMF' },
                { label: 'Class', value: 'Business' },
                { label: 'Paid (INR)', value: '₹1,42,500' },
                { label: 'Points', value: '75,000 pts' },
            ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs uppercase tracking-wider text-gray-500">{row.label}</span>
                    <span className="text-sm text-white font-medium">{row.value}</span>
                </div>
            ))}
        </div>
    );
}

function TripsVisual() {
    return (
        <div className="w-full space-y-4">
            <div className="text-sm text-gray-400">Japan trip · 8 nights</div>
            <div className="relative pl-5">
                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-neon-blue/40" />
                {[
                    { route: 'BLR → SIN', airline: 'SQ 509', day: 'Day 1' },
                    { route: 'SIN → NRT', airline: 'SQ 638', day: 'Day 1' },
                    { route: 'NRT → KIX', airline: 'NH 3821', day: 'Day 5' },
                    { route: 'KIX → BLR', airline: 'SQ 619', day: 'Day 9' },
                ].map((seg, i) => (
                    <div key={i} className="flex items-center gap-3 mb-3">
                        <span className="relative z-10 w-3 h-3 rounded-full bg-neon-cyan shadow-neon -ml-5" />
                        <div className="flex-1 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                            <div>
                                <div className="text-white text-sm font-medium">{seg.route}</div>
                                <div className="text-xs text-gray-500">{seg.airline}</div>
                            </div>
                            <span className="text-xs text-gray-400">{seg.day}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BadgesVisual() {
    const badges = [
        { icon: '🎫', tier: 'Bronze' },
        { icon: '✈️', tier: 'Silver' },
        { icon: '🌍', tier: 'Silver' },
        { icon: '🏆', tier: 'Gold' },
        { icon: '💎', tier: 'Platinum' },
        { icon: '🔁', tier: 'Silver' },
    ];
    return (
        <div className="grid grid-cols-3 gap-3 w-full">
            {badges.map((b, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border"
                    style={{ borderColor: `${TIER_COLOR[b.tier]}55` }}
                >
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${TIER_COLOR[b.tier]}33, transparent)`,
                            border: `2px solid ${TIER_COLOR[b.tier]}`,
                            boxShadow: `0 0 18px ${TIER_COLOR[b.tier]}55`,
                        }}
                    >
                        {b.icon}
                    </div>
                    <span className="text-[11px]" style={{ color: TIER_COLOR[b.tier] }}>
                        {b.tier}
                    </span>
                </div>
            ))}
        </div>
    );
}

function AnalyticsVisual() {
    const bars = [40, 72, 55, 88, 60, 95, 48];
    return (
        <div className="w-full">
            <div className="flex items-end gap-3 h-40">
                {bars.map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-neon-blue/70 to-neon-cyan/90"
                        style={{
                            height: `${h}%`,
                            animation: `landing-bar 900ms ease-out ${i * 60}ms both`,
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-gray-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span key={d}>{d}</span>
                ))}
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
                <LineChart size={16} className="text-neon-cyan" aria-hidden />
                <span>Weekly flight volume</span>
            </div>
            <style>{`
                @keyframes landing-bar {
                    from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
                    to { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/**
 * Horizontally scrolling achievement marquee (two rows for density).
 */
function AchievementsMarquee() {
    const row1 = [...ACHIEVEMENT_PREVIEW, ...ACHIEVEMENT_PREVIEW];
    const row2 = [...ACHIEVEMENT_PREVIEW.slice().reverse(), ...ACHIEVEMENT_PREVIEW.slice().reverse()];

    return (
        <div className="space-y-4">
            <MarqueeRow items={row1} duration="45s" />
            <MarqueeRow items={row2} duration="55s" reverse />
            <style>{`
                @keyframes landing-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes landing-marquee-reverse {
                    from { transform: translateX(-50%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

function MarqueeRow({
    items,
    duration,
    reverse = false,
}: {
    items: readonly (typeof ACHIEVEMENT_PREVIEW)[number][];
    duration: string;
    reverse?: boolean;
}) {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-dark-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-dark-bg to-transparent z-10 pointer-events-none" />
            <div
                className="flex gap-4 whitespace-nowrap"
                style={{
                    animation: `${reverse ? 'landing-marquee-reverse' : 'landing-marquee'} ${duration} linear infinite`,
                }}
            >
                {items.map((a, i) => (
                    <div
                        key={`${a.name}-${i}`}
                        className="flex items-center gap-3 glass rounded-xl px-4 py-3 border"
                        style={{ borderColor: `${TIER_COLOR[a.tier]}55`, minWidth: 260 }}
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{
                                background: `linear-gradient(135deg, ${TIER_COLOR[a.tier]}33, transparent)`,
                                border: `2px solid ${TIER_COLOR[a.tier]}`,
                            }}
                        >
                            {a.icon}
                        </div>
                        <div>
                            <div className="text-white text-sm font-semibold">{a.name}</div>
                            <div className="text-xs text-gray-400">{a.desc}</div>
                        </div>
                        <span
                            className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                                color: TIER_COLOR[a.tier],
                                border: `1px solid ${TIER_COLOR[a.tier]}66`,
                            }}
                        >
                            {a.tier}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
