import Link from "next/link";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export function Footer() {
    const currentYear = new Date().getFullYear();

    // Map social media to their icons
    const socialIcons = [
        { name: 'twitter', icon: <FaTwitter size={16} />, url: 'https://x.com/jayvaliya09' },
        { name: 'linkedin', icon: <FaLinkedin size={16} />, url: 'https://www.linkedin.com/in/jay-valiya/' },
        { name: 'github', icon: <FaGithub size={16} />, url: 'https://github.com/jayvaliya' },
    ];

    return (
        <footer className="bg-black pt-16 pb-12 border-t border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-around md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <Link href="/" className="text-white text-2xl font-bold tracking-tight">
                            Noter
                        </Link>
                        <p className="mt-4 text-neutral-400 max-w-md">
                            A modern platform for students to create, discover, and share high-quality study materials.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            {socialIcons.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-400 hover:text-neutral-300 transition-colors"
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors">
                                        {social.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {['Help Center', 'Contact', 'Privacy', 'Terms'].map((item) => (
                                <li key={item}>
                                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-neutral-400 hover:text-emerald-400 transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8">
                    <p className="text-neutral-500 text-sm text-center">
                        &copy; {currentYear} Noter. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}