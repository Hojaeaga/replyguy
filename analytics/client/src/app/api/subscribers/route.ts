import { NextResponse } from 'next/server';
import type { User } from '@/app/utils/user.type';

interface RawUserData {
    fid: number;
    username: string;
    follower_count: number;
    following_count: number;
    pfp_url: string;
    display_name: string;
    [key: string]: unknown;
}

function filterData(data: RawUserData[]): User[] {
    return data.map((user) => ({
        fid: user.fid,
        username: user.username,
        follower_count: user.follower_count,
        following_count: user.following_count,
        pfp_url: user.pfp_url,
        display_name: user.display_name,
    }));
}

export async function GET() {
    // In a real application, this would fetch data from the backend
    // For now, we'll return the mock data

    let response: Response;

    try {
        response = await fetch('https://harmless-ibex-champion.ngrok-free.app/api/subscribers');
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    const data = await response.json() as RawUserData[];
    const filteredData = filterData(data);
    return NextResponse.json(filteredData);
} 