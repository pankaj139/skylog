/**
 * Public marketing landing page for SkyLog.
 *
 * Renders for unauthenticated visitors at `/`. Uses the same glass / neon visual
 * language as the rest of the app. Authenticated users are routed to the dashboard
 * by the parent route and do not see this page.
 */

import { Link } from 'react-router-dom';
import {
    Plane,
    Globe2,
    Trophy,
    BarChart3,
    MapPinned,
    Sparkles,
    ArrowRight,
} from 'lucide-react';

/** Primary CTA link styles (matches Button primary + lg) */
const ctaPrimaryLg =
    'inline-flex items-center justify-center font-medium rounded-lg px-8 py-4 text-lg gap-2 bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg hover:shadow-neon transition-all duration-200';

/** Primary CTA — compact (matches Button primary + sm) */
const ctaPrimarySm =
    'inline-flex items-center justify-center font-medium rounded-lg px-4 py-2 text-sm bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg hover:shadow-neon transition-all duration-200';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-radial from-dark-surface via-dark-bg to-dark-bg text-white overflow-x-hidden">
            {/* Background accents */}
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                aria-hidden
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,240,255,0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(0,255,255,0.06), transparent)',
                }}
            />

            {/* Top nav */}
            <header className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-dark-bg/40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl" aria-hidden>
                            ✈️
                        </span>
                        <span className="text-lg font-bold gradient-text">SkyLog</span>
                    </Link>
                    <nav className="flex items-center gap-3 sm:gap-4">
                        <a
                            href="#features"
                            className="text-sm text-gray-400 hover:text-neon-cyan transition-colors hidden sm:inline"
                        >
                            Features
                        </a>
                        <Link
                            to="/auth"
                            className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
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
                <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 text-neon-cyan/90 text-sm font-medium mb-6 px-3 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/5">
                            <Sparkles size={16} className="shrink-0" aria-hidden />
                            Your personal flight journal
                        </p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                            Every route you fly,{' '}
                            <span className="gradient-text">remembered beautifully</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
                            Log flights on a 3D globe, track trips with friends and family, see achievements,
                            and understand your travel in one place—built for people who live in the air.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                            <Link to="/auth" className={`${ctaPrimaryLg} w-full sm:w-auto`}>
                                Start logging flights
                                <ArrowRight size={18} aria-hidden />
                            </Link>
                            <a
                                href="#features"
                                className="text-center sm:text-left text-neon-blue hover:text-neon-cyan text-sm font-medium py-3 px-2 transition-colors"
                            >
                                See what&apos;s inside →
                            </a>
                        </div>
                    </div>

                    {/* Decorative mock cards */}
                    <div className="mt-16 sm:mt-20 grid sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Flights logged', value: '—', hint: 'Your history, your data' },
                            { label: 'Countries', value: '—', hint: 'Destinations unlocked' },
                            { label: 'Achievements', value: '—', hint: 'Badges as you explore' },
                        ].map((card) => (
                            <div
                                key={card.label}
                                className="glass rounded-xl p-5 border border-white/10 hover:border-neon-blue/25 transition-colors"
                            >
                                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                                    {card.label}
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                                <div className="text-xs text-gray-500">{card.hint}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="relative z-10 border-t border-white/10 bg-dark-surface/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
                        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for frequent flyers</h2>
                            <p className="text-gray-400 text-lg">
                                Everything you need to capture the story behind each ticket.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Globe2,
                                    title: 'Globe & maps',
                                    description:
                                        'Visualize routes on a 3D globe and 2D maps. Replay your journeys and spot patterns across years.',
                                },
                                {
                                    icon: MapPinned,
                                    title: 'Trips & history',
                                    description:
                                        'Group segments into trips, browse full history, and open detailed journey pages for each flight.',
                                },
                                {
                                    icon: Trophy,
                                    title: 'Achievements',
                                    description:
                                        'Earn badges for milestones—distances, destinations, spending, and those unforgettable repeats.',
                                },
                                {
                                    icon: BarChart3,
                                    title: 'Analytics',
                                    description:
                                        'Break down airlines, geography, carbon, and more. Your data, summarized clearly.',
                                },
                                {
                                    icon: Plane,
                                    title: 'Rich flight records',
                                    description:
                                        'Aircraft, registration, cabin class, seats, INR, points—log what matters to you.',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'Year in review',
                                    description:
                                        'Celebrate each year of travel with highlights, stats, and shareable moments.',
                                },
                            ].map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="glass rounded-xl p-6 border border-white/10 hover:border-neon-blue/30 transition-all hover:shadow-neon/20"
                                >
                                    <div className="w-11 h-11 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-4">
                                        <Icon className="text-neon-cyan" size={22} aria-hidden />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
                    <div className="glass rounded-2xl p-8 sm:p-12 border border-neon-blue/20 text-center bg-gradient-to-br from-neon-blue/5 to-transparent">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready when you are</h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-8">
                            Create a free account and add your first flight in minutes. No credit card required.
                        </p>
                        <Link to="/auth" className={ctaPrimaryLg}>
                            Create your SkyLog
                            <ArrowRight size={18} aria-hidden />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/10 py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span aria-hidden>✈️</span>
                        <span className="gradient-text font-semibold">SkyLog</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/auth" className="hover:text-neon-cyan transition-colors">
                            Sign in
                        </Link>
                        <span className="text-gray-600">·</span>
                        <span>© {new Date().getFullYear()} SkyLog</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
