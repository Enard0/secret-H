import express, { json } from "express";
import { config } from "dotenv";
import fetch from "node-fetch";
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

const PING = 2000;
const DSC = 20000;
var curid = 0;

// Allow express to parse JSON bodies
app.use(json());
app.use(cors());
app.use(express.json());

var GamesData = new Object()
var Players = new Object()
var EventsToSend = new Object()

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

// Used like so
app.post("/token", async (req, res) => {

  // Exchange the code for an access_token

  const bdy = new URLSearchParams({
    client_id: process.env.VITE_DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri: process.env.VITE_REDIRECT_URL,
    code: req.body.code,
  }).toString()

  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bdy,
  });

  // Retrieve the access_token from the response
  const { access_token, expires_in } = await response.json();
  //console.log(access_token,response)
  // Return the access_token to our client as { access_token: "..."}
  res.json({ "at": access_token, "exp": expires_in });
});

app.get("/qj", (req, res) => {
  curid++;
  res.json({ "Id": curid / 2 });
});

app.post("/playerData/:UserId", (req, res) => {
  const UserId = req.params.UserId;

  if (UserId in Players) return res.sendStatus(200);

  const UserName = req.body.username;
  const Avatar = req.body.avatar;

  Players[UserId] = { "avatar": Avatar, "userName": UserName };
})

app.get("/playerData/:UserId", (req, res) => {
  const UserId = req.params.UserId;
  if (!(UserId in Players)) {
    res.statusMessage = 'No Player';
    res.status(405).end();
  }
  res.json(Players[UserId]);
})

app.get("/playerDataFull", (req, res) => {
  res.json(Players);
})

app.get("/event/:SessionId/:UserId/:EventId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const EventId = parseInt(req.params.EventId)

  if (!(SessionId in GamesData)) {
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }

  if (!(SessionId in EventsToSend)) EventsToSend[SessionId] = []
  if (!('Spectators' in GamesData[SessionId])) {
    GamesData[SessionId]['Spectators'] = {}
  }

  const pingdsc = () => {
    if (SessionId in GamesData && 'Players' in GamesData[SessionId] && GamesData[SessionId]['Players'].includes(UserId)) {
      const index = GamesData[SessionId]['Players'].indexOf(UserId);
      GamesData[SessionId]['Players'].splice(index, 1);
      EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Player Left', 'For': 'All' })
      console.log(`player left ${SessionId}:${UserId}`)
    }

    console.log(`disconnected ${SessionId}:${UserId}`)
    if (SessionId in GamesData && 'Spectators' in GamesData[SessionId] && UserId in GamesData[SessionId]['Spectators']) {
      delete GamesData[SessionId]["Spectators"][UserId]
      EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Spectator Left', 'For': 'All' })
    }
  }

  const badping = () => {
    console.log(`Ping ${SessionId}:${UserId}`)
    if (SessionId in GamesData && 'Spectators' in GamesData[SessionId] && UserId in GamesData[SessionId]['Spectators']) {
      EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Bad Connection', 'For': 'All' })
    }
  }

  if (UserId in GamesData[SessionId]['Spectators']) {
    clearTimeout(GamesData[SessionId]['Spectators'][UserId]["dsc"])
    GamesData[SessionId]['Spectators'][UserId]["dsc"] = setTimeout(pingdsc, DSC)
    //clearTimeout(GamesData[SessionId]['Spectators'][UserId]["ping"])
    //GamesData[SessionId]['Spectators'][UserId]["ping"] = setTimeout(badping, PING)
  }
  else {
    res.json({ "event": "joined", "next": EventsToSend[SessionId].length })
    EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Spectator Joined', 'For': 'All' })
    GamesData[SessionId]['Spectators'][UserId] = { "dsc": setTimeout(pingdsc, DSC)}//, "ping": setTimeout(badping, PING) }
    return
  }

  if (EventId == -1) {
    res.json({ "next": Math.max(0, EventsToSend[SessionId].length - 1), "event": "Failed" })
    return;
  }

  if (EventsToSend[SessionId].length < EventId) {
    res.json({ "next": EventsToSend[SessionId].length, "event": "Failed" })
    return;
    res.statusMessage = `${EventsToSend[SessionId].length} max`;
    res.status(405).end();
    return;
  }

  if (EventsToSend[SessionId].length == EventId) {
    res.json({ "next": EventId, "event": "ping" })
    return;
  }
  if (EventsToSend[SessionId][EventId]['For'] == 'All' || ('Rev' in EventsToSend[SessionId][EventId] && !EventsToSend[SessionId][EventId]['For'].includes(UserId)) || (!('Rev' in EventsToSend[SessionId][EventId]) && EventsToSend[SessionId][EventId]['For'].includes(UserId))) {
    res.json({ "next": EventId + 1, "event": EventsToSend[SessionId][EventId]['Event'], "data": JSON.stringify(EventsToSend[SessionId][EventId]['Data']) })
  } else {
    res.json({ "next": EventId + 1, "event": "ping" })
  }
})


