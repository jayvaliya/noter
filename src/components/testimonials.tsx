export function Testimonials() {
    const testimonials = [
        {
            content: "Noter has completely transformed how I study. The ability to collaborate with classmates on shared notes has been a game-changer for my grades.",
            author: "Alex Johnson",
            role: "Computer Science, Stanford University"
        },
        {
            content: "I love how easy it is to find high-quality notes from students who've taken the same courses. It's helped me understand difficult concepts so much faster.",
            author: "Maya Patel",
            role: "Business Administration, NYU"
        },
        {
            content: "The AI study assistant helps me create better study materials and quizzes. I've improved my grades significantly since I started using Noter.",
            author: "James Wilson",
            role: "Biology, University of Michigan"
        }
    ];

    return (
        <div className="bg-gradient-to-b from-neutral-900 via-neutral-900 to-black py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white">What Students Say</h2>
                    <p className="mt-4 text-xl text-neutral-400 max-w-3xl mx-auto">
                        Join thousands of students already improving their grades with Noter.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-neutral-800/30 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 relative"
                        >
                            <div className="absolute -top-4 -left-4 text-5xl text-emerald-500/40">{`"`}</div>
                            <p className="text-neutral-300 mb-6 relative z-10">{testimonial.content}</p>
                            <div>
                                <p className="text-white font-medium">{testimonial.author}</p>
                                <p className="text-neutral-400 text-sm">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}