import React, { useEffect, useState } from "react";
import Config from "./Config";

const Lobby = ({ SessionId, UserId, _CanJoin, _Joined }) => {
    const [CanJoin, setCanJoin] = useState(_CanJoin);
    const [Joined, setJoined] = useState(_Joined);


    useEffect(() => {
        setCanJoin(_CanJoin);
    }, [_CanJoin])

    const Join = () => {
        fetch(`/api/join/${SessionId}/${UserId}/`, { method: "POST" }).then(response => {
            if (response.status == 200) {
                setJoined(true)
            }
        })
    }

    const Leave = () => {
        fetch(`/api/leave/${SessionId}/${UserId}/`, { method: "POST" }).then(response => {
            if (response.status == 200) {
                setJoined(false)
            }
        })
    }


    if (CanJoin) {
        return (
            <div>
                <button onClick={Joined ? Leave : Join}>{Joined ? "Leave" : "Join"}</button>
                <Config SessionId={SessionId} UserId={UserId}/>
            </div>
        );
    }
    return(
    <div>
        {Joined && <button>You cannot leave now</button>}
    </div>
    )
}

export default Lobby