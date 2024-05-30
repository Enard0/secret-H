import express, { json } from "express";
import { config } from "dotenv";
const fetch = import("node-fetch")
import cors from 'cors';

config({ path: "../.env" });

const app = express();
const port = 3001;
var curid = 0;

// Allow express to parse JSON bodies
app.use(json());
app.use(cors())

var GamesData = new Object()
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
app.post("/api/token", async (req, res) => {

  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token });
});

app.get("/qj", (req, res) => {
  curid++;
  res.json({"Id": curid});
});

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
  if (UserId in GamesData[SessionId]['Spectators']) {
    clearTimeout(GamesData[SessionId]['Spectators'][UserId])
    GamesData[SessionId]['Spectators'][UserId] = setTimeout(pingdsc, 2000)
  }
  else {
    res.json({ "event": "joined", "next":EventsToSend[SessionId].length })
    EventsToSend[SessionId].push({ 'Data': { 'UserId': UserId }, 'Event': 'Spectator Joined', 'For': 'All' })
    GamesData[SessionId]['Spectators'][UserId] = setTimeout(pingdsc, 2000)
    return
  }
  
  if(EventId==-1){
    res.json({ "next":Math.max(0,EventsToSend[SessionId].length-1), "event": "Failed" })
    return;
  }

  if (EventsToSend[SessionId].length < EventId) {
    res.json({ "next":EventsToSend[SessionId].length, "event": "Failed" })
    return;
    res.statusMessage = `${EventsToSend[SessionId].length} max`;
    res.status(405).end();
    return;
  }

  if (EventsToSend[SessionId].length == EventId) {
    res.json({ "next":EventId, "event": "ping" })
    return;
  }
  if (EventsToSend[SessionId][EventId]['For'] == 'All' || EventsToSend[SessionId][EventId]['For'].includes(UserId)){
    res.json({ "next":EventId+1, "event": EventsToSend[SessionId][EventId]['Event'], "data": JSON.stringify(EventsToSend[SessionId][EventId]['Data']) })
  }else{
    res.json({ "next":EventId+1, "event": "ping" })
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
  GamesData[SessionId]['Config'] = {}
  GamesData[SessionId]['Config']['HideVoting'] = false
  GamesData[SessionId]['Config']['VoteTimeout'] = 100000
  GamesData[SessionId]['Config']['Tracker'] = 3

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
  res.json({"players":GamesData[SessionId]['Players'],})
});

app.get("/gov/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  //const UserId = req.params.UserId
  if (!(SessionId in GamesData)) {
    res.statusMessage = "No Game";
    res.status(405).end();
    return;
  }
  res.json({"lastP": GamesData[SessionId]['LastP'], "lastC": GamesData[SessionId]['LastC'], "president": GamesData[SessionId]['President'], "chancellor": GamesData[SessionId]['Chancellor'] })
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
  res.json({"Player":UserId in GamesData[SessionId]['Roles'] ? GamesData[SessionId]['Roles'][UserId] : "N", "All":GamesData[SessionId]["RevRoles"], "AllN": GamesData[SessionId]['Roles']})
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
        'Players': GamesData[SessionId]['Players'],
      }, 'Event': 'Voting Passed', 'For': 'All'
    })

    EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['President']] })
    console.log('succes')
    return
  }
  GamesData[SessionId]['Tracker']++;
  if (GamesData[SessionId]['Tracker'] >= GamesData[SessionId]['Config']['Tracker']) {
    GamesData[SessionId]['Tracker'] = 0
    passLaw(GamesData[SessionId]['Cards'].shift())
    if (GamesData[SessionId]['Cards'].length < 3) {
      var cards = GamesData[SessionId]['UsedCards']
      shuffle(cards)
      GamesData[SessionId]['Cards'].push(...cards);
    }
  }


  GamesData[SessionId]['PresidentId']++;
  if (GamesData[SessionId]["PresidentId"] >= GamesData[SessionId]['Players'].length) GamesData[SessionId]['PresidentId'] = 0

  GamesData[SessionId]['President'] = GamesData[SessionId]['Players'][GamesData[SessionId]['PresidentId']]
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'

  EventsToSend[SessionId].push({
    'Data': {
      'For': GamesData[SessionId]['Voting']['For'],
      'Against': GamesData[SessionId]['Voting']['Against'],
      'Players': GamesData[SessionId]['Players'],
    }, 'Event': 'Voting Failed', 'For': 'All'
  })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [GamesData[SessionId]['President']] })
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
  if (Candidate == UserId || Candidate == GamesData[SessionId]['LastP'] || Candidate == GamesData[SessionId]['LastC'] || !(GamesData[SessionId]['Players'].includes(Candidate))) {
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
  EventsToSend[SessionId].push({ 'Data': {'Candidate': Candidate }, 'Event': 'Voting', 'For': 'All' })
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
    EventsToSend[SessionId].push({ 'Data': { 'cards': GamesData[SessionId]['Cards'].slice(0, 2) }, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['Chancellor']] })
    res.sendStatus(200)
    return
  }
  if (GamesData[SessionId]['Status'] == 'Chancellor Cards') {
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
  passLaw(Law);
  res.sendStatus(200)
  return
})


function passLaw(Law) {
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
  if (pos > -1) {
    const act = GamesData[SessionId]['Boards'][Law][pos]
    if (act.includes('V')) {
      GamesData[SessionId]['Veto'] = true
    }
  }
  GamesData[SessionId]['PresidentId']++;
  if (GamesData[SessionId][PresidentId] >= GamesData[SessionId]['Players'].length) GamesData[SessionId]['PresidentId'] = 0
  GamesData[SessionId]['LastP'] = GamesData[SessionId]['President']
  GamesData[SessionId]['LastC'] = GamesData[SessionId]['Chancellor']
  GamesData[SessionId]['President'] = GamesData[SessionId]['Players'][GamesData[SessionId]['PresidentId']]
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'
  EventsToSend[SessionId].push({ 'Data': { 'law': Law }, 'Event': 'Law Passed', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [GamesData[SessionId]['President']] })
}


app.post("/stop", (req, res) => {
  const SessionId = req.params.SessionId
  GamesData[SessionId]['Status'] = 'Waiting'
  res.sendStatus(200)
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
