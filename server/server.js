import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

// Allow express to parse JSON bodies
app.use(express.json());
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


app.get("/subscribe", (req, res) => {
  const SessionId = req.body.SessionId
  const UserId = req.body.UserId
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  if (SessionId in GamesData) {
    res.write(`event: Subscribed\nstatus: ${GamesData[SessionId]['Status']}\n\n`);
  } else {
    res.write('event: Subscribed\nstatus: Waiting\n\n');
    GamesData[SessionId] = {}
    GamesData[SessionId]['Status'] = 'Waiting'
  }
  if (!('Subscribed' in GamesData[SessionId])) {
    GamesData[SessionId]['Subscribed'] = []
  }
  GamesData[SessionId]['Subscribed'].push(UserId)
  if (!(SessionId in EventsToSend)) EventsToSend[SessionId] = []
  var lastevent = EventsToSend[SessionId].length
  const interval = setInterval(() => {
    if (EventsToSend[SessionId].length > lastevent) {
      var event = EventsToSend[SessionId][lastevent]
      if (event['For'] == 'All' || event['For'].includes(UserId)) {
        res.write(`event: ${event['Event']}\ndata: ${JSON.stringify(event['Data'])}\n\n`)
      }
      lastevent++;
    }
  }, 200);

  res.on("close", () => {
    clearInterval(interval);
    if (SessionId in GamesData && 'Subscribed' in GamesData[SessionId]) {
      const index = GamesData[SessionId]['Subscribed'].indexOf(UserId);
      GamesData[SessionId]['Subscribed'].splice(index, 1);
    }
    if (SessionId in GamesData && 'Players' in GamesData[SessionId] && UserId in GamesData[SessionId]['Players']) {
      const index = GamesData[SessionId]['Players'].indexOf(UserId);
      GamesData[SessionId]['Players'].splice(index, 1);
    }
    res.end();
  });
});


