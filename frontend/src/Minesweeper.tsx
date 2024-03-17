import React, {ReactElement, useState} from "react";
import {Button, Checkbox, Link, Message, Modal, Space, Switch} from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import "./Minesweeper.css";
import {useEventEmitter, useMount} from "ahooks";
import shuffle from 'lodash/shuffle';
import {NewSession} from "./api";
import {cloneDeep} from "lodash";

export enum Level {
    Easy,
    Intermediate,
    Advanced,
}

export enum Status {
    Running,
    Success,
    Failed,
}

interface MinesweeperPros {
    level: Level,
}

export class Session {
    mines: number;
    flags: number;
    cols: number;
    rows: number;
    cells: Array<Cell>;
    initialed: boolean;
    status: Status;
    found: number;
    level: Level;
    debug: boolean;
    begin: number;

    constructor(level: Level) {
        switch (level) {
            case Level.Easy:
                this.mines = 10;
                this.cols = 8;
                this.rows = 8;
                break;
            case Level.Intermediate:
                this.mines = 40;
                this.cols = 16;
                this.rows = 16;
                break;
            case Level.Advanced:
                this.mines = 99;
                this.cols = 30;
                this.rows = 16;
                break;
        }
        this.level = level;
        this.cells = new Array<Cell>(this.cols * this.rows).fill(new Cell(false));
        this.status = Status.Running;
        this.initialed = false;
        this.flags = 0;
        this.found = 0;
        this.debug = false;
        this.begin = Date.now();
    }
}

export class Cell {
    mine: boolean;
    tip: number;
    flag: boolean;
    disable: boolean;
    trigger: boolean;

    constructor(mine: boolean) {
        this.mine = mine;
        this.flag = false;
        this.disable = false;
        this.tip = 0;
        this.trigger = false;
    }
}

const generateMinePositions = (first: number, size: number, limit: number): Array<number> => {
    const pos: number[] = [];
    let indexes: number[] = Array.from({length: size}, (_, i) => i);
    indexes = shuffle(indexes);
    let i = 0;
    while (pos.length < limit) {
        if (indexes[i] !== first) {
            pos.push(indexes[i])
        }
        i++
    }
    return pos
}

export const getNeighbors = (index: number, rows: number, cols: number): number[] => {
    const neighbors = [];
    const x = index % cols;
    const y = Math.floor(index / cols);
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue
            }
            const xx = x + i;
            const yy = y + j;
            if (xx >= 0 && xx < cols && yy >= 0 && yy < rows) {
                neighbors.push(xx + yy * cols)
            }
        }
    }
    return neighbors
}


const clear = (index: number, rows: number, cols: number, cells: Cell[], checked: any) => {
    if (typeof checked[index] != 'undefined') {
        return
    }
    const neighbors = getNeighbors(index, rows, cols);
    let mines = 0;
    for (const i of neighbors) {
        if (cells[i].mine) {
            mines++
        }
    }
    checked[index] = mines;
    if (mines === 0) {
        for (const neighbor of neighbors) {
            clear(neighbor, rows, cols, cells, checked);
        }
    }
    return
}

