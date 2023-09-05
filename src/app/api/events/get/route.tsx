import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/Mongo';

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Fetch the events from the 'events' collection
        const eventsCollection = db.collection('events');
        const events = await eventsCollection.find({}).toArray();

        // Send the events as a JSON response
        return NextResponse.json({ events });
    } catch (err) {
        console.error('Failed to fetch data:', err);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
