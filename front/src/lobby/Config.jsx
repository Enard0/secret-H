import React, { useEffect, useState, useRef } from "react";

const Config = ({ SessionId, UserId, _Playernr }) => {

    const [EnableC, setEnableC] = useState(false)

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

    const enabledPresets = {
        6: {
            "Roles": { "F": 1, "L": 3, "C": 1, },
            "Boards": {
                "F": ["Fempty", "Fempty", "FcheckCards", "Fkill", "Fveto", "Fwin"],
                "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Cwin"]
            }
        },
        7: {
            "Roles": { "F": 1, "L": 4, "C": 1, },
            "Boards": {
                "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Cwin"]
            }
        },
        8: {
            "Roles": { "F": 2, "L": 4, "C": 1, },
            "Boards": {
                "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
            }
        },
        9: {
            "Roles": { "F": 2, "L": 4, "C": 2, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Ccheck", "Cchange", "Cadd", "Cmeet", "Creveal", "Cwin"]
            }
        },
        10: {
            "Roles": { "F": 2, "L": 5, "C": 2, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        11: {
            "Roles": { "F": 3, "L": 5, "C": 2, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        12: {
            "Roles": { "F": 3, "L": 6, "C": 2, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        13: {
            "Roles": { "F": 3, "L": 6, "C": 3, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        14: {
            "Roles": { "F": 3, "L": 7, "C": 3, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        15: {
            "Roles": { "F": 4, "L": 7, "C": 3, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        },
        16: {
            "Roles": { "F": 4, "L": 7, "C": 4, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
                "C": ["Cempty", "Cchange", "Cadd", "Cchange", "Creveal", "Cwin"]
            }
        }
    }

    const disabledPresets = {
        5: {
            "Roles": { "F": 1, "L": 3, "C": 0, },
            "Boards": {
                "F": ["Fempty", "Fempty", "FcheckCards", "Fkill", "Fveto", "Fwin"],
            }
        },
        6: {
            "Roles": { "F": 1, "L": 4, "C": 0, },
            "Boards": {
                "F": ["Fempty", "Fempty", "FcheckCards", "Fkill", "Fveto", "Fwin"],
            }
        },
        7: {
            "Roles": { "F": 2, "L": 4, "C": 0, },
            "Boards": {
                "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            }
        },
        8: {
            "Roles": { "F": 2, "L": 5, "C": 0, },
            "Boards": {
                "F": ["Fempty", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            }
        },
        9: {
            "Roles": { "F": 3, "L": 5, "C": 0, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            }
        },
        10: {
            "Roles": { "F": 3, "L": 6, "C": 0, },
            "Boards": {
                "F": ["FcheckRole", "FcheckRole", "Fpresident", "Fkill", "Fveto", "Fwin"],
            }
        }
    }

    useEffect(() => {
        if (EnableC) {
            if (_Playernr >= 6 && _Playernr <= 16) {
                Boards.current = { ...enabledPresets[_Playernr]["Boards"], "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"] }
                setRoles({ ...enabledPresets[_Playernr]["Roles"], "H": 1 })
            } return
        }
        if (_Playernr >= 6 && _Playernr <= 10) {
            Boards.current = { ...disabledPresets[_Playernr]["Boards"], "L": ["Lempty", "Lempty", "Lempty", "Lempty", "Lwin"], "C": [] }
            setRoles({ ...disabledPresets[_Playernr]["Roles"], "H": 1 })
        }
    }, [_Playernr, EnableC])

    useEffect(() => {
        if (!EnableC) {
            return setCards({ "F": 11, "L": 6, "C": 0 })
        }
        return setCards({ "F": 10, "L": 5, "C": 8 })
    }, [EnableC])

    const Start = (e) => {
        e.preventDefault();
        if (EnableC)
            fetch(`/api/start/${SessionId}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ "roles": Roles, "cards": Cards, "boards": Boards.current }),
            })
        else {
            fetch(`/api/start/${SessionId}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ "roles": { ...Roles, "C": 0 }, "cards": { ...Cards, "C": 0 }, "boards": { ...Boards.current, "C": [] } }),
            })
        }
    }

    return (
        <div>
            <form className="config">
                <div className="Communists">
                    <input type="checkbox" onChange={(e) => { setEnableC(e.target.checked) }} />
                </div>
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
                    {EnableC && <label>C:
                        <input
                            type="number"
                            value={Cards["C"]}
                            onChange={(e) => setCards({ ...Cards, "C": e.target.value })}
                        />
                    </label>}
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
                    {EnableC && <label>C:
                        <input
                            type="number"
                            value={Roles["C"]}
                            onChange={(e) => setRoles({ ...Roles, "C": e.target.value })}
                        />
                    </label>}
                </div>

                <button onClick={Start}>Start</button>
            </form>
        </div>
    );
}

export default Config