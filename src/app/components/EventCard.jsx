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
  const [isRegistered, setIsRegistered] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);

  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  const [registeredEvents, setRegisteredEvents] = useState({}); 

  async function addAttendeesToEvent() {
    try {
      setIsLoading(true); // Set loading state to true

      const response = await fetch('/api/events/add_participants/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      setIsLoading(false); // Set loading state to false

      if (response.status === 200) {
        console.log('Guests added successfully:', data.message);
        setPaymentVisibility(false); // Close the payment popup
        setSuccessMessage('Thank you for your purchase! A ticket has been sent to your email.'); // Set success message

        setTimeout(() => {
          setSuccessMessage(''); // Clear the message after 5 seconds
        }, 5000);
      } else {
        console.error('Failed to add guests:', data.error);
      }
    } catch (error) {
      setIsLoading(false); // Set loading state to false
      console.error('There was an error adding the guests:', error);
    }
  }

  useEffect(() => {
  async function fetchRegisteredEvents() {
    try {
      const res = await fetch(`http://localhost:3000/api/events/check_registered`);
      const response = await res.json();
      const registeredEventsMap = {};
      response.events.forEach(event => {
        registeredEventsMap[event._id] = true;
      });
      setRegisteredEvents(registeredEventsMap);
    } catch (error) {
      console.error("Failed to check registration:", error);
    }
  }

  if (userId) {
    fetchRegisteredEvents();
  }
}, [userId]);



  useEffect(() => {
    const newTotalPrice = (attendees.length + 1) * event.price;
    setTotalPrice(parseFloat(newTotalPrice).toFixed(2));
  }, [attendees, event.price]);

  useEffect(() => {
    if (isPopupVisible || isPaymentVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => { // Възстановяване на стиловете при unmount
      document.body.style.overflow = 'auto';
    };
  }, [isPopupVisible, isPaymentVisible]);


  function handleBuyClick() {
    setPopupVisibility(true);
  }

  function handleNextClick() {
    const filteredAttendees = attendees.filter(attendee => attendee.name.trim() !== '');

    const data = {
      userId,
      eventId: event._id,
      attendees: filteredAttendees
    };

    setEventData(data);
    setAttendees(filteredAttendees);  // update the state to remove empty names
    setPopupVisibility(false);
    setPaymentVisibility(true);

    /// console.log(JSON.stringify(data));
  }

  function handlePaymentBack() {
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
  function validateCardDetails() {
    let valid = true;
    const newErrors = {};

    if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
      newErrors.cardNumber = 'Card Number must have 16 digits';
      valid = false;
    }

    if (!/^[a-zA-Z\s]+$/.test(cardDetails.cardHolderName)) {
      newErrors.cardHolderName = 'Card Holder Name must contain only alphabets and spaces';
      valid = false;
    }

    if (!/^(\d{2}\/\d{2})$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Expiry Date must be in MM/YY format';
      valid = false;
    }

    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must have 3 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handlePayment() {
    if (validateCardDetails()) {
      console.log('Valid card details');
      // Continue with payment
    }
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
    disabled={registeredEvents[event._id]} // Проверете дали event._id е в списъка на регистрирани събития
    className={`btn btn-primary ${registeredEvents[event._id] ? 'cursor-not-allowed opacity-50' : 'bg-[#237a39] border-none hover:bg-[#237a39db] text-[#edf2ef]'} rounded py-2 px-4 transition duration-300 ease-in-out`}
    onClick={() => !registeredEvents[event._id] && setPopupVisibility(true)}
  >
    {registeredEvents[event._id] ? 'Signed up' : 'Sign up'}
  </button>
          </div>
        </div>

      </div>

      {isPopupVisible && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50 overflow-hidden">
          <div className="bg-white rounded-lg w-full md:w-1/2 p-4 md:p-8 h-full md:h-auto overflow-y-auto">
          <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Event: {event.title} ({event.date})</p>
              </div>
            </div>


            <h2 className="text-2xl mb-4">Attendees</h2>
            <h2 className="text-lg mb-4 mt-5">Organizer</h2>
            <div className="flex flex-col md:flex-row items-center my-2">
              <input
                type="text"
                readOnly
                className="input input-bordered w-full md:flex-1 mb-2 md:mb-0 md:mr-2 bg-gray-200 cursor-not-allowed"
                value={user.firstName + ' ' + user.lastName}
              />
              <input
                type="text"
                readOnly
                className="input input-bordered w-full md:flex-1 mt-2 md:mt-0 md:mr-2 bg-gray-200 cursor-not-allowed"
                value={user.primaryEmailAddress.emailAddress}
              />
            </div>
            {attendees.length > 0 && <h2 className="text-lg mb-4 mt-5">Guest Attendees</h2>}
            {attendees.map((attendee, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center my-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full md:flex-1 mb-2 md:mb-0 md:mr-2"
                  value={attendee.name}
                  onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Email (optional)"
                  className="input input-bordered w-full md:flex-1 mt-2 md:mt-0 md:mr-2"
                  value={attendee.email}
                  onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                />
                <button
                  className="btn bg-transparent border-none text-xl mt-2 md:mt-0 ml-2"
                  onClick={() => removeAttendee(index)}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="btn btn-accent w-full md:w-auto" onClick={addAttendee}>+ Add More</button>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button className="btn btn-error w-full md:w-auto mb-2 md:mb-0" onClick={() => setPopupVisibility(false)}>Cancel</button>
              <button className="btn btn-success w-full md:w-auto" onClick={handleNextClick}>Payment</button>
            </div>
          </div>
        </div>


      )}

      {isPaymentVisible && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50 overflow-hidden">
      <div className="bg-white rounded-lg md:w-1/2 w-full h-full md:h-auto p-8 overflow-y-auto"> {/* Добавих md:w-1/2 и md:h-auto */}
        <h2 className="text-2xl mb-4">Select Payment Method</h2>

            {/* Display Event Title and Date */}
            <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Event: {event.title} ({event.date})</p>
              </div>
            </div>

            {/* Display Price Information */}
            <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Base Price:</p>
                <p className="text-lg font-semibold">{event.price} BGN</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Number of Attendees:</p>
                <p className="text-lg font-semibold">{attendees.length + 1}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total Price:</p>
                <p className="text-lg font-semibold text-[#237a39]">{totalPrice} BGN</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
            <button
              className="btn btn-success"
              disabled={isLoading}
              onClick={addAttendeesToEvent}
            >
              {isLoading ? 'Loading...' : 'Payment on the Spot'}
            </button>
            <button
              className="btn btn-primary"
              disabled={isLoading}
              onClick={addAttendeesToEvent}
            >
              {isLoading ? 'Loading...' : 'Card Payment'}
            </button>
          </div>
            <div className="flex gap-4 mt-4">
            <button className="btn btn-neutral" onClick={handlePaymentBack}>Back</button>
            <button className="btn btn-error " onClick={() => setPaymentVisibility(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

{successMessage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50">
          <div className="bg-white rounded-lg w-1/2 p-8 text-center">
            <h2 className="text-2xl mb-4">{successMessage}</h2>
          </div>
        </div>
      )}
    </>
  );
}