/*
app.get("/subscribe/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  console.log(`subscibed ${SessionId}:${UserId}`)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    "Connection": 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  if (!(SessionId in GamesData)) {
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if (!(SessionId in EventsToSend)) EventsToSend[SessionId] = []
  if (!('Spectators' in GamesData[SessionId])) {
    GamesData[SessionId]['Spectators'] = []
  }
  if (!GamesData[SessionId]['Spectators'].includes(UserId)) GamesData[SessionId]['Spectators'].push(UserId)
  var lastevent = EventsToSend[SessionId].length

  EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Spectator Joined', 'For': 'All' })

  const interval = setInterval(() => {
    if (EventsToSend[SessionId].length > lastevent) {
      var event = EventsToSend[SessionId][lastevent]
      console.log(event)
      if (event['For'] == 'All' || event['For'].includes(UserId)) {
        res.write(`data: {"event": "${event['Event']}","data": ${JSON.stringify(event['Data'])}}\n\n`)
      }
      lastevent++;
    }
  }, 500);

  const ping = setInterval(() => {
    res.write('data: ping\n\n')
  }, 2000)
  req.socket.on("close", () => {
    clearInterval(interval);
    clearInterval(ping);
    //if (SessionId in GamesData && 'Subscribed' in GamesData[SessionId]) {
    //  const index = GamesData[SessionId]['Subscribed'].indexOf(UserId);
    //  GamesData[SessionId]['Subscribed'].splice(index, 1);
    //}
    if (SessionId in GamesData && 'Players' in GamesData[SessionId] && GamesData[SessionId]['Players'].includes(UserId)) {
      const index = GamesData[SessionId]['Players'].indexOf(UserId);
      GamesData[SessionId]['Players'].splice(index, 1);
      EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Player Left', 'For': 'All' })
      console.log(`player left ${SessionId}:${UserId}`)
    }
    console.log(`disconnected ${SessionId}:${UserId}`)
    if (SessionId in GamesData && 'Spectators' in GamesData[SessionId] && GamesData[SessionId]['Spectators'].includes(UserId)) {
      const index = GamesData[SessionId]['Spectators'].indexOf(UserId);
      GamesData[SessionId]['Spectators'].splice(index, 1);
      EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Spectator Left', 'For': 'All' })
    }
    res.end();
  });
});
*/


app.post("/join/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  if (SessionId in GamesData) {
    if (GamesData[SessionId]['Status'] != 'Waiting') {
      res.statusMessage = "Game Started";
      res.status(405).end();
      return
    }
  } else {
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if ('Players' in GamesData[SessionId] && GamesData[SessionId]['Players'].includes(UserId)) {
    res.statusMessage = "Joined already";
    res.status(405).end();
    return
  }
  if (!('Players' in GamesData[SessionId])) {
    GamesData[SessionId]['Players'] = []
  }
  if (!GamesData[SessionId]['Players'].includes(UserId)) GamesData[SessionId]['Players'].push(UserId)
  console.log(`Player joined ${SessionId}:${UserId}`)
  EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Player Joined', 'For': 'All' })
  res.sendStatus(200);
});

