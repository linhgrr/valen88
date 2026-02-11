import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Start db connection and params resolution in parallel (async-parallel)
    const [, { slug }] = await Promise.all([
      dbConnect(),
      params
    ]);

    const card = await Card.findOne({ slug });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card._id,
        slug: card.slug,
        name1: card.name1,
        name2: card.name2,
        images: card.images,
        letterImages: card.letterImages || [],
        letterMessage: card.letterMessage || { greeting: 'Dear em iu ,', content: '' },
        createdAt: card.createdAt,
      },
    });
  } catch (error) {
    console.error('Get card error:', error);
    return NextResponse.json({ error: 'Failed to get card' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Start all async operations in parallel (async-parallel)
    const [, { slug }, body] = await Promise.all([
      dbConnect(),
      params,
      request.json()
    ]);
    const { name1, name2, images, letterImages, letterMessage } = body;

    if (!name1 || !name2) {
      return NextResponse.json({ error: 'Both names are required' }, { status: 400 });
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = { name1, name2 };
    if (images && images.length === 6) {
      updateData.images = images;
    }
    if (letterImages !== undefined) {
      updateData.letterImages = letterImages;
    }
    if (letterMessage !== undefined) {
      updateData.letterMessage = letterMessage;
    }

    const card = await Card.findOneAndUpdate(
      { slug },
      updateData,
      { new: true }
    );

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      card: {
        id: card._id,
        slug: card.slug,
        name1: card.name1,
        name2: card.name2,
        images: card.images,
        letterImages: card.letterImages,
        letterMessage: card.letterMessage,
        createdAt: card.createdAt,
      },
    });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Start db connection and params resolution in parallel (async-parallel)
    const [, { slug }] = await Promise.all([
      dbConnect(),
      params
    ]);

    const card = await Card.findOneAndDelete({ slug });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }
}
