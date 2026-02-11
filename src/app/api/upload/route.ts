import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Increase the body size limit to handle larger image uploads (default is 4.5MB on Vercel)
export const runtime = 'nodejs';
export const maxDuration = 30; // seconds

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for S3-compatible APIs
});

const S3_BUCKET = process.env.S3_BUCKET || 'valentine-images';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY || !process.env.S3_ENDPOINT) {
      return NextResponse.json({ error: 'S3 credentials not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = image.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: image.type,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Generate public URL (path-style)
    const endpoint = process.env.S3_ENDPOINT!.replace(/\/$/, '');
    const url = `${endpoint}/${S3_BUCKET}/${filename}`;

    return NextResponse.json({
      success: true,
      url: url,
      display_url: url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
