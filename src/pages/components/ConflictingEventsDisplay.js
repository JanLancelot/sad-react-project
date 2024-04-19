import React from 'react';

const ConflictingEventsDisplay = ({ conflictingEvents, eventDate, location, eventStartTime, eventEndTime }) => {
    const getAlternativeTimes = () => {
      const alternativeTimes = [];
      const startHour = parseInt(eventStartTime.split(":")[0], 10);
      const endHour = parseInt(eventEndTime.split(":")[0], 10);
  
      for (let hour = 0; hour < 24; hour++) {
        if (hour < startHour || hour >= endHour) {
          alternativeTimes.push(`${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`);
        }
      }
  
      return alternativeTimes;
    };
  
    const getAlternativeDates = () => {
      const today = new Date();
      const oneDayInMs = 86400000; // One day in milliseconds
      const alternativeDates = [];
  
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today.getTime() + i * oneDayInMs);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        alternativeDates.push(`${year}-${month}-${day}`);
      }
  
      return alternativeDates;
    };
  
    return (
      <div>
        {conflictingEvents.length > 0 && (
          <div>
            <h3 className="text-lg font-bold">Conflicting Events:</h3>
            <ul>
              {conflictingEvents.map((event) => (
                <li key={event.id}>
                  {event.name} ({event.startTime} - {event.endTime})
                </li>
              ))}
            </ul>
            <div>
              <h3 className="text-lg font-bold">Alternative Times:</h3>
              <ul>
                {getAlternativeTimes().map((time) => (
                  <li key={time}>{time}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold">Alternative Dates:</h3>
              <ul>
                {getAlternativeDates().map((date) => (
                  <li key={date}>{date}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

export default ConflictingEventsDisplay;