app.post("/join", (req, res) => {
  const SessionId = req.body.SessionId
  const UserId = req.body.UserId
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


app.post("/start", (req, res) => {
  const SessionId = req.body.SessionId
  if (!SessionId in GamesData) {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Waiting') {
    res.send(`event: Failed\nreason: Game started\n\n`);
    return
  }

  //var players = req.body.players
  if (!('Players' in GamesData[SessionId])) {
    res.send('event: Failed\nreason: No Players\n\n');
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
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'
  GamesData[SessionId]['Config'] = {}
  GamesData[SessionId]['Config']['HideVoting'] = false
  GamesData[SessionId]['Config']['VoteTimeout'] = 10000
  GamesData[SessionId]['Config']['Tracker'] = 3


  const joined = GamesData[SessionId]['Subscribed']
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Started', 'For': 'All' })
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [president] })
  res.sendStatus(200);
});


app.get("/players", (req, res) => {
  const SessionId = req.body.SessionId
  //const UserId = req.body.UserId
  if (!SessionId in GamesData) {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  if (!('Players' in GamesData[SessionId])) {
    res.send('event: Failed\nreason: No Players\n\n');
    return;
  }
  res.send(`event: getplayers\nplayers: ${JSON.stringify(GamesData[SessionId]['Players'])}\nlastP: ${GamesData[SessionId]['LastP']}\nlastC: ${GamesData[SessionId]['LastC']}\npresident: ${GamesData[SessionId]['President']}\n\n`)
});


app.get("/roles", (req, res) => {
  const SessionId = req.body.SessionId
  //const UserId = req.body.UserId

  if (!(SessionId in GamesData) || !('Roles' in GamesData[SessionId])) {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  res.send(`event: getroles\nroles: ${JSON.stringify(GamesData[SessionId]['Roles'])}\n\n`)
});


app.get("/boards", (req, res) => {
  const SessionId = req.body.SessionId
  if (!(SessionId in GamesData) || !('Boards' in GamesData[SessionId])) {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  res.send(`event: getboards\nboards: ${JSON.stringify(GamesData[SessionId]['Boards'])}\ncountL: ${GamesData[SessionId]['CountL']}\ncountF: ${GamesData[SessionId]['CountF']}\ncountC: ${GamesData[SessionId]['CountC']}\n\n`)
});


// ---VOTING---


function endVoting(SessionId) {
  if (GamesData[SessionId]['Voting']['For'] > GamesData[SessionId]['Players'].length / 2) {
    GamesData[SessionId]['Tracker'] = 0
    GamesData[SessionId]['Status'] = 'President Cards'
    if (GamesData[SessionId]['Config']['HideVoting']) {
      EventsToSend[SessionId].push({
        'Data': {
          'For': GamesData[SessionId]['Voting']['For'].length,
          'Against': GamesData[SessionId]['Voting']['Against'].length,
          'Players': GamesData[SessionId]['Players'].length
        }, 'Event': 'Voting Passed', 'For': 'All'
      })
    } else {
      EventsToSend[SessionId].push({
        'Data': {
          'For': GamesData[SessionId]['Voting']['For'],
          'Against': GamesData[SessionId]['Voting']['Against'],
          'Players': GamesData[SessionId]['Players'],
        }, 'Event': 'Voting Passed', 'For': 'All'
      })
    }
    EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Pass Laws', 'For': [GamesData[SessionId]['President']] })
    console.log('succes')
    return
  }
  GamesData[SessionId]['Tracker']++;
  if (GamesData[SessionId]['Tracker'] >= GamesData[SessionId]['Config']['Tracker']) {
    GamesData[SessionId]['Tracker'] = 0
    passLaw(GamesData[SessionId]['Cards'][0])
  }


  GamesData[SessionId]['PresidentId']++;
  if (GamesData[SessionId][PresidentId] >= GamesData[SessionId]['Players'].length) GamesData[SessionId]['PresidentId'] = 0

  GamesData[SessionId]['President'] = GamesData[SessionId]['Players'][GamesData[SessionId]['PresidentId']]
  GamesData[SessionId]['Status'] = 'Selecting Chancellor'

  if (GamesData[SessionId]['Config']['HideVoting']) {
    EventsToSend[SessionId].push({
      'Data': {
        'For': GamesData[SessionId]['Voting']['For'].length,
        'Against': GamesData[SessionId]['Voting']['Against'].length,
        'Players': GamesData[SessionId]['Players'].length
      }, 'Event': 'Voting Failed', 'For': 'All'
    })
  } else {
    EventsToSend[SessionId].push({
      'Data': {
        'For': GamesData[SessionId]['Voting']['For'],
        'Against': GamesData[SessionId]['Voting']['Against'],
        'Players': GamesData[SessionId]['Players'],
      }, 'Event': 'Voting Failed', 'For': 'All'
    })
  }
  EventsToSend[SessionId].push({ 'Data': {}, 'Event': 'Became President', 'For': [GamesData[SessionId]['President']] })
}

app.post("/chancellor", (req, res) => {
  const SessionId = req.body.SessionId
  const UserId = req.body.UserId
  const Candidate = req.body.Candidate
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  if (GamesData[SessionId]['President'] != UserId) {
    res.send('event: Failed\nreason: Not a president')
    return
  }
  if (GamesData[SessionId]['Status'] != 'Selecting Chancellor') {
    res.send('event: Failed\nreason: Chancellor Has Been Selected')
    return
  }
  if (Candidate == UserId || Candidate == GamesData[SessionId]['LastP'] || Candidate == GamesData[SessionId]['LastC'] || !(GamesData[SessionId]['Players'].includes(Candidate))) {
    res.send('event: Failed\nreason: Invalid choice')
    return
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

app.post("/vote", (req, res) => {
  const SessionId = req.body.SessionId
  const UserId = req.body.UserId
  const vote = req.body.Candidate
  if (!(SessionId in GamesData) || GamesData[SessionId]['Status'] == 'Waiting') {
    res.send('event: Failed\nreason: No Game\n\n');
    return;
  }
  if (GamesData[SessionId]['Status'] != 'Voting') {
    res.send('event: Failed\nreason: Voting Has Been Ended')
    return
  }
  if (!(GamesData[SessionId]['Players'].includes(UserId)) || (GamesData[SessionId]['Voting']['Voted'].includes(UserId))) {
    res.send('event: Failed\nreason: Already Voted')
    return
  }
  if (vote == 1) {
    GamesData[SessionId]['Voting']['For'].push(UserId)
  } else {
    GamesData[SessionId]['Voting']['Against'].push(UserId)
  } GamesData[SessionId]['Voting']['Voted'].push(UserId)

  if (GamesData[SessionId]['Voting']['Voted'].length == GamesData[SessionId]['Players'].length) {
    clearTimeout(GamesData[SessionId]['Voting']['Timeout'])
    endVoting(SessionId)
  }
})


function passLaw(Law){
  //Do Nohing
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});