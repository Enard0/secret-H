import ReactModal from "react-modal";
import React, { useEffect, useState } from "react";
import './PlayerList.css'
import User from "./Player";

const PlayerList = ({ _Spectators, _Players, _Roles, _Gov = { 'president': 0, "lastC": 0, "lastP": 0, "chancellor": 0 }, _func = null }) => {

  const [Spectators, setSpectators] = useState(_Spectators);
  const [Players, setPlayers] = useState(_Players);
  const [Roles, setRoles] = useState(_Roles);
  const [Selected, setSelected] = useState(null);
  
  const select = (_id) => {
    if (!_func(_id)) return;
    setSelected(_id)
  }

  useEffect(() => {
    setSpectators(_Spectators);
  }, [_Spectators]);

  useEffect(() => {
    setPlayers(_Players);
  }, [_Players])

  useEffect(() => {
    setRoles(_Roles);
  }, [_Roles])

  const getClasses = (Id) => {
    var classes = []
    if (Players.includes(Id)) {
      classes.push("player")
      if (Id in Roles) classes.push(Roles[Id])
    } else {
      classes.push("spectator")
    }
    if (Id == Selected) classes.push("selected")
    for (const [role, person] of Object.entries(_Gov)) {
      if (person == Id) classes.push(role)
    }
    return classes.join(" ")
  }

  return (
    <div className="Player-list">
      <div className="line" />
      {(() => {
        const toRender = [];
        for (let i = 0; i < Spectators.length; i++) {
          toRender.push(<User key={i}
            _Classes={getClasses(Spectators[i])}
            _Id={Spectators[i]} _func={(_func) && (select)} />);
        }
        return toRender;
      })()}
    </div>
  );
}

export default PlayerList