import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EquipmentType from '@/models/EquipmentType';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin' && userRole !== 'commander') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const equipmentTypes = await EquipmentType.find({});
    return NextResponse.json(equipmentTypes);
  } catch (error) {
    console.error('Get equipment types error:', error);
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

    const { name, category } = await request.json();

    const equipmentType = new EquipmentType({ name, category });
    await equipmentType.save();

    return NextResponse.json(equipmentType, { status: 201 });
  } catch (error) {
    console.error('Create equipment type error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
