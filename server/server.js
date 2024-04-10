import express, { json } from "express";
import { config } from "dotenv";
const fetch = import("node-fetch")
import cors from 'cors';

config({ path: "../.env" });

const app = express();
const port = 3001;

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


app.get("/subscribe/:SessionId/:UserId", (req, res) => {
  console.log('subsc')
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  console.log(SessionId)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    "Connection": 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  if (SessionId in GamesData) {
    res.write(`data: {"event": "Subscribed","status": "${GamesData[SessionId]['Status']}"}\n\n`);
  } else {
    res.write('data: {"event": "Subscribed","status": "Waiting"}\n\n');
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if (!(SessionId in EventsToSend)) EventsToSend[SessionId] = []
  var lastevent = EventsToSend[SessionId].length
  const interval = setInterval(() => {
    if (EventsToSend[SessionId].length > lastevent) {
      var event = EventsToSend[SessionId][lastevent]
      if (event['For'] == 'All' || event['For'].includes(UserId)) {
        res.write(`data: {"event": "${event['Event']}","data": "${JSON.stringify(event['Data'])}"}\n\n`)
      }
      lastevent++;
    }
  }, 200);

  res.on("close", () => {
    clearInterval(interval);
    //if (SessionId in GamesData && 'Subscribed' in GamesData[SessionId]) {
    //  const index = GamesData[SessionId]['Subscribed'].indexOf(UserId);
    //  GamesData[SessionId]['Subscribed'].splice(index, 1);
    //}
    if (SessionId in GamesData && 'Players' in GamesData[SessionId] && UserId in GamesData[SessionId]['Players']) {
      const index = GamesData[SessionId]['Players'].indexOf(UserId);
      GamesData[SessionId]['Players'].splice(index, 1);
    }
    res.end();
  });
});


app.post("/join/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  if (SessionId in GamesData) {
    if (GamesData[SessionId]['Status'] != 'Waiting') {
      res.send(`event: Failed\nreason: Game started\n\n`);
      return
    }
  } else {
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if (!('Players' in GamesData[SessionId])) {
    GamesData[SessionId]['Players'] = []
  }
  GamesData[SessionId]['Players'].push(UserId)
  res.send(`event: Joined\nstatus: ${GamesData[SessionId]['Status']}\n\n`);
});


app.post("/start/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!SessionId in GamesData) {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Waiting') {
    res.send(`event: Failed\nreason: Game started\n\n`);
    return
  }

  //var players = req.body.players
  if (!('Players' in GamesData[SessionId])) {
    res.statusMessage = "No Players";
res.status(450).end();
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

  for (let i = 0; i < players.length; i++) {
    rolep[players[i]] = rolec[i]
  }

  GamesData[SessionId]['Roles'] = rolep

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
  const president = players[presidentid]
  GamesData[SessionId]['President'] = president
  GamesData[SessionId]['PresidentId'] = presidentid
  GamesData[SessionId]['Chancellor'] = null
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
  GamesData[SessionId]['Config']['VoteTimeout'] = 10000
  GamesData[SessionId]['Config']['Tracker'] = 3

  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Started', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [president] })
  res.sendStatus(200);
});


app.get("/players/:SessionId/", (req, res) => {
  const SessionId = req.params.SessionId
  //const UserId = req.params.UserId
  if (!SessionId in GamesData) {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  if (!('Players' in GamesData[SessionId])) {
    res.statusMessage = "No Players";
res.status(450).end();
    return;
  }
  res.send(`event: Get Players\nplayers: ${JSON.stringify(GamesData[SessionId]['Players'])}\nlastP: ${GamesData[SessionId]['LastP']}\nlastC: ${GamesData[SessionId]['LastC']}\npresident: ${GamesData[SessionId]['President']}\n\n`)
});


app.get("/roles/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId

  if (!(SessionId in GamesData) || !('Roles' in GamesData[SessionId])) {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  res.send(`event: Get Roles\nroles: ${JSON.stringify(GamesData[SessionId]['Roles'])}\n\n`)
});


app.get("/boards/:SessionId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!(SessionId in GamesData) || !('Boards' in GamesData[SessionId])) {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  res.send(`event: Get Boards\nboards: ${JSON.stringify(GamesData[SessionId]['Boards'])}\ncountL: ${GamesData[SessionId]['CountL']}\ncountF: ${GamesData[SessionId]['CountF']}\ncountC: ${GamesData[SessionId]['CountC']}\n\n`)
});


app.get("/cards/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  if (!(SessionId in GamesData) || !('Cards' in GamesData[SessionId])) {
    res.status(405)
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  res.send(`data: ${JSON.stringify(GamesData[SessionId]['Cards'].slice(0, 3))}\n\n`)
});

