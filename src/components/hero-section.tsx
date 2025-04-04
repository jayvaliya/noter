import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
    return (
        <div className="relative overflow-hidden">
            {/* Background gradient with blur effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-neutral-900 to-neutral-900 z-0"></div>

            {/* Optional particle or grid overlay effect */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center z-10 opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-20">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                                Study smarter, <span className="text-emerald-400">together</span>
                            </h1>
                            <p className="text-xl text-neutral-300 leading-relaxed">
                                Create, discover and share high-quality study materials with fellow students.
                                Ace your exams with the power of collaborative learning.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/notes"
                                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-center"
                            >
                                Explore Notes
                            </Link>
                            <Link
                                href="/signin"
                                className="px-6 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors text-center"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="w-full aspect-[4/3] relative rounded-xl overflow-hidden shadow-xl shadow-emerald-900/20">
                            {/* Main hero image of students collaborating */}
                            <Image
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                                alt="Students collaborating on study materials"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-emerald-700/30"></div>
                        </div>

                        {/* Floating cards effect */}
                        <div className="absolute -bottom-6 -left-6 w-40 h-32 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-lg transform rotate-6 hidden md:block overflow-hidden">
                            <div className="absolute inset-0.5 bg-neutral-900 rounded-lg overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
                                    alt="Study notes"
                                    fill
                                    className="object-cover opacity-70"
                                />
                                <div className="absolute bottom-1 left-1 right-1 p-1 bg-neutral-900/80 rounded">
                                    <span className="text-emerald-400 font-mono text-xs block text-center">Study notes</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-6 -right-6 w-36 h-28 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-lg transform -rotate-3 hidden md:block overflow-hidden">
                            <div className="absolute inset-0.5 bg-neutral-900 rounded-lg overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80"
                                    alt="Flashcards"
                                    fill
                                    className="object-cover opacity-70"
                                />
                                <div className="absolute bottom-1 left-1 right-1 p-1 bg-neutral-900/80 rounded">
                                    <span className="text-emerald-400 font-mono text-xs block text-center">Flashcards</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}