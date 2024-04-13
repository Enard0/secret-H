import ReactModal from "react-modal";
import React, { useEffect, useState} from "react";

class Lobby extends React.Component {
  
  constructor ({ SessionId, UserId, Players, Spectators})  {
    super();
    this.SessionId = SessionId
    this.UserId = UserId
    this.Spectators = Spectators
    this.Players = Players
    console.debug(Players)
    this.joined = Players.includes(UserId)
  }

  Join = () => {fetch(`/api/join/${this.SessionId}/${this.UserId}/`, { method: "POST" }).then(response => {
    if (response.status == 200) {
      this.joined = true
    }
  })}

  Leave = () => {fetch(`/api/leave/${this.SessionId}/${this.UserId}/`, { method: "POST" }).then(response => {
    if (response.status == 200) {
      this.joined = false
    }
  })}

  render () {
    return (
      <div>
        <div className="Players">
         {(() => {
          const toRender = [];

          for (let i = 0; i < this.Spectators.length; i++) {
            toRender.push(<div key={i} className={this.Players.includes(this.Spectators[i]) ? "player" : "spectator"}><p>{this.Spectators[i]}</p></div>);
          }
          return toRender;
        })()}
        </div>
        <button onClick={this.joined ? this.Leave : this.Join}>{this.joined?"Leave":"Join"}</button>
      </div>
    );
  }
}

export default Lobby