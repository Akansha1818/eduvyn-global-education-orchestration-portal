import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/Banner';

export async function DELETE(req, context) {
  try {
    await connectDB();
    const { params } = context;           
    const id = await params.id;                 
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('DELETE /api/banners/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
