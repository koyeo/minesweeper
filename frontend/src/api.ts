import {Level} from "./Minesweeper";

// const url = 'http://127.0.0.1:1323'
const url = 'http://minesweeper.yeozilla.com:1323'

export interface Session {
    Nickname?: string,
    Time: number,
    Level: number,
}

export function NewSession(session: Session) {
    return fetch(`${url}/session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(session)
    })
}

export function GetRank(level: Level) {
    return fetch(`${url}/rank?level=${level}`)
}