app.post("/leave/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  if (SessionId in GamesData) {
    if (GamesData[SessionId]['Status'] != 'Waiting') {
      res.statusMessage = "Game Started";
      res.status(405).end();
      return
    }
  } else {
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if (!('Players' in GamesData[SessionId]) || !GamesData[SessionId]['Players'].includes(UserId)) {
    res.statusMessage = "Not Joined";
    res.status(405).end();
    return
  }
  const index = GamesData[SessionId]['Players'].indexOf(UserId);
  GamesData[SessionId]['Players'].splice(index, 1);
  console.log(`player left ${SessionId}:${UserId}`)
  EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Player Left', 'For': 'All' })
  res.sendStatus(200);
});


app.post("/start/:SessionId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!SessionId in GamesData) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Waiting') {
    res.statusMessage = "Game started";
    res.status(405).end();
    return
  }

  //var players = req.body.players
  if (!('Players' in GamesData[SessionId])) {
    res.statusMessage = "No Players";
    res.status(405).end();
    return;
  }
  const players = GamesData[SessionId]['Players']
  const roles = req.body.roles
  const cards = req.body.cards
  GamesData[SessionId]['Boards'] = req.body.boards

  var rolec = new Array()

  for (const [key, value] of Object.entries(roles)) {
    for (let i = 0; i < value; i++) {
      rolec.push(key)
    }
  }

  shuffle(rolec);

  var rolep = new Object()
  var revrole = new Object()
  for (let i = 0; i < players.length; i++) {
    rolep[players[i]] = rolec[i]
    if (!(rolec[i] in revrole)) revrole[rolec[i]] = []
    revrole[rolec[i]].push(players[i])
  }

  GamesData[SessionId]['Roles'] = rolep
  GamesData[SessionId]['RevRoles'] = revrole

  var cardsc = new Array()

  for (const [key, value] of Object.entries(cards)) {
    for (let i = 0; i < value; i++) {
      cardsc.push(key)
    }
  }

  shuffle(cardsc)

  GamesData[SessionId]['Cards'] = cardsc
  GamesData[SessionId]['UsedCards'] = []
  if (!(SessionId in EventsToSend)) EventsToSend[SessionId] = [];

  const presidentid = Math.floor(Math.random() * players.length);
  console.log(players)
  const president = players[presidentid]
  GamesData[SessionId]['President'] = president
  GamesData[SessionId]['PresidentId'] = presidentid
  GamesData[SessionId]['Chancellor'] = null
  GamesData[SessionId]['Candidate'] = null
  GamesData[SessionId]['LastP'] = null
  GamesData[SessionId]['LastC'] = null
  GamesData[SessionId]['CountL'] = 0
  GamesData[SessionId]['CountC'] = 0
  GamesData[SessionId]['CountF'] = 0
  GamesData[SessionId]['Tracker'] = 0
  GamesData[SessionId]['Veto'] = false
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'
  GamesData[SessionId]['Dead'] = []
  if (!("Config" in GamesData[SessionId])) {
    GamesData[SessionId]['Config'] = {}
    GamesData[SessionId]['Config']['HideVoting'] = false
    GamesData[SessionId]['Config']['VoteTimeout'] = 100000
    GamesData[SessionId]['Config']['Tracker'] = 3
  }
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Started', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [president] })
  res.sendStatus(200);
});


app.get("/players/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  //const UserId = req.params.UserId
  if (!(SessionId in GamesData)) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (!('Players' in GamesData[SessionId])) {
    res.statusMessage = "No Players";
    res.status(405).end();
    return;
  }
  res.json({ "players": GamesData[SessionId]['Players'], "dead": GamesData[SessionId]['Dead'] })
});

app.get("/gov/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  //const UserId = req.params.UserId
  if (!(SessionId in GamesData)) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  res.json({ "lastP": GamesData[SessionId]['LastP'], "lastC": GamesData[SessionId]['LastC'], "president": GamesData[SessionId]['President'], "chancellor": GamesData[SessionId]['Chancellor'] })
});

