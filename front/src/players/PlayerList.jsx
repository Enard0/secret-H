import ReactModal from "react-modal";
import React, { useEffect, useState } from "react";
import './PlayerList.css'
import User from "./Player";

const PlayerList = ({_Spectators, _Players, _Roles}) => {

  const [Spectators, setSpectators] = useState(_Spectators);
  const [Players, setPlayers] = useState(_Players);
  const [Roles, setRoles] = useState(_Roles);

  useEffect(() => {
    setSpectators(_Spectators);
  },[_Spectators]);

  useEffect(() => {
    setPlayers(_Players);
  },[_Players])

  useEffect(() => {
    setRoles(_Roles);
  },[_Roles])

  return (
      <div className="Player-list">
        <div className="line"/>
        {(() => {
          const toRender = [];

          for (let i = 0; i < Spectators.length; i++) {
            toRender.push(<User key={i} _Classes={Players.includes(Spectators[i]) ? `player ${Spectators[i] in Roles ? Roles[Spectators[i]] : ''}` : "spectator"} _Name={Spectators[i]} _Url={"https://cdn.discordapp.com/avatars/682689661486891019/0f8f56cf265e44684be079c7d6378d00?size=1024"}/>);
          }
          return toRender;
        })()}
      </div>
  );
}

export default PlayerList