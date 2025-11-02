import "./DraggableCard.css"

import React, { useEffect, useState, useRef, useCallback } from "react";


import Lcard from "../assets/policy/liberal.png"
import Fcard from "../assets/policy/fascist.png"
import Ccard from "../assets/policy/communist.png"

import Back from "../assets/policy/back.png"

const Cards = { "L": Lcard, "F": Fcard, "C": Ccard }

const DraggableCard = ({ _Card = "F", dropFields = [] }) => {
  const startPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const size = useRef({ width: 0, height: 0 });
  const parent = useRef();
  const clone = useRef();
  const self = useRef()

  const [isDragged, setIsDragged] = useState(false)
  const [isReleased, setIsReleased] = useState(false)
  const [Pos, setPos] = useState({ x: 0, y: 0 })
  const [Timing, setTiming] = useState("0ms");

  const handleRelease = (x, y, card) => {
    for (const f of dropFields) {
      let pos = f[0].current.getBoundingClientRect()
      if (pos.left < x && x < pos.right && pos.top < y && y < pos.bottom) {
        f[1](card);
        return true;
      }
    }
    return false;
  }

  const start = (e) => {
    setTiming("0ms")
    let pos = self.current.getBoundingClientRect()
    clone.current = self.current.cloneNode(true)
    clone.current.style.visibility = "hidden";
    startPos.current = { x: pos.left, y: pos.top }
    size.current = { width: pos.width, height: pos.height }
    mousePos.current = { x: e.pageX, y: e.pageY }
    setPos({ x: pos.left, y: pos.top })
    setIsDragged(true)
    parent.current = self.current.parentElement
    parent.current.insertBefore(clone.current, self.current)
    document.body.append(self.current)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", end)
  }

  const end = (e) => {
    window.removeEventListener("mousemove", move)
    window.removeEventListener("mouseup", end)
    let drop = handleRelease(e.pageX, e.pageY, _Card);
    if (drop) {
      clone.current.remove()
      self.current.remove()
      return
    }
    let time = Math.hypot(startPos.current.x - e.pageX, startPos.current.y - e.pageY)/3
    setTiming(time+"ms")
    setPos(startPos.current)
    setIsReleased(true)
    setTimeout(() => {
      setIsDragged(false);
      setIsReleased(false);
      parent.current.insertBefore(self.current, clone.current);
      clone.current.remove()
    }, time+200)
  }

  const move = useCallback((e) => {
    setPos({
      x: Math.max(-size.current.width / 2, e.pageX - mousePos.current.x + startPos.current.x),
      y: Math.max(-size.current.height / 2, e.pageY - mousePos.current.y + startPos.current.y)
    })
  }, [])

  return (

    <div ref={self}
      className={`card draggable ${isDragged ? "dragged" : ""} ${isReleased ? "released" : ""}`}
      onMouseDown={!(isDragged || isReleased) ? start : () => { }}
      style={{
        left: Pos.x, top: Pos.y,
        animationDelay: Timing,
        transitionDuration: Timing, 
      }}>
      <div className="images">
        <img src={Back} className="Back" />
        <img src={Cards[_Card]} className="Normal" />
      </div>
    </div>

  )
}

export default DraggableCard