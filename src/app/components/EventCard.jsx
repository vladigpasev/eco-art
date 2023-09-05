"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function EventCard({ event }) {
  const { userId } = useAuth();
  const { user } = useUser();

  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [isPaymentVisible, setPaymentVisibility] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [eventData, setEventData] = useState(null);

  function handleBuyClick() {
    setPopupVisibility(true);
  }

  function handleNextClick() {
    const data = {
      userId,
      eventId: event._id,
      attendees
    };
    console.log(JSON.stringify(data))
    setEventData(data);
    setPopupVisibility(false);
    setPaymentVisibility(true);
   /// console.log(JSON.stringify(data));
  }

  function handlePaymentBack(){
    setPaymentVisibility(false);
    setPopupVisibility(true);
  }

  function addAttendee() {
    setAttendees([...attendees, { name: '', email: '' }]);
  }

  function removeAttendee(index) {
    setAttendees(attendees.filter((_, i) => i !== index));
  }

  function updateAttendee(index, field, value) {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  }
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
              Enroll
            </button>
          </div>
        </div>

      </div>

      {isPopupVisible && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50">
          <div className="bg-white rounded-lg w-1/2 p-8">
            <h2 className="text-2xl mb-4">Attendees</h2>
            <h2 className="text-lg mb-4 mt-5">Organizer</h2>
            <div className="flex items-center my-2">
              <input
                type="text"
                readOnly
                className="input input-bordered flex-1 mr-2 bg-gray-200 cursor-not-allowed"
                value={user.firstName + ' ' + user.lastName}
              />
              <input
                type="text"
                readOnly
                className="input input-bordered flex-1 mr-2 bg-gray-200 cursor-not-allowed"
                value={user.primaryEmailAddress.emailAddress}
              />
            </div>
            {attendees.length > 0 && <h2 className="text-lg mb-4 mt-5">Guest Attendees</h2>}
            {attendees.map((attendee, index) => (
              <div key={index} className="flex items-center my-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered flex-1 mr-2"
                  value={attendee.name}
                  onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Email (optional)"
                  className="input input-bordered flex-1 mr-2"
                  value={attendee.email}
                  onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                />
                <button
                  className="btn bg-transparent border-none text-xl ml-2"
                  onClick={() => removeAttendee(index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="btn btn-accent" onClick={addAttendee}>+ Add More</button>
            <div className="flex gap-4 mt-4">
          <button className="btn btn-error" onClick={() => setPopupVisibility(false)}>Cancel</button>
          <button className="btn btn-success" onClick={handleNextClick}>Next</button>
        </div>
          </div>
        </div>
      )}

{isPaymentVisible && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50">
          <div className="bg-white rounded-lg w-1/2 p-8">
            <h2 className="text-2xl mb-4">Select Payment Method</h2>
            <div className="flex flex-col gap-4 mt-4">
              <button className="btn btn-success">Payment on the Spot</button>
              <button className="btn btn-primary">Card Payment</button>
            </div>
            <div className="flex gap-4 mt-4">
              <button className="btn btn-neutral" onClick={handlePaymentBack}>Back</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
