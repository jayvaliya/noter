"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMenu, FiX, FiSettings } from "react-icons/fi";
import { BsGlobe, BsLightning, BsCollection, BsBookmarks } from "react-icons/bs";
import { RouteItem } from "@/types";

export function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);

    const isAuthenticated = status === "authenticated";

    // Define routes object
    const routes: RouteItem[] = [
        {
            path: "/explore",
            label: "Explore",
            icon: BsGlobe,
            requiresAuth: false
        },
        {
            path: "/notes",
            label: "My Notes",
            icon: BsCollection,
            requiresAuth: true
        },
        {
            path: "/bookmarks",
            label: "Bookmarks",
            icon: BsBookmarks,
            requiresAuth: true
        }
    ];

    // Filter routes based on authentication status
    const filteredRoutes = routes.filter(route =>
        !route.requiresAuth || (route.requiresAuth && isAuthenticated)
    );

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleSignIn = () => {
        setIsMenuOpen(false); // Close mobile menu
        router.push('/signin');
    };

    const handleSignOut = async () => {
        try {
            setIsProfileDropdownOpen(false);
            setIsMenuOpen(false); // Close mobile menu
            await signOut({ redirect: true, callbackUrl: '/' });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleProfileClick = () => {
        if (session?.user?.id) {
            setIsMenuOpen(false); // Close mobile menu
            router.push("/profile/" + session.user.id);
        } else {
            setIsMenuOpen(false); // Close mobile menu
            router.push('/profile');
        }
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
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-black/70 backdrop-blur-lg border-b border-emerald-500/10 shadow-md shadow-emerald-500/5"
            : "bg-black/40 backdrop-blur-md border-b border-neutral-800/60"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand with conditional link */}
                    <div className="flex-shrink-0">
                        {isAuthenticated ? (
                            <Link
                                href="/explore"
                                className="group flex items-center"
                            >
                                <div className="relative w-8 h-8 mr-2 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center overflow-hidden shadow-lg">
                                    <span className="text-white text-lg font-bold">N</span>
                                    <div className="absolute inset-0 bg-gradient-to-tl from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <span className="text-white text-xl font-bold tracking-tight bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                    Noter
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                className="group flex items-center"
                            >
                                <div className="relative w-8 h-8 mr-2 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center overflow-hidden shadow-lg">
                                    <span className="text-white text-lg font-bold">N</span>
                                    <div className="absolute inset-0 bg-gradient-to-tl from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <span className="text-white text-xl font-bold tracking-tight bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                    Noter
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-1">
                            {/* Map through routes for desktop menu */}
                            {filteredRoutes.map((route) => (
                                <Link
                                    key={route.path}
                                    href={route.path}
                                    className={`text-zinc-300 hover:text-white hover:bg-zinc-800/60 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${pathname === route.path
                                        ? 'bg-zinc-800/80 text-white ring-1 ring-emerald-500/20'
                                        : ''
                                        }`}
                                >
                                    <route.icon className="inline-block mr-1.5 -mt-0.5" />
                                    {route.label}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="relative ml-4" ref={dropdownRef}>
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="group h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 shadow-md shadow-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all duration-200"
                                    >
                                        {session?.user?.image ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name || "Profile"}
                                                    width={36}
                                                    height={36}
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/20 rounded-full transition-all duration-200"></div>
                                            </div>
                                        ) : (
                                            <FiUser className="h-5 w-5 text-white" />
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isProfileDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-xl bg-zinc-800/90 backdrop-blur-lg ring-1 ring-black/5 ring-inset divide-y divide-zinc-700/50"
                                            >
                                                <div className="px-4 py-3">
                                                    <p className="text-sm font-medium text-white">
                                                        {session?.user?.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                                        {session?.user?.email}
                                                    </p>
                                                </div>
                                                <div className="py-1">
                                                    <button
                                                        onClick={handleProfileClick}
                                                        className="group w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/70 flex items-center transition-colors"
                                                    >
                                                        <span className="bg-zinc-700 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white p-1.5 rounded-md mr-3 transition-colors">
                                                            <FiUser className="h-4 w-4" />
                                                        </span>
                                                        Profile
                                                    </button>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="group w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/70 flex items-center transition-colors"
                                                    >
                                                        <span className="bg-zinc-700 text-rose-400 group-hover:bg-rose-500 group-hover:text-white p-1.5 rounded-md mr-3 transition-colors">
                                                            <FiSettings className="h-4 w-4" />
                                                        </span>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSignIn}
                                    className="ml-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95"
                                >
                                    <BsLightning className="inline-block mr-1.5 -mt-0.5" />
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800/80">
                            {/* Map through routes for mobile menu */}
                            {filteredRoutes.map((route) => (
                                <Link
                                    key={`mobile-${route.path}`}
                                    href={route.path}
                                    className={`flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-zinc-800/90 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${pathname === route.path ? 'bg-zinc-800 text-white' : ''
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="bg-zinc-800 p-2 rounded-md">
                                        <route.icon className="h-5 w-5 text-emerald-400" />
                                    </span>
                                    {route.label}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="mt-3 border-t border-zinc-800 pt-3 px-3">
                                    <div className="flex items-center space-x-3 mb-3">
                                        {session?.user?.image ? (
                                            <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-zinc-700">
                                                <Image
                                                    src={session.user.image}
                                                    alt={session.user.name || "Profile"}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center ring-2 ring-zinc-700">
                                                <FiUser className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">
                                                {session?.user?.name}
                                            </p>
                                            <p className="text-zinc-400 text-xs">
                                                {session?.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <button
                                            onClick={handleProfileClick}
                                            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md"
                                        >
                                            <FiUser className="h-4 w-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-rose-500/20"
                                        >
                                            <FiSettings className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSignIn}
                                    className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 text-white px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center justify-center"
                                >
                                    <BsLightning className="mr-2" />
                                    Sign In
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}