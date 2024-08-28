import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function Main() {
  const queryParameters = new URLSearchParams(window.location.search)
  const code = queryParameters.get("code")

  const [ButtonDisabled, setButtonDisabled] = useState(true);
  const [SessionId, setSessionId] = useState(1);
  const [UserId, setUserId] = useState(1);
  const TOKEN = useRef(null);

  const [IsSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = () => {
    setIsSubmitted(true)
  }

  useEffect(() => {
    /*fetch(`/api/qj`).then(response => {
      if (response.status == 200) {
        response.json().then(json => {setUserId(json.Id)})
      }
    })*/
    if (code != null) {
      queryParameters.delete("code")
      history.replaceState(null, null, queryParameters.toString())
      fetch('/api/token', {
        method: "POST",
        body: JSON.stringify({
          code: code,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then(response => {
        if (response.status == 200) {
          response.json().then(json => { console.log(json); TOKEN.current = json.at; GetPlayerData(); });
        }
      })
    }
  }, [])

  const GetPlayerData = () => {
    fetch('https://discord.com/api/users/@me', {
      headers: {
        "Authorization": `Bearer ${TOKEN.current}`
      }
    }).then(response => {
      console.log(response);
      if (response.status == 200) {
        response.json().then(json => {
          setUserId(json.id)
          const username = json.global_name
          const avatar = json.avatar
          fetch(`/api/playerData/${json.id}`, {
            method: "POST",
            body: JSON.stringify({
              username: username,
              avatar: avatar,
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
          });
        }).then(setButtonDisabled(false));
      }
    })
  }

  const ClientID = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const RedirectURL = encodeURIComponent(import.meta.env.VITE_REDIRECT_URL);

  const log = () => { window.open(`https://discord.com/oauth2/authorize?client_id=${ClientID}&response_type=code&redirect_uri=${RedirectURL}&scope=identify`, "_self") }
  if (!IsSubmitted)
    return (
      <div>
        Code: {code}
        {ButtonDisabled ? <button onClick={log}>Login</button>: <button onClick={log} disabled>Login</button>}
        <form onSubmit={onSubmit}>
          <label>SessionId:
            <input
              type="number"
              value={SessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled
            />
          </label>
          <label>UserId:
            <input
              type="number"
              value={UserId}
              onChange={(e) => setUserId(e.target.value)}
              disabled
            />
          </label>
          {ButtonDisabled ? <input type="submit" disabled /> : <input type="submit" />}
        </form>
      </div>
    )
  return (<App SessionId={SessionId} UserId={UserId} />)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Main />
) 
