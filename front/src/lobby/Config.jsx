import React, { useEffect, useState, useRef } from "react";

const Config = ({ SessionId, UserId,  _Playernr }) => {    

    const doNothing = () => {};

    const [Cards, setCards] = useState(
        {
            "F": 10,
            "L": 5,
            "C": 8
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

    const Boards = useRef(
        {
            "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"],
            "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
        }
    );

    const presets = {6:{"Roles":{"F": 1,"L": 3,"C": 1,},
                        "Boards":{"F": ["Fempty", "Fempty", "FcheckCards", "Fkill", "Fveto", "Fwin"],
                                "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Cwin"]}},
                    7:{"Roles":{"F": 1,"L": 4,"C": 1,},
                    "Boards":{"F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Cwin"]}},
                    8:{"Roles":{"F": 2,"L": 4,"C": 1,},
                    "Boards":{"F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]}},
                    9:{"Roles":{"F": 2,"L": 4,"C": 2,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]}},
                    10:{"Roles":{"F": 2,"L": 5,"C": 2,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    11:{"Roles":{"F": 3,"L": 5,"C": 2,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    12:{"Roles":{"F": 3,"L": 6,"C": 2,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    13:{"Roles":{"F": 3,"L": 6,"C": 3,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    14:{"Roles":{"F": 3,"L": 7,"C": 3,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    15:{"Roles":{"F": 4,"L": 7,"C": 3,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}},
                    16:{"Roles":{"F": 4,"L": 7,"C": 4,},
                    "Boards":{"F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                            "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]}}
                        }

    useEffect(() => {
        if(_Playernr>=6 && _Playernr<=16){
            Boards.current = { ...Boards.current, ...presets[_Playernr]["Boards"]}
            console.log({ ...Boards.current, ...presets[_Playernr]["Boards"]})
            setRoles({ ...Roles, ...presets[_Playernr]["Roles"]})
            }
    }, [_Playernr])

    const Start = (e) => {
        e.preventDefault();
        console.log(Boards.current);
        fetch(`/api/start/${SessionId}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({"roles": Roles, "cards": Cards, "boards": Boards.current}),
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