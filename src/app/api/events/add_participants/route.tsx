import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/Mongo';
import { ObjectId } from 'mongodb';
//@ts-ignore
import nodemailer from 'nodemailer';
import { auth } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs';


async function sendEmail(userId: string, attendees: Array<{ name: string, email: string }>) {
    const user = await clerkClient.users.getUser(userId);
    const mainUserEmail = user.emailAddresses[0].emailAddress;  // Getting the first email address in the array
    const mainUserName = `${user.firstName} ${user.lastName}`;

    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: "no-reply@eco-art.xyz",
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mainUserInfo = await transporter.sendMail({
        from: '"Eco Art" <no-reply@eco-art.xyz>',
        to: mainUserEmail,
        subject: "Your Ticket",
        text: `Hello ${mainUserName}, here is your ticket.`,
        html: `<b>Hello ${mainUserName}</b>, <br> here is your ticket.`,
    });
    console.log("Email sent to main user: %s", mainUserInfo.messageId);

    for (const attendee of attendees) {
        const info = await transporter.sendMail({
            from: '"Eco Art" <no-reply@eco-art.xyz>',
            to: attendee.email,
            subject: "You're Invited!",
            text: `Hello ${attendee.name}, you have been invited to an event.`,
            html: `<b>Hello ${attendee.name}</b>, <br> you have been invited to an event.`,
        });

        console.log("Email sent: %s", info.messageId);
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    const { userId }: { userId: string | null } = auth();

    try {
        const { eventId, attendees } = await req.json();
        const db = await connectToDatabase();
        const eventsCollection = db.collection('events');
        const mainParticipantObj = {
            id: userId,
            arrived: false
        };


        if (attendees.length > 0) {
            // Add each attendee from the array
            for (const attendee of attendees) {
                const newGuest = {
                    id: new ObjectId().toString(),  // Generating new id for each guest
                    name: attendee.name,
                    email: attendee.email,
                    arrived: false,  // Adding the 'arrived' field
                    mainParticipant: userId
                };

                await eventsCollection.updateOne(
                    { '_id': new ObjectId(eventId) },
                    {
                        $addToSet: {
                            participants: mainParticipantObj,
                            guestParticipants: newGuest
                        }
                    }
                );
            }
        } else {
            // No attendees to add, just update mainParticipant
            await eventsCollection.updateOne(
                { '_id': new ObjectId(eventId) },
                { $addToSet: { participants: mainParticipantObj } }
            );

        }

        // Send email to main user and attendees
        await sendEmail(userId, attendees);

        return NextResponse.json({ message: 'Guests added successfully.' }, {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (err) {
        console.error('Failed to add guest:', err);
        return NextResponse.json({ error: 'Failed to add guest' }, {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}