app.get("/spectators/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  //const UserId = req.params.UserId
  if (!(SessionId in GamesData)) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (!('Spectators' in GamesData[SessionId])) {
    res.statusMessage = "No Spectators";
    res.status(405).end();
    return;
  }
  res.json({ "spectators": JSON.stringify([...Object.keys(GamesData[SessionId]['Spectators'])]) }).end()
});


app.get("/roles/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId

  if (!(SessionId in GamesData) || !('Roles' in GamesData[SessionId]) || !('RevRoles' in GamesData[SessionId])) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  res.json({ "Player": UserId in GamesData[SessionId]['Roles'] ? GamesData[SessionId]['Roles'][UserId] : "N", "All": GamesData[SessionId]["RevRoles"], "AllN": GamesData[SessionId]['Roles'] })
});


app.get("/boards/:SessionId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!(SessionId in GamesData) || !('Boards' in GamesData[SessionId])) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  res.json({ "boards": JSON.stringify(GamesData[SessionId]['Boards']), "Lcount": GamesData[SessionId]['CountL'], "Fcount": GamesData[SessionId]['CountF'], "Ccount": GamesData[SessionId]['CountC'] })
});


app.get("/cards/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!(SessionId in GamesData) || !('Cards' in GamesData[SessionId])) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  res.json(GamesData[SessionId]['Cards'].slice(0, 3))
});

app.get("/status/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  if (!(SessionId in GamesData) || !('Status' in GamesData[SessionId])) {
    res.send("Waiting")
    return;
  }
  res.send(GamesData[SessionId]['Status'])
});
// ---VOTING---


function endVoting(SessionId) {
  if (GamesData[SessionId]['Status'] != 'Voting')
    return
  if (GamesData[SessionId]['Voting']['For'].length > GamesData[SessionId]['Players'].length / 2) {
    GamesData[SessionId]['Tracker'] = 0
    GamesData[SessionId]['Status'] = 'President Cards'
    GamesData[SessionId]['Chancellor'] = GamesData[SessionId]['Candidate']

    EventsToSend[SessionId].push({
      'Data': {
        'For': GamesData[SessionId]['Voting']['For'],
        'Against': GamesData[SessionId]['Voting']['Against'],
        'Abstain': GamesData[SessionId]['Players'].filter(x => !GamesData[SessionId]['Voting']['Voted'].includes(x)),
      }, 'Event': 'Voting Passed', 'For': 'All'
    })

    EventsToSend[SessionId].push({ 'Data': { 'Cards': GamesData[SessionId]['Cards'].slice(0, 3) }, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['President']] })
    //console.log('succes')
    return
  }
  votingFailed(SessionId)
}

const votingFailed = (SessionId) => {
  GamesData[SessionId]['Tracker']++;
  if (GamesData[SessionId]['Tracker'] >= GamesData[SessionId]['Config']['Tracker']) {
    GamesData[SessionId]['Tracker'] = 0
    passLaw(SessionId, GamesData[SessionId]['Cards'].shift())
    if (GamesData[SessionId]['Cards'].length < 3) {
      var cards = GamesData[SessionId]['UsedCards']
      shuffle(cards)
      GamesData[SessionId]['Cards'].push(...cards);
    }
  }

  EventsToSend[SessionId].push({
    'Data': {
      'For': GamesData[SessionId]['Voting']['For'],
      'Against': GamesData[SessionId]['Voting']['Against'],
      'Abstain': GamesData[SessionId]['Players'].filter(x => !GamesData[SessionId]['Voting']['Voted'].includes(x)),
    }, 'Event': 'Voting Failed', 'For': 'All'
  })
  cyclePresident(SessionId)
}


