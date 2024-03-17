import {render} from '@testing-library/react';
import {Cell, CellContent, getNeighbors, Level, Session, Status} from "./Minesweeper";
import React from "react";


describe('Session class initialization', () => {
    test('Session initializes correctly for Easy level', () => {
        const session = new Session(Level.Easy);
        expect(session.mines).toBe(10);
        expect(session.cols).toBe(8);
        expect(session.rows).toBe(8);
        expect(session.cells.length).toBe(64); // 8 * 8
        expect(session.status).toBe(Status.Running);
        expect(session.initialed).toBe(false);
        expect(session.flags).toBe(0);
        expect(session.found).toBe(0);
    });

    test('Session initializes correctly for Intermediate level', () => {
        const session = new Session(Level.Intermediate);
        expect(session.mines).toBe(40);
        expect(session.cols).toBe(16);
        expect(session.rows).toBe(16);
        expect(session.cells.length).toBe(256); // 16 * 16
    });

    test('Session initializes correctly for Advanced level', () => {
        const session = new Session(Level.Advanced);
        expect(session.mines).toBe(99);
        expect(session.cols).toBe(30);
        expect(session.rows).toBe(16);
        expect(session.cells.length).toBe(480); // 30 * 16
    });
});


describe('getNeighbors function', () => {
    test('returns 8 neighbors for a cell in the middle', () => {
        // Assuming a 5x5 grid and choosing index 12, which is in the middle
        const neighbors = getNeighbors(12, 5, 5);
        expect(neighbors.sort()).toEqual([6, 7, 8, 11, 13, 16, 17, 18].sort());
    });

    test('returns 3 neighbors for a corner cell', () => {
        // Top-left corner of a 5x5 grid, index 0
        const neighbors = getNeighbors(0, 5, 5);
        expect(neighbors.sort()).toEqual([1, 5, 6].sort());
    });
});


describe('CellContent Component', () => {
    test('renders a flag for a flagged cell in a running session', () => {
        const session = new Session(Level.Easy); // Use the actual Status enum or value from your code
        const cell = new Cell(false);
        cell.flag = true
        const {container} = render(<CellContent session={session} cell={cell}/>);
        expect(container.querySelector('.flag')).toBeInTheDocument();
        expect(container.querySelector('.mine')).not.toBeInTheDocument();
    });
});