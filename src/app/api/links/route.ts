import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OneTimeLink from '@/models/OneTimeLink';

// Create a new one-time link
export async function POST() {
    try {
        await dbConnect();

        const link = new OneTimeLink({});
        await link.save();

        return NextResponse.json({
            success: true,
            link: {
                id: link._id,
                token: link.token,
                used: link.used,
                createdAt: link.createdAt,
            },
        });
    } catch (error) {
        console.error('Create link error:', error);
        return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }
}

// Get all one-time links
export async function GET() {
    try {
        await dbConnect();
        const links = await OneTimeLink.find({}).sort({ createdAt: -1 }).limit(100);
        return NextResponse.json({ success: true, links });
    } catch (error) {
        console.error('Get links error:', error);
        return NextResponse.json({ error: 'Failed to get links' }, { status: 500 });
    }
}