app.post("/chancellor/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Candidate = req.body.Candidate
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not a president";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Selecting Chancellor') {
    res.statusMessage = "Chancellor Has Been Selected";
    res.status(405).end();
    return;
  }
  if (Candidate == UserId || (Candidate == GamesData[SessionId]['LastP'] && GamesData[SessionId]["Players"].length > 5) || Candidate == GamesData[SessionId]['LastC'] || !(GamesData[SessionId]['Players'].includes(Candidate))) {
    res.statusMessage = "Invalid choice";
    res.status(405).end();
    return;
  }
  GamesData[SessionId]['Candidate'] = Candidate
  GamesData[SessionId]['Voting'] = {}
  GamesData[SessionId]['Voting']['For'] = []
  GamesData[SessionId]['Voting']['Against'] = []
  GamesData[SessionId]['Voting']['Voted'] = []
  GamesData[SessionId]['Status'] = 'Voting'
  EventsToSend[SessionId].push({ 'Data': { 'Candidate': Candidate }, 'Event': 'Voting', 'For': 'All' })
  GamesData[SessionId]['Voting']['Timeout'] = setTimeout(() => endVoting(SessionId), GamesData[SessionId]['Config']['VoteTimeout']);
  res.sendStatus(200)
})

app.post("/vote/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const vote = req.body.Vote
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Voting') {
    res.statusMessage = "Voting Has Been Ended";
    res.status(405).end();
    return;
  }
  if (!(GamesData[SessionId]['Players'].includes(UserId)) || (GamesData[SessionId]['Voting']['Voted'].includes(UserId))) {
    res.statusMessage = "Already Voted";
    res.status(405).end();
    return;
  }
  if (vote == 1) {
    GamesData[SessionId]['Voting']['For'].push(UserId)
  } else {
    GamesData[SessionId]['Voting']['Against'].push(UserId)
  } GamesData[SessionId]['Voting']['Voted'].push(UserId)

  EventsToSend[SessionId].push({ 'Data': { 'Player': UserId, 'Vote': (GamesData[SessionId]['Config']['HideVoting'] ? 'none' : vote) }, 'Event': 'Player Voted', 'For': 'All' })
  if (GamesData[SessionId]['Voting']['Voted'].length == GamesData[SessionId]['Players'].length) {
    clearTimeout(GamesData[SessionId]['Voting']['Timeout'])
    endVoting(SessionId)
  }
  res.sendStatus(200)
})


// choose law


app.post("/rejectCard/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Rejected = req.body.Rejected
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] == 'President Cards') {
    if (GamesData[SessionId]['President'] != UserId) {
      res.statusMessage = "Not Your Turn";
      res.status(405).end();
      return;
    }
    if (!(GamesData[SessionId]['Cards'].slice(0, 3).includes(Rejected))) {
      res.statusMessage = "Incorrect Card";
      res.status(405).end();
      return;
    }
    const index = GamesData[SessionId]['Cards'].indexOf(Rejected);
    GamesData[SessionId]['UsedCards'].push(...GamesData[SessionId]['Cards'].splice(index, 1));
    GamesData[SessionId]['Status'] = 'Chancellor Cards'
    EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Chancellor Cards', 'For': 'All' })
    EventsToSend[SessionId].push({ 'Data': { 'Cards': GamesData[SessionId]['Cards'].slice(0, 2), 'Veto': GamesData[SessionId]['Veto'] }, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['Chancellor']] })
    res.sendStatus(200)
    return
  }
  if (GamesData[SessionId]['Status'] != 'Chancellor Cards') {
    res.statusMessage = "Card Has Been Selected";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Chancellor'] != UserId) {
    res.statusMessage = "Not Your Turn";
    res.status(405).end();
    return;
  }
  if (!(GamesData[SessionId]['Cards'].slice(0, 2).includes(Rejected))) {
    res.statusMessage = "Incorrect Card";
    res.status(405).end();
    return;
  }
  const index = GamesData[SessionId]['Cards'].indexOf(Rejected);
  GamesData[SessionId]['UsedCards'].push(...GamesData[SessionId]['Cards'].splice(index, 1));
  GamesData[SessionId]['Status'] = 'Pass Law';
  const Law = GamesData[SessionId]['Cards'].shift();
  passLaw(SessionId, Law);
  res.sendStatus(200)
  return
})


