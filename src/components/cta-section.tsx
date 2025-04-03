import Link from "next/link";

export function CTASection() {
    return (
        <div className="bg-gradient-to-br from-emerald-900 to-neutral-900 py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to transform your study experience?
                </h2>
                <p className="text-xl text-neutral-300 mb-8 max-w-3xl mx-auto">
                    Join thousands of students who are already using Noter to achieve better grades with less stress.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/signin"
                        className="px-8 py-4 rounded-lg bg-white hover:bg-neutral-100 text-emerald-900 font-medium text-lg transition-colors"
                    >
                        Get Started Free
                    </Link>
                </div>
            </div>
        </div>
    );
}