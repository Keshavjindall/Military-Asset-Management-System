import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Base from '@/models/Base';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    const userBaseId = request.headers.get('x-user-base-id');

    let bases;

    if (userRole === 'admin') {
      // Admin can see all bases
      bases = await Base.find({});
    } else if (userRole === 'commander' && userBaseId) {
      // Commander can only see their own base
      bases = await Base.find({ _id: userBaseId });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(bases);
  } catch (error) {
    console.error('Get bases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { name, location } = await request.json();

    const base = new Base({ name, location });
    await base.save();

    return NextResponse.json(base, { status: 201 });
  } catch (error) {
    console.error('Create base error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