app.post("/veto/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId

  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Chancellor Cards') {
    res.statusMessage = "Card Has Been Selected";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Chancellor'] != UserId) {
    res.statusMessage = "Not Your Turn";
    res.status(405).end();
    return;
  }
  GamesData[SessionId]['Status'] = 'Vetoed'
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Chancellor Veto', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Veto Ask', 'For': [GamesData[SessionId]['President']] })
  res.sendStatus(200)
  return
})


app.post("/vetoReact/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Vote = req.body.Vote

  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Vetoed') {
    res.statusMessage = "Didnt ask";
    res.status(405).end();
    return;
  }

  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not Your Turn";
    res.status(405).end();
    return;
  }
  if (Vote == 1) {
    votingFailed(SessionId)
    res.sendStatus(200)
    return
  }
  GamesData[SessionId]['Status'] = 'Chancellor Cards'
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Chancellor Cards', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': { 'Cards': GamesData[SessionId]['Cards'].slice(0, 2), 'Veto': "disabled" }, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['Chancellor']] })
  res.sendStatus(200)
  return

})

function passLaw(SessionId, Law) {
  if (GamesData[SessionId]['Cards'].length < 3) {
    var cards = GamesData[SessionId]['UsedCards']
    shuffle(cards)
    GamesData[SessionId]['Cards'].push(...cards);
  }
  var pos = -1
  switch (Law) {
    case 'L':
      pos = GamesData[SessionId]['CountL'];
      GamesData[SessionId]['CountL']++
      break;
    case 'F':
      pos = GamesData[SessionId]['CountF'];
      GamesData[SessionId]['CountF']++
      break;
    case 'C':
      pos = GamesData[SessionId]['CountC'];
      GamesData[SessionId]['CountC']++
      break;
  }

  GamesData[SessionId]['LastP'] = GamesData[SessionId]['President']
  GamesData[SessionId]['LastC'] = GamesData[SessionId]['Chancellor']
  GamesData[SessionId]['Chancellor'] = null
  let act = null
  if (pos > -1) {
    act = GamesData[SessionId]['Boards'][Law][pos]
    switch (act) {
      case "Lwin":
      case "Fwin":
      case "Cwin":
        EventsToSend[SessionId].push({ 'Data': { 'party': Law, 'reason': act }, 'Event': 'Win', 'For': 'All' })
        GamesData[SessionId]['Status'] = 'Waiting'
        //res.sendStatus(200)
        return;


      // -------- F ----------
      case "Fveto":
        GamesData[SessionId]['Veto'] = true

      case "Fkill":
        GamesData[SessionId]['Status'] = 'Kill'
        EventsToSend[SessionId].push({ 'Data': { 'law': Law, 'field': act }, 'Event': 'Law Passed', 'For': 'All' })
        //res.sendStatus(200)
        return;

      case "Fpresident":
        GamesData[SessionId]['Status'] = 'Selecting President'
        EventsToSend[SessionId].push({ 'Data': { 'law': Law, 'field': act }, 'Event': 'Law Passed', 'For': 'All' })
        //res.sendStatus(200)
        return;

      case "FcheckRole":
        GamesData[SessionId]['Status'] = 'Checking Role'
        EventsToSend[SessionId].push({ 'Data': { 'law': Law, 'field': act }, 'Event': 'Law Passed', 'For': 'All' })
        //res.sendStatus(200)
        return;


      // -------- C ----------
      case "Cadd":
        GamesData[SessionId]['Cards'].push(...["C", "C", "L"])
        shuffle(GamesData[SessionId]['Cards'])
        break;


    }
  }
  EventsToSend[SessionId].push({ 'Data': { 'law': Law, 'field': act }, 'Event': 'Law Passed', 'For': 'All' })
  cyclePresident(SessionId)
  //res.sendStatus(200)
}

const cyclePresident = (SessionId) => {
  //console.log("Cycle")
  GamesData[SessionId]['PresidentId']++;
  if (GamesData[SessionId]["PresidentId"] >= GamesData[SessionId]['Players'].length) GamesData[SessionId]['PresidentId'] = 0
  GamesData[SessionId]['President'] = GamesData[SessionId]['Players'][GamesData[SessionId]['PresidentId']]
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'New President', 'For': [GamesData[SessionId]['President']], 'Rev': true })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [GamesData[SessionId]['President']] })
  //console.log("Cycle2")
}

