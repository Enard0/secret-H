import { useEffect, useState, SyntheticEvent, useRef, } from "react";
import PlayerList from "./players/PlayerList";
import Lobby from "./lobby/Lobby";
import Boards from "./board/Boards";
import { RoleModal, VotingModal, PostVotingModal } from "./Modals/Modals";
import { CardsModal } from "./Modals/CardsModal";

import './App.css'
import { WinModal, CheckCardsModal, CheckRoleModal, VetoModal } from "./Modals/ActionModal";
//import Setup from "./Startgame/Setup";
const App = ({ SessionId, UserId }) => {

  const [Data, setData] = useState({});
  const [State, setState] = useState('None');
  const [Event, setEvent] = useState('None');

  const [Spectators, setSpectators] = useState([]);
  const [Players, setPlayers] = useState([]);
  const [Chosen, setChosen] = useState(0);
  const [Gov, setGov] = useState({ 'president': 0, "lastP": 0, "lastC": 0, "chancellor": 0 });

  const [Roles, setRoles] = useState({ "Player": "N", "All": {}, "AllN": {} });

  const [VotingData, setVotingData] = useState({ "For": [], "Against": [], "Abstain": [] });

  const [BoardData, setBoards] = useState(
    {
      "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
      "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"],
      "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
    });
  const [Lcount, setLcount] = useState(0);
  const [Fcount, setFcount] = useState(0);
  const [Dead, setDead] = useState([]);
  const [Ccount, setCcount] = useState(0);

  const [Action, setAction] = useState('null');

  const [Func, setFunc] = useState(null)

  const EventId = useRef(-1);
  const [PlayerData, setPlayerData] = useState([])

  const getPlayers = () => {
    fetch(`/api/players/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setPlayers(json.players)
          setDead(json.dead)
          console.log(json)
        })
      }
    })
  }

  const getGov = () => {
    fetch(`/api/gov/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setGov(json)
          console.log(json)
        })
      }
    })
  }

  const getSpectators = () => {
    fetch(`/api/spectators/${SessionId}/`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {
          setSpectators(JSON.parse(json.spectators));
        })
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

  /*const getCards = () => {
    fetch(`/api/cards/${SessionId}/${UserId}`).then(response => {
      if (response.status == 200) {
        response.json().then(json => { setCards(json) })
      }
    })
  }*/

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
    console.log(event)
    switch (event.event) {
      case "Killed":
      case 'Player Left':
      case 'Player Joined':
        getPlayers()
        return;

      case 'Spectator Joined':
        getPlayerData()
      case 'Spectator Left':
        getSpectators()
        return;

      case 'Stopped':
      case 'Started':
        getRoles()
        getBoards()
        getGov()
        getStatus()
        break;

      case 'Law Passed':
        const dat = JSON.parse(event.data)
        if (dat.field != null)
          setAction(dat.field)
        //cardAction(dat.field)
        getBoards()
        getStatus()
        break;
      
      case 'Voting Passed':
      case 'Voting Failed':
        setVotingData(JSON.parse(event.data))
        getGov()
        getStatus()
        break;

      case 'Voting':
      case 'Pass Laws':
      case 'Win':
        setData(JSON.parse(event.data))
        getStatus();
        setAction("")
        break;
      

      case 'President Checked':
        getStatus()
        setData(JSON.parse(event.data))
      case 'New President':
      case "Became President":
        getGov()
        setAction("")
        break;

    }
    setEvent(event.event)
  }

  const getPlayerData = () => {
    fetch(`/api/playerDataFull`).then(response => {
      if (response.status == 200) {
        response.json().then(json => { setPlayerData(json)})
      }
    })
  }

  useEffect(() => {
    getPlayers()
    getSpectators()
    getStatus()
    getRoles()
    getPlayerData()
    getGov()


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

  useEffect(() => {
    if (UserId == Gov["president"]) {
      if (State == 'Selecting Chancellor') { setFunc("selectChancellor"); return }
      if (Action == 'Selecting Chancellor' || Action == 'Fkill' || Action == 'Fveto' || Action == 'Fpresident' || Action == 'FcheckRole') { setFunc("selectPerson"); return }
    }
    setFunc(null)
  }, [Gov, State, Action])

  const selectPerson = (id) => {
    if (!Players.includes(id) || Gov.president != UserId) return false
    setChosen(id);
    return true;
  }

  const selectChancellor = (id) => {
    if (!Players.includes(id) || Gov.president != UserId || Gov.president == id || Gov.lastC == id || (Gov.lastP == id && Players.length > 5)) return false
    setChosen(id)
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
    setChosen(0)
  }

  const choosePresident = () => {
    fetch(`/api/choosePresident/${SessionId}/${UserId}`, {
      method: "POST",
      body: JSON.stringify({
        NewP: Chosen,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    setChosen(0)
  }

  const kill = () => {
    fetch(`/api/kill/${SessionId}/${UserId}`, {
      method: "POST",
      body: JSON.stringify({
        Killed: Chosen,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    setChosen(0)
  }

  const checkRole = () => {
    fetch(`/api/checkRole/${SessionId}/${UserId}`, {
      method: "POST",
      body: JSON.stringify({
        Checked: Chosen,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    setChosen(0)
  }

  return (
    <div className={"state " + State.replace(/\s+/g, '-') + (Players.includes(UserId.toString()) ? " isPlayer" : " isSpectator") + (Players.length <= 5 && " lessThan")}>
      <p>Event:{Event}</p>
      <p>State:{State}</p>
      <p>Gov:{JSON.stringify(Gov)}</p>
      <p>isP: {Players.includes(UserId.toString())}</p>
      <p>Data:{JSON.stringify(Data)}</p>
      <PlayerList _PlayerData={PlayerData} _Players={Players} _Spectators={Spectators} _Roles={Roles.AllN} _Gov={Gov} _func={Func == "selectChancellor" ? selectChancellor : Func == "selectPerson" ? selectPerson : null} _Dead={Dead}/>
      <Lobby SessionId={SessionId} UserId={UserId} _CanJoin={State == "Waiting"} _Joined={Players.includes(UserId.toString())} _Playernr={Players.length} />

      {(Gov.president == UserId && Event == 'Became President') && <button className="CConfirm" disabled={Chosen == 0 ? true : false} onClick={chooseChancellor}>Confirm chancellor</button>}
      {(Gov.president == UserId && Action == 'Fpresident') && <button className="PConfirm" disabled={Chosen == 0 ? true : false} onClick={choosePresident}>Confirm president</button>}
      {(Gov.president == UserId && Action == 'Fkill') && <button className="KConfirm" disabled={Chosen == 0 ? true : false} onClick={kill}>KILL</button>}
      {(Gov.president == UserId && Action == 'Fveto') && <button className="KConfirm" disabled={Chosen == 0 ? true : false} onClick={kill}>KILL</button>}
      {(Gov.president == UserId && Action == 'FcheckRole') && <button className="RConfirm" disabled={Chosen == 0 ? true : false} onClick={checkRole}>Confirm Role Check</button>}
      {State != "Waiting" && State != "None" ? <Boards _Boards={BoardData} _L={Lcount} _F={Fcount} _C={Ccount} /> : ''}
      {Players.includes(UserId.toString()) && (<div>
        <VotingModal _isOpen={Event == "Voting"} _Candidate={"Candidate" in Data ? Data["Candidate"] : 0} UserId={UserId} SessionId={SessionId} _PlayerData={PlayerData}/>

        <CardsModal _isOpen={Event == "Pass Laws"} _Cards={Data['Cards']} _Veto={Data['Veto']} _Chan={State == 'President Cards' ? Gov.chancellor : 0} SessionId={SessionId} UserId={UserId} _PlayerData={PlayerData}/>

        <PostVotingModal _isOpen={Event == 'Voting Failed' || Event == 'Voting Passed'} _For={VotingData['For']} _Against={VotingData['Against']} _Abstain={VotingData['Abstain']} UserId={UserId} _PlayerData={PlayerData}/>
        <RoleModal _isOpen={Event == 'Started'} _UserRole={Roles.Player} _Roles={Roles.All} UserId={UserId} _PlayerData={PlayerData}/>

        <CheckCardsModal _isOpen={UserId == Gov["president"] && Action == "FcheckCards"} SessionId={SessionId} UserId={UserId} />
        <CheckRoleModal _isOpen={Event == 'President Checked'} _President={Data['President']} _Choosen={Data['Checked']} _Role={'Role' in Data ? Data['Role'] : null} _PlayerData={PlayerData}/>

        <VetoModal _isOpen={Event == "Veto Ask"} _PlayerData={PlayerData}/>
        <WinModal _isOpen={Event == 'Win'} _Type={Data["party"]} _PlayerData={PlayerData}/>
      </div>
      )}
    </div>
  );
};

export default App;