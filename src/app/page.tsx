// Make sure to import ObjectId from the mongodb package if needed
import { connectToDatabase } from '../utils/Mongo';
import { EventData } from '@/models/Events';
import EventCard from './components/EventCard';


export async function getEvents() {
  const db = await connectToDatabase();

  const eventsCollection = db.collection('events');
  const events = await eventsCollection.find({}).toArray();

  // Convert ObjectId to string, as Next.js cannot serialize ObjectId
  return JSON.parse(JSON.stringify(events));
}

export default async function Home() {
  const eventsData = await getEvents();
  console.log(eventsData);
 
  return (
    <div>
      <h1 className="text-4xl font-semibold text-center py-20 text-[#237a39]">
        Предстоящи събития
      </h1>

      <div className="flex flex-wrap justify-center gap-5">
        {eventsData.map((event:any) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );

}