app.post("/checkRole/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Checked = req.body.Checked

  if (GamesData[SessionId]['Status'] != 'Checking Role') {
    res.statusMessage = "Not This State";
    res.status(405).end();
    return
  }

  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not You";
    res.status(405).end();
    return
  }

  if (!('Players' in GamesData[SessionId]) || !GamesData[SessionId]['Players'].includes(Checked)) {
    res.statusMessage = "Not Joined";
    res.status(405).end();
    return
  }
  res.json({ "Role": GamesData[SessionId]["Roles"][Checked] })
  EventsToSend[SessionId].push({ 'Data': { "Checked": Checked, "President": UserId, "Role": GamesData[SessionId]["Roles"][Checked] }, 'Event': 'President Checked', 'For': UserId })
  EventsToSend[SessionId].push({ 'Data': { "Checked": Checked, "President": UserId }, 'Event': 'President Checked', 'For': [UserId], 'Rev': true })
  cyclePresident(SessionId)
});


app.post("/choosePresident/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const NewP = req.body.NewP

  if (GamesData[SessionId]['Status'] != 'Selecting President') {
    res.statusMessage = "Not This State";
    res.status(405).end();
    return
  }

  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not You";
    res.status(405).end();
    return
  }

  if (!('Players' in GamesData[SessionId]) || !GamesData[SessionId]['Players'].includes(NewP)) {
    res.statusMessage = "Not Joined";
    res.status(405).end();
    return
  }

  GamesData[SessionId]['President'] = NewP
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'

  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'New President', 'For': [GamesData[SessionId]['President']], 'Rev': true })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [GamesData[SessionId]['President']] })
  res.sendStatus(200)
});

app.post("/kill/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Killed = req.body.Killed

  if (GamesData[SessionId]['Status'] != 'Kill') {
    res.statusMessage = "Not This State";
    res.status(405).end();
    return
  }

  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not You";
    res.status(405).end();
    return
  }

  if (!('Players' in GamesData[SessionId]) || !GamesData[SessionId]['Players'].includes(Killed)) {
    res.statusMessage = "Not Joined";
    res.status(405).end();
    return
  }

  if (GamesData[SessionId]['Roles'][Killed] == 'H') {
    EventsToSend[SessionId].push({ 'Data': { 'party': "!F", 'reason': "Hitler" }, 'Event': 'Win', 'For': 'All' })
    end(SessionId)
    res.sendStatus(200)
    return;
  }

  const index = GamesData[SessionId]['Players'].indexOf(Killed);
  GamesData[SessionId]["Dead"].push([Killed, index])
  EventsToSend[SessionId].push({ 'Data': { 'player': Killed }, 'Event': 'Killed', 'For': 'All' })
  GamesData[SessionId]['Players'].splice(index, 1);
  cyclePresident(SessionId)
  res.sendStatus(200)
});

const end = (SessionId) => {
  GamesData[SessionId]['Roles'] = {}
  GamesData[SessionId]['RevRoles'] = {}
  GamesData[SessionId]['Status'] = 'Waiting'
  GamesData[SessionId]['President'] = null
  GamesData[SessionId]['PresidentId'] = null
  GamesData[SessionId]['Chancellor'] = null
  GamesData[SessionId]['Candidate'] = null
  GamesData[SessionId]['LastP'] = null
  GamesData[SessionId]['LastC'] = null
  GamesData[SessionId]['CountL'] = 0
  GamesData[SessionId]['CountC'] = 0
  GamesData[SessionId]['CountF'] = 0
  GamesData[SessionId]['Tracker'] = 0
  GamesData[SessionId]['Veto'] = false
  GamesData[SessionId]['Dead'] = []
}


app.post("/stop/:SessionId", (req, res) => {
  const SessionId = req.params.SessionId
  end(SessionId)
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Stopped', 'For': 'All' })
  res.sendStatus(200)
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
