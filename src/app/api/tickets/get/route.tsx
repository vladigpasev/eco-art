import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/Mongo';
import { ObjectId } from 'mongodb';
import { useRouter } from 'next/navigation'


export async function GET(req: NextRequest): Promise<NextResponse> {
   // const router = useRouter()
  //const event_id = router.query.slug;
  const { searchParams } = new URL(req.url)

const event_id = searchParams.get('event_id');
    try {
        // Connect to MongoDB
        const db = await connectToDatabase();

        // Fetch the events from the 'events' collection
        const eventsCollection = db.collection('events');
        //@ts-ignore
        const events = await eventsCollection.findOne({ '_id': new ObjectId(event_id) });

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