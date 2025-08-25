import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
  try {
    await connectDB();
    const { name, fileBase64, uploadDate, size } = await req.json();

    const uploadRes = await cloudinary.uploader.upload(fileBase64, {
      folder: 'banners'   
    });

    const newBanner = await Banner.create({
      name,
      url: uploadRes.secure_url,
      uploadDate,
      size
    });

    return NextResponse.json(newBanner);
  } catch (error) {
    console.error('POST /api/banners error:', error);
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('GET /api/banners error:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
