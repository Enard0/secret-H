import ReactModal from "react-modal";
import React, { useEffect, useState } from "react";
import './PlayerList.css'
import User from "./Player";

const PlayerList = ({ _PlayerData, _Spectators, _Players, _Roles, _Gov = { 'president': 0, "lastC": 0, "lastP": 0, "chancellor": 0 }, _func = null, _Dead = [] }) => {

  //const [Spectators, setSpectators] = useState(_Spectators);
  //const [Players, setPlayers] = useState(_Players);
  //const [Roles, setRoles] = useState(_Roles);
  const [Selected, setSelected] = useState(null);
  //const [Dead, setDead] = useState(_Dead);
  const [FullP, setFullP] = useState(_Players)

  const select = (_id) => {
    if (!_func(_id)) return;
    setSelected(_id)
  }

  useEffect(() => {
    let Tall = _Players
    for (let i = 0; i < _Dead.length; i++) {
      Tall.splice(_Dead[i][1], 0, _Dead[i][0])
    }
    setFullP(Tall);
  }, []);

  useEffect(() => {
    let Tall = _Players
    for (let i = 0; i < _Dead.length; i++) {
      Tall.splice(_Dead[i][1], 0, _Dead[i][0])
    }
    setFullP(Tall);
  }, [_Dead, _Players]);

  useEffect(() => {
    if (_func == null) setSelected(null);
  }, [_func])

  const getClasses = (Id) => {
    var classes = []
    if (_Players.includes(Id)) {
      classes.push("player")
      if (Id in _Roles) classes.push(_Roles[Id])
    } else {
      classes.push("spectator")
    }
    if (_Dead.includes(Id)) classes.push("dead")
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
        for (let i = 0; i < _Spectators.length; i++) {
          if (!FullP.includes(_Spectators[i])) {
            //console.log(_PlayerData)
            //console.log("Spec:",_Spectators[i])
            //console.log(_PlayerData[_Spectators[i]])
            toRender.push(<User key={i}
              _Classes={getClasses(_Spectators[i])}
              UserId={_Spectators[i]} _func={(_func) && (select)}
              _line={true}
              _Data={_PlayerData} />);
          }
        }

        for (let i = 0; i < FullP.length; i++) {
          toRender.push(<User key={_Spectators.length + i}
            _Classes={getClasses(FullP[i])}
            UserId={FullP[i]} _func={(_func) && (select)}
            _line={true}
            _Data={_PlayerData} />);
        }

        return toRender;
      })()}
    </div>
  );
}

export default PlayerList