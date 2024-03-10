import React from 'react';
import Layout from './Layout';
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../firebaseConfig'; 
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 



export default function NewEvent({}) {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null); // Create a ref for file input
  
    // Image Change Handler 
    const handleImageChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        setSelectedImage(event.target.files[0]);
      }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      const newMeeting = {
        name: eventName,
        date: eventDate,
        time: eventTime,
        location: location,
        // ... other fields 
      };
  
      try {
        // Firebase Storage Upload
        const storage = getStorage();
        const imagesRef = ref(storage, `images/${selectedImage.name}`); 
        const snapshot = await uploadBytes(imagesRef , selectedImage);
        const imageUrl = await getDownloadURL(snapshot.ref);
        newMeeting.imageUrl = imageUrl; 
  
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'meetings'), newMeeting);
        console.log("Meeting added with ID:", docRef.id);
        window.location.href = '/calendar';
  
      } catch (error) {
        console.error("Error adding meeting:", error);
      }
    }
  
    
    return (
        <>
            <Layout>
            <div className="mx-auto">
  <form onSubmit={handleSubmit}>
    <div className="space-y-12">
      <div className="border-b border-gray-900/10 pb-12">

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div className="sm:col-span-4">
              <label htmlFor="eventname" className="block text-sm font-medium leading-6 text-gray-900">
                  Event Name
              </label>
              <div className="mt-2">
                  <input
                      type="text"
                      name="eventname"
                      id="eventname"
                      value={eventName}
                     onChange={e => setEventName(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
          </div>

          <div className="sm:col-span-4"> <label htmlFor="eventdate" className="block text-sm font-medium leading-6 text-gray-900">
                  Event Date
              </label>
              <div className="mt-2">
                  <input
                      type="date"
                      name="eventdate"
                      id="eventdate"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
          </div>

          <div className="sm:col-span-2"> {/* Adjusted for better layout */}
        <label htmlFor="eventtime" className="block text-sm font-medium leading-6 text-gray-900">
          Event Time
        </label>
        <div className="mt-2">
          <input
            type="time"
            name="eventtime"
            id="eventtime"
            value={eventTime} 
            onChange={(e) => setEventTime(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

          <div className="sm:col-span-4">
              <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                  Location
              </label>
              <div className="mt-2">
                  <input
                      type="text"
                      name="location"
                      id="location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
              </div>
          </div>

          
          <div className="col-span-full">
        <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
            Photo
        </label>
        <div className="mt-2 flex items-center gap-x-3">
            <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
            <button
                type="button"
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()} // Trigger file input
            >
                Change
            </button>
            <input 
                type="file" 
                ref={fileInputRef}  
                onChange={handleImageChange}
                className="hidden" 
            />
        </div>
    </div>

    </div>
  </div>

  <div className="mt-6 flex items-center justify-end gap-x-6">
    <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
      Cancel
    </button>
    <button
      type="submit"
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Save
    </button>
  </div>
</div>
</form>
</div>

            </Layout>
        </>
    )
}