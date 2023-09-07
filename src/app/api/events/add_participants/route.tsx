import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/Mongo';
import { ObjectId } from 'mongodb';
//@ts-ignore
import nodemailer from 'nodemailer';
import { auth } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs';


async function sendEmail(userId: string, attendees: Array<{ name: string, email: string }>, eventDetails: any) {

    const user = await clerkClient.users.getUser(userId);
    const mainUserEmail = user.emailAddresses[0].emailAddress;
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

    const eventDetailsHTML = `
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            background-color: #f0f0f0;
            margin: 0;
        }
        .container {
            background-color: #fff;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #32A852;
            margin: 0;
        }
        .content {
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #32A852;
            border: none;
            border-radius: 5px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Eco Art Event</h1>
        </div>
        <div class="content">
            <p>Dear ${mainUserName},</p>
            <p>We are thrilled to invite you to our special event. Here are the details:</p>
            <p><b>Date:</b> ${eventDetails.date}</p>
            <p><b>Time:</b> 14:00</p>
            <p><b>Location:</b> Devin</p>
            <p>To make your experience seamless, we have prepared a digital ticket for you.</p>
            <a href="http://localhost:3002/?event_id=${eventDetails._id}&user_id=${userId}" class="button">Access Your Ticket</a>
        </div>
    </div>
</body>
</html>
`;

const mainUserInfo = await transporter.sendMail({
    from: '"Eco Art" <no-reply@eco-art.xyz>',
    to: mainUserEmail,
    subject: "Your Ticket to Eco Art Event",
    text: `Hello ${mainUserName}, you are invited to the Eco Art event. Please find your ticket at http://localhost:3002/?event_id=${eventDetails._id}&user_id=${userId}`,
    html: eventDetailsHTML,
});

    console.log("Email sent to main user: %s", mainUserInfo.messageId);

    for (const attendee of attendees) {
        if (attendee.email && attendee.email.trim()) {
            const info = await transporter.sendMail({
                from: '"Eco Art" <no-reply@eco-art.xyz>',
                to: attendee.email,
                subject: "You're Invited!",
                text: `Hello ${attendee.name}, you have been invited to an event.`,
                html: `<b>Hello ${attendee.name}</b>, <br> you have been invited to an event.`,
            }); 
    
            console.log("Email sent: %s", info.messageId);
        } else {
            console.log(`No valid email address provided for attendee: ${attendee.name}. Email not sent.`);
        }
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
        const eventDetails = await eventsCollection.findOne({ '_id': new ObjectId(eventId) });

        // @ts-ignore
        await sendEmail(userId, attendees, eventDetails);


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