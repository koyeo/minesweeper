import React from 'react';
import './App.css';
import {Level, Minesweeper} from "./Minesweeper";
import {Menu} from "@arco-design/web-react/lib";

export default function App() {
    return <div className={'container'}>
        <Minesweeper level={Level.Advanced}/>
    </div>
}



