import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function Main() {
  const queryParameters = new URLSearchParams(window.location.search)
  const code = queryParameters.get("code")

  const [ButtonDisabled, setButtonDisabled] = useState(true);
  const SessionId = useRef(0);;
  const UserId = useRef(0);
  const TOKEN = useRef(null);

  const [IsSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = () => {
    setIsSubmitted(true)
  }

  const deleteToken = () => {
    localStorage.removeItem("TOKEN")
    localStorage.removeItem("TOKEN-exp")
    localStorage.removeItem("TOKEN-regen")
  }

  const saveToken = (token, exp, regen = null) => {
    localStorage.setItem("TOKEN", token)
    const expirationDate = Date.now() + exp * 1000;
    localStorage.setItem("TOKEN-exp", expirationDate)
    localStorage.setItem("TOKEN-regen", regen)

    console.log(localStorage.getItem("TOKEN"))
  };

  const loadToken = () => {
    const Token = localStorage.getItem("TOKEN");
    console.log(Token)
    if (!Token) return null;
    console.log("A")
    const TokenEXP = localStorage.getItem("TOKEN-exp");
    let timo = TokenEXP - Date.now()
    console.log("B", timo)
    if (timo > 0) {
      setTimeout(deleteToken, timo)
      return Token
    }
    deleteToken()
    return null
  };

  const getToken = (code) => {
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
        response.json().then(json => {
          if (json.at) {
            saveToken(json.at, json.exp);

            TOKEN.current = json.at;
            GetPlayerData();
          }
        });
      }
    })
  }

  useEffect(() => {
    let Token = loadToken()
    if (Token) {
      TOKEN.current = Token
      GetPlayerData();
    }
    else if (code != null) {
      queryParameters.delete("code")
      history.replaceState(null, null, queryParameters.toString())
      getToken(code)
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
          UserId.current = json.id
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
        }).then(setTimeout(onSubmit, 100)
          //setButtonDisabled(false)
        );
      } else if (code != null) {
        queryParameters.delete("code")
        history.replaceState(null, null, queryParameters.toString())
        getToken(code)
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
        {ButtonDisabled ? <button onClick={log}>Login</button> : <button onClick={log} disabled>Login</button>}
        <form onSubmit={onSubmit} id='Form'>
          <label>SessionId:
            <input
              type="number"
              value={SessionId}
              onChange={(e) => SessionId.current = e.target.value}
              disabled
            />
          </label>
          <label>UserId:
            <input
              type="number"
              value={UserId}
              onChange={(e) => UserId.current = e.target.value}
              disabled
            />
          </label>
          {//ButtonDisabled ? <input type="submit" disabled /> : <input type="submit" />
          }
        </form>
      </div>
    )
  return (<div>
    <button onClick={() => { deleteToken(); window.location.reload(); }}>Logout</button>
    <App SessionId={SessionId.current} UserId={UserId.current} />
  </div>)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Main />
) 
