import { useEffect, useState } from "react";

const App = () => {
  const [Event, setEvent] = useState({
    event: "Event",
    data: {},
  });

  useEffect(() => {
    // opening a connection to the server to begin receiving events from it
    const eventSource = new EventSource("/api/subscribe/1/1");
    
    // attaching a handler to receive message events
    eventSource.onmessage = (event) => {
      console.log('Event')
      const data = JSON.parse(event.data)
      console.log(data)
      console.log(data.event)
      setEvent({ ...data});
    };
    
    // terminating the connection on component unmount
    return () => eventSource.close();
  }, []);

  const fetchPromise = fetch("/api/rejectCard/1/1/", {method: 'POST'});
  
  function test(){
  fetchPromise.then(response => {
      console.log(response);
    })
  }
  return (
      <div className="flex flex-col items-start justify-start mt-6 gap-2">
          <p>Event:{Event.event}</p>
          <button onClick={test}>test</button>
      </div>
  );
};

export default App;