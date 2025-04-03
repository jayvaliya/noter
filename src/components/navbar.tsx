"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Import React Icons
import { FiUser, FiMenu, FiX } from "react-icons/fi"; // Feather icons for minimal style

// Define routes in a single place
const navigationRoutes = [
    { name: "Home", path: "/" },
    { name: "Notes", path: "/notes" },
];

export function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAuthenticated = status === "authenticated";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleSignIn = () => {
        router.push('/signin');
    };

    const handleSignOut = async () => {
        try {
            setIsProfileDropdownOpen(false);
            await signOut({ redirect: true, callbackUrl: '/' });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleProfileClick = () => {
        router.push('/profile');
        setIsProfileDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-neutral-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-white text-xl font-bold tracking-tight">
                            Noter
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-1">
                            {navigationRoutes.map((route) => (
                                <Link
                                    key={route.path}
                                    href={route.path}
                                    className="text-neutral-300 hover:text-white hover:bg-neutral-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    {route.name}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="relative ml-4" ref={dropdownRef}>
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors"
                                    >
                                        {session?.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "Profile"}
                                                width={36}
                                                height={36}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FiUser className="h-5 w-5 text-white" />
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-neutral-800 ring-1 ring-black ring-opacity-5 divide-y divide-neutral-700">
                                            <div className="py-1">
                                                <div className="px-4 py-2 text-sm text-neutral-300">
                                                    <p className="font-medium truncate">{session?.user?.name}</p>
                                                    <p className="text-xs text-neutral-400 truncate">{session?.user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 transition-colors"
                                                >
                                                    Profile
                                                </button>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleSignIn}
                                    className="ml-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors focus:outline-none"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <FiMenu className="block h-6 w-6" />
                            ) : (
                                <FiX className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800/60">
                        {navigationRoutes.map((route) => (
                            <Link
                                key={route.path}
                                href={route.path}
                                className="text-neutral-300 hover:text-white hover:bg-neutral-800/50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                            >
                                {route.name}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="mt-2 px-3 py-2">
                                <div className="flex items-center space-x-3 mb-2">
                                    {session?.user?.image ? (
                                        <div className="h-8 w-8 rounded-full overflow-hidden">
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "Profile"}
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center">
                                            <FiUser className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="text-neutral-300 text-sm font-medium truncate">
                                            {session?.user?.name}
                                        </p>
                                        <p className="text-neutral-400 text-xs truncate">
                                            {session?.user?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button
                                        onClick={handleProfileClick}
                                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleSignIn}
                                className="mt-2 w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-base font-medium transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}