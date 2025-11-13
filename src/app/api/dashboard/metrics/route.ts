import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const baseId = searchParams.get('baseId');
    const equipmentType = searchParams.get('equipmentType');

    const userRole = request.headers.get('x-user-role');
    const userBaseId = request.headers.get('x-user-base-id');

    // RBAC & Base Filter Logic
    let baseFilter: any = {};

    if (userRole === 'commander') {
      // Commander is locked to their own base
      if (userBaseId) {
        baseFilter = {
          $or: [
            { to_base_id: userBaseId },
            { from_base_id: userBaseId }
          ]
        };
      }
    } else if (userRole === 'admin') {
      if (baseId) {
        baseFilter = {
          $or: [
            { to_base_id: baseId },
            { from_base_id: baseId }
          ]
        };
      }
      // If no baseId, admin sees all bases (empty filter {})
    } else if (userRole === 'logistics') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Equipment Filter Logic
    let equipmentFilter = {};
    if (equipmentType) {
      equipmentFilter = { equipment_type_id: equipmentType };
    }

    // Build date filter
    const dateFilter = {
      timestamp: {
        $gte: new Date(startDate!),
        $lt: new Date(endDate!)
      }
    };

    // Get purchases
    const purchases = await Transaction.aggregate([
      {
        $match: {
          type: 'PURCHASE',
          ...dateFilter,
          ...equipmentFilter,
          ...baseFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    // Get transfer in
    const transferIn = await Transaction.aggregate([
      {
        $match: {
          type: 'TRANSFER',
          ...dateFilter,
          ...equipmentFilter,
          ...baseFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    // Get transfer out
    const transferOut = await Transaction.aggregate([
      {
        $match: {
          type: 'TRANSFER',
          ...dateFilter,
          ...equipmentFilter,
          ...baseFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);

    // Calculate opening balance (simplified)
    const openingBalance = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $lt: new Date(startDate!) },
          ...equipmentFilter,
          ...baseFilter
        }
      },
      {
        $group: {
          _id: null,
          totalIn: {
            $sum: {
              $cond: [
                { $in: ['$type', ['PURCHASE', 'TRANSFER']] },
                '$quantity',
                0
              ]
            }
          },
          totalOut: {
            $sum: {
              $cond: [
                { $in: ['$type', ['ASSIGNMENT', 'EXPENDITURE', 'TRANSFER']] },
                '$quantity',
                0
              ]
            }
          }
        }
      }
    ]);

    const opening = (openingBalance[0]?.totalIn || 0) - (openingBalance[0]?.totalOut || 0);
    const purchasesTotal = purchases[0]?.total || 0;
    const transferInTotal = transferIn[0]?.total || 0;
    const transferOutTotal = transferOut[0]?.total || 0;
    const closing = opening + purchasesTotal + transferInTotal - transferOutTotal;

    return NextResponse.json({
      openingBalance: opening,
      purchases: purchasesTotal,
      transferIn: transferInTotal,
      transferOut: transferOutTotal,
      closingBalance: closing
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
