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

  const [isLoading, setIsLoading] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  const [registeredEvents, setRegisteredEvents] = useState({}); 

  async function addAttendeesToEvent() {
    try {
      setIsLoading(true);

      const response = await fetch('/api/events/add_participants/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      setIsLoading(false);

      if (response.status === 200) {
        console.log('Guests added successfully:', data.message);
        setPaymentVisibility(false);
        setSuccessMessage('Благодарим Ви за поръчката! Ще получите повече информация на Вашия имейл.');

        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        console.error('Failed to add guests:', data.error);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('There was an error adding the guests:', error);
    }
  }

  useEffect(() => {
  async function fetchRegisteredEvents() {
    try {
      const res = await fetch(`/api/events/check_registered`);
      const response = await res.json();
      console.log({response});
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

    return () => {
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
    setAttendees(filteredAttendees);
    setPopupVisibility(false);
    setPaymentVisibility(true);
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

console.log(JSON.stringify(registeredEvents));
console.log(JSON.stringify(event));
  return (
    <>
      <div key={event._id} className="card rounded-lg w-full p-4 m-2 bg-base-100 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4">
        <figure>
          <img className="w-full h-48 object-cover rounded-t-lg" src={event.image} alt="Art" />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title text-2xl font-semibold mb-2">{event.title}</h2>
          <i><p className='font-light font-italic '>Ментор: {event.mentor}</p></i>
          <p className="text-base text-gray-700 ">{event.description}</p>
          <div className="card-actions flex justify-between mt-5 items-center">
            <div className='flex flex-col justify-center'>
              <div className='text-[#237a39] font-semibold text-lg'>{event.price} лв.</div>
              <div className="text-[#237a39] font-light text-lg">{event.date}</div>
            </div>
            <button
    disabled={registeredEvents[event._id]} // Проверете дали event._id е в списъка на регистрирани събития
    className={`btn btn-primary ${registeredEvents[event._id] ? 'cursor-not-allowed opacity-50' : 'bg-[#237a39] border-none hover:bg-[#237a39db] text-[#edf2ef]'} rounded py-2 px-4 transition duration-300 ease-in-out`}
    onClick={() => !registeredEvents[event._id] && setPopupVisibility(true)}
  >
    {registeredEvents[event._id] ? 'Регистриран' : 'Регистрация'}
  </button>
          </div>
        </div>

      </div>

      {isPopupVisible && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50 overflow-hidden">
          <div className="bg-white rounded-lg w-full md:w-1/2 p-4 md:p-8 h-full md:h-auto overflow-y-auto">
          <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Събитие: {event.title} ({event.date})</p>
              </div>
            </div>


            <h2 className="text-2xl mb-4">Участници</h2>
            <h2 className="text-lg mb-4 mt-5">Организатор</h2>
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
            {attendees.length > 0 && <h2 className="text-lg mb-4 mt-5">Гости участници</h2>}
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
            <button className="btn btn-accent w-full md:w-auto" onClick={addAttendee}>+ Добави още</button>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button className="btn btn-error w-full md:w-auto mb-2 md:mb-0" onClick={() => setPopupVisibility(false)}>Откажи</button>
              <button className="btn btn-success w-full md:w-auto" onClick={handleNextClick}>Плащане</button>
            </div>
          </div>
        </div>


      )}

      {isPaymentVisible && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-black z-50 overflow-hidden">
      <div className="bg-white rounded-lg md:w-1/2 w-full h-full md:h-auto p-8 overflow-y-auto"> 
        <h2 className="text-2xl mb-4">Избери метод на плащане</h2>

            <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Събитие: {event.title} ({event.date})</p>
              </div>
            </div>

            <div className="bg-gray-100 rounded p-4 my-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Основна цена:</p>
                <p className="text-lg font-semibold">{event.price} лв.</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Брой участници:</p>
                <p className="text-lg font-semibold">{attendees.length + 1}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Обща сума:</p>
                <p className="text-lg font-semibold text-[#237a39]">{totalPrice} лв.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
            <button
              className="btn btn-success"
              disabled={isLoading}
              onClick={addAttendeesToEvent}
            >
              {isLoading ? 'Зареждане...' : 'Плащане на място'}
            </button>
            <button
              className="btn btn-primary"
              disabled={isLoading}
              onClick={addAttendeesToEvent}
            >
              {isLoading ? 'Зареждане...' : 'Плащане с карта'}
            </button>
          </div>
            <div className="flex gap-4 mt-4">
            <button className="btn btn-neutral" onClick={handlePaymentBack}>Назад</button>
            <button className="btn btn-error " onClick={() => setPaymentVisibility(false)}>Откажи</button>
            </div>
          </div>
        </div>
      )}

{successMessage && (
        <div className="alert alert-success fixed bottom-0 right-0 m-5 z-50 w-fit">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{successMessage}</span>
      </div>
      )}
    </>
  );
}
