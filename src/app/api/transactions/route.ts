import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    const userBaseId = request.headers.get('x-user-base-id');
    const userId = request.headers.get('x-user-id');

    let transactions;

    if (userRole === 'admin') {
      // Admin can see all transactions
      transactions = await Transaction.find({})
        .populate('recorded_by_user_id', 'username')
        .populate('equipment_type_id', 'name category')
        .populate('from_base_id', 'name')
        .populate('to_base_id', 'name')
        .sort({ timestamp: -1 });
    } else if (userRole === 'commander' && userBaseId) {
      // Commander can only see transactions related to their base
      transactions = await Transaction.find({
        $or: [
          { to_base_id: userBaseId },
          { from_base_id: userBaseId }
        ]
      })
        .populate('recorded_by_user_id', 'username')
        .populate('equipment_type_id', 'name category')
        .populate('from_base_id', 'name')
        .populate('to_base_id', 'name')
        .sort({ timestamp: -1 });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userRole = request.headers.get('x-user-role');
    const userBaseId = request.headers.get('x-user-base-id');
    const userId = request.headers.get('x-user-id');

    if (userRole === 'logistics') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const {
      type,
      equipment_type_id,
      quantity,
      from_base_id,
      to_base_id,
      assigned_to_personnel,
      notes
    } = await request.json();

    // Validate based on transaction type
    if (type === 'PURCHASE' && !to_base_id) {
      return NextResponse.json({ error: 'to_base_id required for PURCHASE' }, { status: 400 });
    }
    if (type === 'TRANSFER' && (!from_base_id || !to_base_id)) {
      return NextResponse.json({ error: 'from_base_id and to_base_id required for TRANSFER' }, { status: 400 });
    }
    if (type === 'ASSIGNMENT' && (!from_base_id || !assigned_to_personnel)) {
      return NextResponse.json({ error: 'from_base_id and assigned_to_personnel required for ASSIGNMENT' }, { status: 400 });
    }
    if (type === 'EXPENDITURE' && !from_base_id) {
      return NextResponse.json({ error: 'from_base_id required for EXPENDITURE' }, { status: 400 });
    }

    // RBAC checks
    if (userRole === 'commander' && userBaseId) {
      if (type === 'PURCHASE' && to_base_id !== userBaseId) {
        return NextResponse.json({ error: 'Can only purchase for own base' }, { status: 403 });
      }
      if ((type === 'TRANSFER' || type === 'ASSIGNMENT' || type === 'EXPENDITURE') && from_base_id !== userBaseId) {
        return NextResponse.json({ error: 'Can only transfer/assign/expend from own base' }, { status: 403 });
      }
    }

    const transaction = new Transaction({
      type,
      recorded_by_user_id: userId,
      equipment_type_id,
      quantity,
      from_base_id,
      to_base_id,
      assigned_to_personnel,
      notes
    });

    await transaction.save();

    // Populate for response
    await transaction.populate('recorded_by_user_id', 'username');
    await transaction.populate('equipment_type_id', 'name category');
    await transaction.populate('from_base_id', 'name');
    await transaction.populate('to_base_id', 'name');

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
