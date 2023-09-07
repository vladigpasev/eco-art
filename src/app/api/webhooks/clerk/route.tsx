import type { IncomingHttpHeaders } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { WebhookRequiredHeaders } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { connectToDatabase } from '../../../../utils/Mongo';
import { User } from '../../../../models/Users';
//@ts-ignore
import nodemailer from "nodemailer";
const webhookSecret: string = 'whsec_CcF14j/huPqz0cvnmq7F7Jyz/0I00saX';

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "no-reply@eco-art.xyz",
    pass: process.env.MAIL_PASSWORD,
  },
});
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
  const svixHeaders = {
    'svix-id': svixId,
    'svix-timestamp': svixIdTimeStamp,
    'svix-signature': svixSignature
  };
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (_) {
    console.log('error');
    return new Response('Error occured', {
      status: 400
    });
  }
  const { data, type } = payload;

  const { id } = evt.data;
  const eventType = evt.type;
  if (eventType === 'user.created') {
    console.log(`User ${id} was ${eventType}`);

    const simplifiedUser: User = {
      clerk_id: data.id,
      email_addresses: data.email_addresses[0]?.email_address || '', // Assuming you're taking the first email address
      first_name: data.first_name,
      last_name: data.last_name
    };

    const db = await connectToDatabase();

    const collection = db.collection('users');
    await collection.insertOne(simplifiedUser);

    console.log(`User ${id} was successfully inserted into the database`);
  } else if (eventType === 'user.deleted') {
    console.log(`User ${id} was ${eventType}`);

    const db = await connectToDatabase();

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

    const db = await connectToDatabase();

    const collection = db.collection('users');
    const updateResult = await collection.updateOne({ clerk_id: id }, { $set: updatedUser });

    if (updateResult.matchedCount === 1) {
      console.log(`User ${id} was successfully updated in the database`);
    } else {
      console.log(`User ${id} could not be found for updating`);
    }
  } else if (eventType === 'email.created') {
    console.log(`Email was created: ${id}`);

    const mailOptions = {
      from: 'Eco Art <no-reply@eco-art.xyz>',
      to: data.to_email_address,
      subject: data.subject,
      html: data.body,
      text: data.body_plain
    };
//@ts-ignore
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }




  return new Response('', {
    status: 201
  });
}