import React, {useState} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function Main() {
  const [SessionId, setSessionId] = useState(1);
  const [UserId, setUserId] = useState(1);
  const [IsSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = () => {
    setIsSubmitted(true)
}
  if(!IsSubmitted)
  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>SessionId:
          <input
            type="number" 
            value={SessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </label>
        <label>UserId:
          <input
            type="number" 
            value={UserId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
        <input type="submit"/>
      </form>
    </div>
  )
  return(<App SessionId={SessionId} UserId={UserId} />)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Main /></React.StrictMode>
) 