export function Minesweeper(props: MinesweeperPros) {
    const [visible, setVisible] = React.useState(false);
    const [session, setSession] = useState<Session>({} as Session);
    const $success = useEventEmitter();

    $success.useSubscription(() => {
        NewSession({
            Time: Date.now() - session.begin,
            Level: session.level,
        }).then()
    })

    useMount(() => {
        setSession(new Session(props.level));
    })

    const handleLeftClick = (index: number, cell: Cell) => {
        if (!session.initialed) {
            generateMines(index);
        }
        if (session.status !== Status.Running || cell.disable) {
            return
        }
        if (cell.flag) {
            setSession(prev => {
                const next = cloneDeep(prev);
                const obj = cloneDeep(next.cells[index]);
                obj.flag = !obj.flag;
                next.cells[index] = obj;
                next.flags--;
                return next;
            })
        } else if (cell.mine) {
            setSession(prev => {
                const next = cloneDeep(prev);
                next.status = Status.Failed;
                const obj = cloneDeep(next.cells[index])
                obj.trigger = true;
                next.cells[index] = obj
                return next;
            })
        } else {
            setSession((prev: Session) => {
                const next = cloneDeep(prev);
                const checked: any = {};
                clear(index, session.rows, session.cols, next.cells, checked);
                Object.keys(checked).forEach((i: any) => {
                    const obj: Cell = cloneDeep(next.cells[i]);
                    if (!obj.flag) {
                        obj.tip = checked[i];
                        obj.disable = true;
                        next.cells[i] = obj
                    }
                })
                let found: number = 0;
                next.cells.forEach((item: Cell) => {
                    if (item.disable) {
                        found++
                    }
                })
                if (next.cells.length - found === next.mines) {
                    next.status = Status.Success;
                    $success.emit();
                }
                return next;
            })
        }
    }

    const handleRightClick = (index: number, cell: Cell) => {
        if (!session.initialed) {
            generateMines(index);
        }
        if (session.status !== Status.Running || cell.disable) {
            return
        }
        setSession(prev => {
            const next = cloneDeep(prev);
            const obj = cloneDeep(next.cells[index]);
            if (!obj.flag && session.flags === session.mines) {
                return next
            }
            next.flags = obj.flag ? next.flags - 1 : next.flags + 1;
            obj.flag = !obj.flag
            next.cells[index] = obj;

            let mineFlags: number = 0;
            next.cells.forEach((item: Cell) => {
                if (item.mine && item.flag) {
                    mineFlags++
                }
            })
            if (mineFlags === next.mines) {
                next.status = Status.Success;
                $success.emit();
            }

            return next;
        })
    }

    const generateMines = (index: number) => {
        const mines: number[] = generateMinePositions(index, session.cells.length, session.mines);
        setSession((prev: Session) => {
            const next = cloneDeep(prev);
            mines.forEach(v => {
                if (v !== index) {
                    const obj: Cell = cloneDeep(next.cells[v]);
                    obj.mine = true;
                    obj.tip = 1;
                    next.cells[v] = obj;
                }
            })
            next.initialed = true;
            return next;
        });
    }


    return (
        <>
            {session.cells && <div>
                <Levels setSession={setSession}/>
                <Bar session={session} setSession={setSession}/>
                <ul className={"grid"} style={{
                    gridTemplateRows: `repeat(${session.rows},${100 / session.rows}%)`,
                    gridTemplateColumns: `repeat(${session.cols},${100 / session.cols}%)`,
                    width: session.cols * 40,
                    height: session.rows * 40,
                }}>
                    {session.cells.map((cell: Cell, index: number) => {
                        return <li
                            className={
                                [
                                    'cell',
                                    !cell.mine && `tip-${cell.tip}`,
                                    cell.trigger && 'trigger',
                                    cell.disable && 'disable',
                                ].join(' ')}
                            key={index}
                            onClick={() => handleLeftClick(index, cell)}
                            onContextMenu={e => {
                                e.preventDefault();
                                handleRightClick(index, cell)
                            }}
                        >
                            <CellContent session={session} cell={cell}/>
                        </li>
                    })}
                </ul>
                <div className={'debug'}><Checkbox checked={session.debug} onChange={(v: boolean) => {
                    setSession((prev: Session) => {
                        const next: Session = cloneDeep(prev);
                        next.debug = v;
                        return next;
                    })
                }}>DEBUG</Checkbox></div>
            </div>}
        </>
    );
}


function Bar({session, setSession}: { session: Session, setSession: any }) {
    return <div className={'bar'}>
        <span>Mines: {session.mines - session.flags}</span>
        <span className={'status'} onClick={() => setSession(new Session(session.level))}>
                    {session.status === Status.Running && <>🙂</>}
            {session.status === Status.Failed && <>😭</>}
            {session.status === Status.Success && <>😎</>}
                    </span>
        <span>Time: -</span>
    </div>
}

function Levels({setSession}: { setSession: any }) {
    return <div className={'levels'}>
        <Space>
            <Link onClick={() => setSession(new Session(Level.Easy))}>Easy</Link>
            <Link onClick={() => setSession(new Session(Level.Intermediate))}>Intermediate</Link>
            <Link onClick={() => setSession(new Session(Level.Advanced))}>Advanced</Link>
        </Space>
    </div>
}

export function CellContent({session, cell}: { session: Session, cell: Cell }): ReactElement {

    if (cell.flag) {
        if (session.status === Status.Failed) {
            return <span className={'mine-flag'}>
                <img className={'mine'} src={"/mine.svg"}/>
                &
                <img className={'flag'} src={"/flag.svg"}/>
            </span>
        }
        return <img className={'flag'} src={"/flag.svg"}/>
    }

    if (cell.mine) {
        if (session.status === Status.Failed) {
            return <img className={'mine'} src={"/mine.svg"}/>
        }
        if (session.debug) {
            return <>M</>
        }
        return <></>
    }


    if (cell.tip > 0) {
        return <>{cell.tip}</>
    }

    return <></>
}