'use client'
import { useState } from "react";

export function HowItWorks() {
    const steps = [
        {
            number: "1",
            title: "Create an account",
            description: "Sign up with your university email to join your school's community.",
            icon: "👤",
        },
        {
            number: "2",
            title: "Create or discover",
            description: "Create your own notes or discover quality materials shared by others.",
            icon: "📖",
        },
        {
            number: "3",
            title: "Collaborate",
            description: "Invite classmates to collaborate on shared study materials.",
            icon: "👥",
        },
        {
            number: "4",
            title: "Ace your exams",
            description: "Use your organized notes to prepare for and excel in your exams.",
            icon: "✔️",
        }
    ];

    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    return (
        <div className="bg-neutral-900 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white">How Noter Works</h2>
                    <p className="mt-4 text-xl text-neutral-400 max-w-3xl mx-auto font-light">
                        Get started in minutes and transform how you study.
                    </p>
                </div>

                {/* Mobile view */}
                <div className="block lg:hidden">
                    <div className="space-y-10">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start">
                                <div className="relative mr-6">
                                    {/* Icon Circle */}
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800/50 to-emerald-900/20 border border-emerald-600/50 shadow-lg">
                                        <span className="text-2xl">{step.icon}</span>
                                    </div>

                                    {/* Number Badge at Top Right */}
                                    <div className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
                                        {step.number}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                                    <p className="text-neutral-400">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block">
                    <div className="grid grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col items-center"
                                onMouseEnter={() => setHoveredStep(index)}
                                onMouseLeave={() => setHoveredStep(null)}
                            >
                                <div className="relative">
                                    {/* Icon Circle */}
                                    <div className={`flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-800/50 to-emerald-900/20 border border-emerald-600/50 shadow-lg mb-6 z-10 transition-all duration-300 ${hoveredStep === index ? 'shadow-emerald-400/50 scale-110' : 'shadow-emerald-900/10'}`}>
                                        <span className="text-4xl">{step.icon}</span>
                                    </div>

                                    {/* Number Badge at Top Right */}
                                    <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lg">
                                        {step.number}
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-3 text-center">{step.title}</h3>
                                <p className="text-neutral-400 text-center">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
