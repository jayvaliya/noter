import { BsSearch, BsLaptop, BsPeople } from 'react-icons/bs';

export function FeaturesSection() {
    const features = [
        {
            title: "Find Notes Quickly",
            description: "Search through your notes instantly with our powerful search functionality.",
            icon: <BsSearch className="h-6 w-6" />,
        },
        {
            title: "Study Anywhere",
            description: "Access your notes from any device - desktop, tablet, or mobile.",
            icon: <BsLaptop className="h-6 w-6" />,
        },
        {
            title: "Collaborate with Peers",
            description: "Share notes with classmates and study together more effectively.",
            icon: <BsPeople className="h-6 w-6" />,
        },
        // {
        //     title: "Smart Suggestions",
        //     description: "Get intelligent recommendations based on your study patterns.",
        //     icon: <BsLightbulb className="h-6 w-6" />,
        // },
    ];

    return (
        <div className="bg-neutral-900 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white">Supercharge Your Learning</h2>
                    <p className="mt-4 text-xl text-neutral-400 max-w-3xl mx-auto">
                        Noter gives you all the tools you need to excel in your courses and collaborate with classmates.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-emerald-500/50 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-neutral-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}