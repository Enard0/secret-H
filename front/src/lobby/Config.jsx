import React, { useEffect, useState } from "react";

const Config = ({ SessionId, UserId }) => {

    const [Cards, setCards] = useState(
        {
            "F": 0,
            "L": 0,
            "C": 0
        }
    );

    const [Roles, setRoles] = useState(
        {
            "F": 0,
            "L": 0,
            "C": 0,
            "H": 1,
        }
    );

    const [Boards, setBoards] = useState(
        {
            "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"],
            "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
        }
    );


    const Start = (e) => {
        e.preventDefault();
        fetch(`/api/start/${SessionId}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({"roles": Roles, "cards": Cards, "boards": Boards}),
        })
    }

    return (
        <div>
            <form className="config">
                <div className="cards">
                    <label>L:
                        <input
                            type="number"
                            value={Cards["L"]}
                            onChange={(e) => setCards({ ...Cards, "L": e.target.value })}
                        />
                    </label>
                    <label>F:
                        <input
                            type="number"
                            value={Cards["F"]}
                            onChange={(e) => setCards({ ...Cards, "F": e.target.value })}
                        />
                    </label>
                    <label>C:
                        <input
                            type="number"
                            value={Cards["C"]}
                            onChange={(e) => setCards({ ...Cards, "C": e.target.value })}
                        />
                    </label>
                </div>

                <div className="roles">
                    <label>L:
                        <input
                            type="number"
                            value={Roles["L"]}
                            onChange={(e) => setRoles({ ...Roles, "L": e.target.value })}
                        />
                    </label>
                    <label>F:
                        <input
                            type="number"
                            value={Roles["F"]}
                            onChange={(e) => setRoles({ ...Roles, "F": e.target.value })}
                        />
                    </label>
                    <label>C:
                        <input
                            type="number"
                            value={Roles["C"]}
                            onChange={(e) => setRoles({ ...Roles, "C": e.target.value })}
                        />
                    </label>
                </div>

                <button onClick={Start}>Start</button>
            </form>
        </div>
    );
}

export default Config