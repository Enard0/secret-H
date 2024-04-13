import { useEffect, useState, SyntheticEvent } from "react";
import Lobby from "./lobby/Lobby";
//import Setup from "./Startgame/Setup";
const App = ({ SessionId, UserId }) => {

  //const [Data, setData] = useState({});
  const [State, setState] = useState('None');
  const [Event, setEvent] = useState('None');
  const [Spectators, setSpectators] = useState([]);
  const [Players, setPlayers] = useState([]);


  const getPlayers = () => {fetch(`/api/players/${SessionId}/`).then(response => {
    if (response.status == 200) {
      response.json().then(json => {
        console.log(json.players)
        setPlayers(JSON.parse(json.players)) })
    }
  })}

  const getSpectators = () => {fetch(`/api/spectators/${SessionId}/`).then(response => {
    if (response.status == 200) {
      response.json().then(json => { console.log(json);setSpectators(JSON.parse(json.spectators)) })
    }
  })}

  const getStatus = () => {fetch(`/api/status/${SessionId}/`).then(response => {
    if (response.status == 200) {
      response.text().then(event => { setState(event) })
    }
  })}


  useEffect(() => {
    console.log('fetch')
    getPlayers()
    getSpectators()
    getStatus()


    // opening a connection to the server to begin receiving events from it
    const eventSource = new EventSource(`/api/subscribe/${SessionId}/${UserId}`);
    // attaching a handler to receive message events
    eventSource.onmessage = (event) => {
      //console.log('Event')
      //console.log(event)
      const data = JSON.parse(event.data)
      //console.log(data)
      //console.log(data.event)
      setEvent(data.event)
      //console.log(data.data)
      //setData(data.data);
      switch (data.event) {
        case 'Player Left':
        case 'Player Joined':
        getPlayers()
        break;

        case 'Spectator Left':
        case 'Spectator Joined':
        getSpectators()
        break;
      }
    };

    // terminating the connection on component unmount
    return () => eventSource.close();
  }, []);

  //() => {
  //  fetch("/api/joined/1/1/")
  //}
  return (
    <div className="flex flex-col items-start justify-start mt-6 gap-2">
      <p>Event:{Event}</p>
      <p>State:{State}</p>
      {State == 'Waiting' ? <Lobby SessionId={SessionId} UserId={UserId} Players={Players} Spectators={Spectators} /> : ''}
    </div>
  );
};

export default App;