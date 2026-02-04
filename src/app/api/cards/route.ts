import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Card from '@/models/Card';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name1, name2, images } = body;

    if (!name1 || !name2) {
      return NextResponse.json({ error: 'Both names are required' }, { status: 400 });
    }

    if (!images || images.length !== 6) {
      return NextResponse.json({ error: 'Exactly 6 images are required' }, { status: 400 });
    }

    const card = new Card({
      name1,
      name2,
      images,
    });

    await card.save();

    return NextResponse.json({
      success: true,
      card: {
        id: card._id,
        slug: card.slug,
        name1: card.name1,
        name2: card.name2,
        images: card.images,
      },
    });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const cards = await Card.find({}).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json({ error: 'Failed to get cards' }, { status: 500 });
  }
}
