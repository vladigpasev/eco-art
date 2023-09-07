import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/Mongo';
import { auth } from '@clerk/nextjs';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const { userId } : { userId: string | null } = auth();
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Fetch the events from the 'events' collection
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find({
            "participants": {
              "$in": [userId]
            }
          }).toArray();

        // Create a new response with headers
        return new NextResponse(JSON.stringify({ events }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err) {
        console.error('Failed to fetch data:', err);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}