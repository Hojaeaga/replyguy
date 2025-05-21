"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-md dark:bg-gray-800">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
                            Analytics Dashboard
                        </Link>
                    </div>

                    <div className="flex space-x-4">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/subscribers"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/subscribers'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            Subscribers
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
} 