app.get("/status/:SessionId/", (req, res) => {
  if (!(SessionId in GamesData) || !('Status' in GamesData[SessionId])) {
    res.status(405)
    res.statusMessage =  "No Game";
res.status(450).end();
    return;
  }
  res.send(`data: ${GamesData[SessionId]['Status']}`)
});
// ---VOTING---


function endVoting(SessionId) {
  if (GamesData[SessionId]['Status'] != 'Voting')
    return
  if (GamesData[SessionId]['Voting']['For'] > GamesData[SessionId]['Players'].length / 2) {
    GamesData[SessionId]['Tracker'] = 0
    GamesData[SessionId]['Status'] = 'President Cards'

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
  if (GamesData[SessionId][PresidentId] >= GamesData[SessionId]['Players'].length) GamesData[SessionId]['PresidentId'] = 0

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
res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['President'] != UserId) {
    res.statusMessage = "Not a president";
    res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Selecting Chancellor') {
    res.statusMessage = "Chancellor Has Been Selected";
    res.status(450).end();
    return;
  }
  if (Candidate == UserId || Candidate == GamesData[SessionId]['LastP'] || Candidate == GamesData[SessionId]['LastC'] || !(GamesData[SessionId]['Players'].includes(Candidate))) {
    res.statusMessage = "Invalid choice";
    res.status(450).end();
    return;
  }
  GamesData[SessionId]['Chancellor'] = Candidate
  GamesData[SessionId]['Voting'] = {}
  GamesData[SessionId]['Voting']['For'] = []
  GamesData[SessionId]['Voting']['Against'] = []
  GamesData[SessionId]['Voting']['Voted'] = []
  GamesData[SessionId]['Status'] == 'Voting'
  EventsToSend[SessionId].push({ 'Data': { 'President': UserId, 'Chancellor': Candidate }, 'Event': 'Voting', 'For': 'All' })
  GamesData[SessionId]['Voting']['Timeout'] = setTimeout(endVoting(SessionId), GamesData[SessionId]['Config']['VoteTimeout']);
})

app.post("/vote/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const vote = req.body.Candidate
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Voting') {
    res.statusMessage = "Voting Has Been Ended";
    res.status(450).end();
    return;
  }
  if (!(GamesData[SessionId]['Players'].includes(UserId)) || (GamesData[SessionId]['Voting']['Voted'].includes(UserId))) {
    res.statusMessage = "Already Voted";
    res.status(450).end();
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
})


// choose law


app.post("/rejectCard/:SessionId/:UserId", (req, res) => {
  const SessionId = req.params.SessionId
  const UserId = req.params.UserId
  const Rejected = req.body.Rejected
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.statusMessage = "No Game";
res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['Status'] == 'President Cards') {
    if (GamesData[SessionId]['President'] != UserId) {
      res.statusMessage = "Not Your Turn";
      res.status(450).end();
      return;
    }
    if (!(GamesData[SessionId]['Cards'].slice(0, 3).includes(Rejected))) {
      res.statusMessage = "Incorrect Card";
      res.status(450).end();
      return;
    }
    const index = GamesData[SessionId]['Cards'].indexOf(Rejected);
    GamesData[SessionId]['UsedCards'].push(...GamesData[SessionId]['Cards'].splice(index, 1));
    GamesData[SessionId]['Status'] = 'Chancellor Cards'
    EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Chancellor Cards', 'For': 'All' })
    EventsToSend[SessionId].push({ 'Data': { 'cards': GamesData[SessionId]['Cards'].slice(0, 2) }, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['Chancellor']] })
    return
  }
  if (GamesData[SessionId]['Status'] == 'Chancellor Cards') {
    res.statusMessage = "Card Has Been Selected";
    res.status(450).end();
    return;
  }
  if (GamesData[SessionId]['Chancellor'] != UserId) {
    res.statusMessage = "Not Your Turn";
    res.status(450).end();
    return;
  }
  if (!(GamesData[SessionId]['Cards'].slice(0, 2).includes(Rejected))) {
    res.statusMessage = "Incorrect Card";
    res.status(450).end();
    return;
  }
  const index = GamesData[SessionId]['Cards'].indexOf(Rejected);
  GamesData[SessionId]['UsedCards'].push(...GamesData[SessionId]['Cards'].splice(index, 1));
  GamesData[SessionId]['Status'] = 'Pass Law';
  const Law = GamesData[SessionId]['Cards'].shift();
  passLaw(Law);
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
  GamesData[SessionId]['Status'] = 'Waiting'
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});