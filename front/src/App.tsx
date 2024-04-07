import { useState } from 'react'
import Card from './assets/Card.tsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  
  const enableDropping = (event: React.DragEvent<HTMLDivElement>) => { 
    event.preventDefault();
}
const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const id = event.dataTransfer.getData('text');
    console.log(`Somebody dropped an element with id: ${id}`);
}
  return (
    <>
      <div>
        <Card type='F'/>
      </div>
      <h1>Vite + React</h1>
      <div onDragOver={enableDropping} onDrop={handleDrop}>Drop Area</div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
