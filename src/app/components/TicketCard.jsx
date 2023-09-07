"use client"
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '@clerk/nextjs';

export default function TicketCard({ event }) {
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const { userId } = useAuth();
  return (
    <>
      <div key={event._id} className="card rounded-lg w-full p-4 m-2 bg-base-100 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4">
      <figure>
          <img className="w-full h-48 object-cover rounded-t-lg" src={event.image} alt="Art" />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title text-2xl font-semibold mb-2">{event.title}</h2>
          <p className="text-base text-gray-700">{event.description}</p>
          <div className="card-actions flex justify-between mt-5 items-center">
            <div className='flex flex-col justify-center'>
              <div className='text-[#237a39] font-semibold text-lg'>{event.price} BGN</div>
              <div className="text-[#237a39] font-light text-lg">{event.date}</div>
            </div>
            <button
          className="btn btn-primary bg-[#237a39] border-none hover:bg-[#237a39db] text-[#edf2ef] rounded py-2 px-4 transition duration-300 ease-in-out"
          onClick={() => setPopupVisibility(true)}
        >
          Ticket
        </button>
          </div>
        </div>

       
      </div>

      {isPopupVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 md:w-3/5">
      <div className="border rounded-xl p-6 bg-[#f7f9fc] shadow-inner">
        <h2 className="text-2xl font-bold mb-4 text-center border-b pb-2">Your Ticket</h2>
        <div className="flex flex-col gap-5 md:gap-0 md:flex-row justify-between items-center mt-4">
          <div className="flex flex-col space-y-2 text-lg">
            <p><span className="font-semibold">Event:</span> {event.title}</p>
            <p><span className="font-semibold">Date:</span> {event.date}</p>
            <p><span className="font-semibold">Mentor:</span> {event.mentor}</p>
          </div>
          <div className="md:w-1/3">
          <QRCode 
  value={`http://172.20.10.2:3001/validate?event_id=${event._id}&user_id=${userId}`} 
  size={128} 
/>

          </div>
        </div>
      </div>
      <div className="text-center mt-6">
        <button className="btn btn-primary bg-[#237a39] border-none hover:bg-[#237a39db] text-[#edf2ef] rounded py-2 px-4 transition duration-300 ease-in-out" onClick={() => setPopupVisibility(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}

