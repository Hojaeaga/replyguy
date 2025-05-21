"use client";

import { useEffect, useState } from 'react';
import type { User } from '../utils/user.type';



export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubscribers() {
            try {
                const response = await fetch('/api/subscribers');

                if (!response.ok) {
                    throw new Error(`Error fetching subscribers: ${response.status}`);
                }

                const data = await response.json();
                setSubscribers(data || []);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load subscribers');
                setLoading(false);
            }
        }

        fetchSubscribers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Subscribers</h1>

            <p className="text-gray-600 mb-4">Total subscribers: <span className="font-medium">{subscribers.length}</span></p>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PFP</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Following</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    No subscribers found
                                </td>
                            </tr>
                        ) : (
                            subscribers.map((subscriber) => (
                                <tr key={subscriber.fid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscriber.fid}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {subscriber.pfp_url ?
                                            <img
                                                src={subscriber.pfp_url}
                                                alt={`${subscriber.username || 'User'}'s avatar`}
                                                className="w-10 h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://via.placeholder.com/40?text=?";
                                                }}
                                            /> :
                                            'N/A'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.follower_count || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {subscriber.following_count || 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 