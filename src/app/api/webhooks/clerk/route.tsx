import type { IncomingHttpHeaders } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { WebhookRequiredHeaders } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { connectToDatabase } from '../../../../utils/Mongo'; // Adjust the import path to where your Mongo.js file is located
import { User } from '../../../../models/Users';

const webhookSecret: string = 'whsec_CcF14j/huPqz0cvnmq7F7Jyz/0I00saX';
 
export async function POST(req: Request) {
  const payload = await req.json();
  const payloadString = JSON.stringify(payload);
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixIdTimeStamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    return new Response('Error occured', {
      status: 400
    });
  }
  // Create an object of the headers
  const svixHeaders = {
    'svix-id': svixId,
    'svix-timestamp': svixIdTimeStamp,
    'svix-signature': svixSignature
  };
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);
 
  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (_) {
    console.log('error');
    return new Response('Error occured', {
      status: 400
    });
  }
  const { data, type } = payload;

  const { id } = evt.data;
  // Handle the webhook
  const eventType = evt.type;
  if (eventType === 'user.created') {
    console.log(`User ${id} was ${eventType}`);
    
    // Extract only the data you need
    const simplifiedUser: User = {
        clerk_id: data.id,
        email_addresses: data.email_addresses[0]?.email_address || '', // Assuming you're taking the first email address
        first_name: data.first_name,
        last_name: data.last_name
    };

    // Connect to the database
    const db = await connectToDatabase();

    // Add the simplified user data to the database
    const collection = db.collection('users');
    await collection.insertOne(simplifiedUser);

    console.log(`User ${id} was successfully inserted into the database`);
} else if (eventType === 'user.deleted') {
    console.log(`User ${id} was ${eventType}`);

    // Connect to the database
    const db = await connectToDatabase();

    // Delete the user data from the database
    const collection = db.collection('users');
    const deleteResult = await collection.deleteOne({ clerk_id: id });

    if (deleteResult.deletedCount === 1) {
        console.log(`User ${id} was successfully deleted from the database`);
    } else {
        console.log(`User ${id} could not be found or was already deleted`);
    }
  } else if (eventType === 'user.updated') {
    console.log(`User ${id} was ${eventType}`);

    // Extract only the updated fields you care about
    const updatedUser: Partial<User> = {
        clerk_id: data.id,
        email_addresses: data.email_addresses[0]?.email_address || '',
        first_name: data.first_name,
        last_name: data.last_name
    };

    // Connect to the database
    const db = await connectToDatabase();

    // Update the user data in the database
    const collection = db.collection('users');
    const updateResult = await collection.updateOne({ clerk_id: id }, { $set: updatedUser });

    if (updateResult.matchedCount === 1) {
        console.log(`User ${id} was successfully updated in the database`);
    } else {
        console.log(`User ${id} could not be found for updating`);
    }
}



  return new Response('', {
    status: 201
  });
}