import { useEffect, useState, SyntheticEvent } from "react";
import PlayerList from "./players/PlayerList";
import Lobby from "./lobby/Lobby";
import Boards from "./board/Boards";
import RoleModal from "./Modals/RoleModal";
//import Setup from "./Startgame/Setup";
const App = ({ SessionId, UserId }) => {

  //const [Data, setData] = useState({});
  const [State, setState] = useState('None');
  const [Event, setEvent] = useState('None');

  const [Spectators, setSpectators] = useState([]);
  const [Players, setPlayers] = useState([]);
  const [Roles, setRoles] = useState({});

  const [BoardData, setBoards] = useState(
    {
      "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
      "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"],
      "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
    });
  const [Lcount, setLcount] = useState(0);
  const [Fcount, setFcount] = useState(0);
  const [Ccount, setCcount] = useState(0);

  var EventId = 0;

  const getPlayers = () => {
    fetch(`/api/players/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setPlayers(JSON.parse(json.players))
        })
      }
    })
  }

  const getSpectators = () => {
    fetch(`/api/spectators/${SessionId}/`).then(response => {
      console.log(response);
      if (response.status == 200) {
        response.json().then(json => { setSpectators(JSON.parse(json.spectators)) })
      }
    })
  }

  const getStatus = () => {
    fetch(`/api/status/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.text().then(text => { setState(text) })
      }
    })
  }


  const getRoles = () => {
    fetch(`/api/roles/${SessionId}/${UserId}`).then(response => {
      if (response.status == 200) {
        response.json().then(json => { setRoles(json) })
      }
    })
  }

  const getBoards = () => {
    fetch(`/api/boards/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setBoards(JSON.parse(json.boards));
          setLcount(json.Lcount);
          setFcount(json.Fcount);
          setCcount(json.Ccount);
        })
      }
    })
  }

  const EventHandler = (event) => {
    if ("next" in event)
      EventId = event.next
    if (event.event == "ping" || event.event == "Failed") {
      return
    }
    console.debug(event)
    setEvent(event.event)
    switch (event.event) {
      case 'Player Left':
      case 'Player Joined':
        getPlayers()
        return;

      case 'Spectator Left':
      case 'Spectator Joined':
        getSpectators()
        return;

      case 'Started':
        getStatus()
        getRoles()
        break;
    }
  }

  useEffect(() => {
    getPlayers()
    getSpectators()
    getStatus()
    getRoles()


    // opening a connection to the server to begin receiving events from it
    //const eventSource = new EventSource(`/api/subscribe/${SessionId}/${UserId}`);
    const eventss = setInterval(() => {
      fetch(`/api/event/${SessionId}/${UserId}/${EventId}`).then(response => {
        console.log(response);
        if (response.status == 200) {
          response.json().then(json => { EventHandler(json) })
        }
      })

    }, 200)
    // attaching a handler to receive message events
    //eventSource.onmessage = (event) => {
    //  EventHandler(event)   
    //};

    // terminating the connection on component unmount
    //return () => eventSource.close();
  }, []);

  //() => {
  //  fetch("/api/joined/1/1/")
  //}
  return (
    <div className="">
      <p>Event:{Event}</p>
      <p>State:{State}</p>
      <PlayerList _Players={Players} _Spectators={Spectators} _Roles={Roles} />
      <Lobby SessionId={SessionId} UserId={UserId} _CanJoin={State == "Waiting"} _Joined={Players.includes(UserId)} />
      {State != "Waiting" && State != "None" ? <Boards _Boards={BoardData} _L={Lcount} _F={Fcount} _C={Ccount} /> : ''}
      <RoleModal _isOpen={Event == 'Started'} />
    </div>
  );
};

export default App;