import { useEffect, useState, SyntheticEvent, useRef, } from "react";
import PlayerList from "./players/PlayerList";
import Lobby from "./lobby/Lobby";
import Boards from "./board/Boards";
import { RoleModal, VotingModal } from "./Modals/Modals";
import { CardsModal } from "./Modals/CardsModal";

import './App.css'
import { WinModal } from "./Modals/ActionModal";
//import Setup from "./Startgame/Setup";
const App = ({ SessionId, UserId }) => {

  const [Data, setData] = useState({});
  const [Cards, setCards] = useState([]);
  const [State, setState] = useState('None');
  const [Event, setEvent] = useState('None');
  const [PopupWin, setPopupWin] = useState(0)

  const [Spectators, setSpectators] = useState([]);
  const [Players, setPlayers] = useState([]);
  const [Chosen, setChosen] = useState(0);
  const [Gov, setGov] = useState({ 'president': 0, "lastP": 0, "lastC": 0, "chancellor": 0 });

  const [Roles, setRoles] = useState({ "Player": "N", "All": {}, "AllN": {} });

  const [BoardData, setBoards] = useState(
    {
      "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
      "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"],
      "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
    });
  const [Lcount, setLcount] = useState(0);
  const [Fcount, setFcount] = useState(0);
  const [Ccount, setCcount] = useState(0);

  const EventId = useRef(-1);

  const getPlayers = () => {
    fetch(`/api/players/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setPlayers(json.players)
        })
      }
    })
  }

  const getGov = () => {
    fetch(`/api/gov/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setGov(json)
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

  const getCards = () => {
    fetch(`/api/cards/${SessionId}/${UserId}`).then(response => {
      if (response.status == 200) {
        response.json().then(json => { setCards(json) })
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
      EventId.current = event.next
    if (event.event == "ping" || event.event == "Failed") {
      return
    }
    console.debug(event)
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
        getRoles()
        getBoards()
        getGov()
        getStatus()
        break;

      case 'Law Passed':
        const dat = JSON.parse(event.data)
        if (dat.field != null)
          cardAction(dat.field)
        getBoards()
        getGov()
        getStatus()
        break;

      case 'Voting Failed':
        getGov()
        getStatus()
        break;

      case 'Voting':
        setData(JSON.parse(event.data))
        getStatus()
        break;

      case 'Pass Laws':
        getStatus()
        getCards()

      case 'Win':
        setData(JSON.parse(event.data))
    }
    setEvent(event.event)
  }
  
  const cardAction = (act) => {
    switch (act) {
      
    }
  }

  useEffect(() => {
    getPlayers()
    getSpectators()
    getStatus()
    getRoles()


    // opening a connection to the server to begin receiving events from it
    //const eventSource = new EventSource(`/api/subscribe/${SessionId}/${UserId}`);
    //const eventss = 
    setInterval(() => {
      fetch(`/api/event/${SessionId}/${UserId}/${EventId.current}`).then(response => {
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

  const selectChancellor = (id) => {
    console.log(id)
    if (!Players.includes(id) || Gov.president != UserId || Gov.president == id || Gov.lastC == id || (Gov.lastP == id && Players.length > 5)) return false
    setChosen(id)
    console.log(id)
    return true
  }

  const chooseChancellor = () => {
    fetch(`/api/chancellor/${SessionId}/${UserId}`, {
      method: "POST",
      body: JSON.stringify({
        Candidate: Chosen,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
  }

  return (
    <div className={"state " + State.replace(/\s+/g, '-') + (Players.includes(UserId.toString()) ? " isPlayer" : " isSpectator") + (Players.length <= 5 && " lessThan")}>
      <p>Event:{Event}</p>
      <p>State:{State}</p>
      <p>isP: {Players.includes(UserId.toString())}</p>
      <p>Data:{JSON.stringify(Data)}</p>
      <PlayerList _Players={Players} _Spectators={Spectators} _Roles={Roles.AllN} _Gov={Gov} _func={UserId == Gov["president"] && State == 'Selecting Chancellor' ? selectChancellor : null} />
      <Lobby SessionId={SessionId} UserId={UserId} _CanJoin={State == "Waiting"} _Joined={Players.includes(UserId.toString())} _Playernr={Players.length} />

      {Gov.president == UserId && <button className="CConfirm" disabled={Chosen == 0 ? true : false} onClick={chooseChancellor}>Confirm chancellor</button>}
      {State != "Waiting" && State != "None" ? <Boards _Boards={BoardData} _L={Lcount} _F={Fcount} _C={Ccount} /> : ''}
      {Players.includes(UserId.toString()) && (<div>
        <VotingModal _isOpen={Event == "Voting"} _Candidate={"Candidate" in Data ? Data["Candidate"] : 0} UserId={UserId} SessionId={SessionId} />

        <CardsModal _isOpen={Event == "Pass Laws"} _Cards={Cards} _Chan={State == 'President Cards' ? Gov.chancellor : 0} SessionId={SessionId} UserId={UserId} />

        <RoleModal _isOpen={Event == 'Started'} _UserRole={Roles.Player} _Roles={Roles.All} UserId={UserId} />

        <WinModal _isOpen={Event == 'Win'} _Type={Data["party"]}/>
      </div>
      )}
    </div>
  );
};

export default App;