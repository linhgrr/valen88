import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OneTimeLink from '@/models/OneTimeLink';

// Validate token (check if valid and unused)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // Start db connection and params resolution in parallel (async-parallel)
        const [, { token }] = await Promise.all([
            dbConnect(),
            params
        ]);

        const link = await OneTimeLink.findOne({ token });

        if (!link) {
            return NextResponse.json({ error: 'Link not found', valid: false }, { status: 404 });
        }

        if (link.used) {
            return NextResponse.json({ error: 'Link already used', valid: false, used: true }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            valid: true,
            link: {
                id: link._id,
                token: link.token,
                used: link.used,
                createdAt: link.createdAt,
            },
        });
    } catch (error) {
        console.error('Validate link error:', error);
        return NextResponse.json({ error: 'Failed to validate link' }, { status: 500 });
    }
}

// Mark link as used (called after card creation)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // Start all async operations in parallel (async-parallel)
        const [, { token }, body] = await Promise.all([
            dbConnect(),
            params,
            request.json()
        ]);
        const { cardId } = body;

        const link = await OneTimeLink.findOneAndUpdate(
            { token, used: false },
            { used: true, usedAt: new Date(), createdCardId: cardId },
            { new: true }
        );

        if (!link) {
            return NextResponse.json({ error: 'Link not found or already used' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            link: {
                id: link._id,
                token: link.token,
                used: link.used,
                usedAt: link.usedAt,
            },
        });
    } catch (error) {
        console.error('Update link error:', error);
        return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
    }
}

// Delete link
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        // Start db connection and params resolution in parallel (async-parallel)
        const [, { token }] = await Promise.all([
            dbConnect(),
            params
        ]);

        const link = await OneTimeLink.findOneAndDelete({ token });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Link deleted successfully',
        });
    } catch (error) {
        console.error('Delete link error:', error);
        return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }
}
