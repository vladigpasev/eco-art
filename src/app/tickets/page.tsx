// Make sure to import ObjectId from the mongodb package if needed
import { connectToDatabase } from '../../utils/Mongo';
import { EventData } from '@/models/Events';
import TicketCard from '../components/TicketCard';
import { auth } from '@clerk/nextjs';

export async function getEvents() {
  const { userId } : { userId: string | null } = auth();
  

  const db = await connectToDatabase();

  const eventsCollection = db.collection('events');
  const events = await eventsCollection.find({
    "participants.id": userId,
  }).toArray();



  console.log(userId)
  // Convert ObjectId to string, as Next.js cannot serialize ObjectId
  return JSON.parse(JSON.stringify(events));
}

export default async function Tickets() {
  const eventsData = await getEvents();
  console.log(eventsData);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-semibold text-center py-20 text-[#237a39]">
        Моите събития
      </h1>

      <div className="flex flex-wrap justify-center gap-5">
        {eventsData.length > 0 ? (
          eventsData.map((event: any) => (
            <TicketCard key={event._id} event={event} />
          ))
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-5 w-full md:w-1/2 lg:w-1/3">
            <p className="text-center text-xl font-semibold">You have not signed up for any events yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}