import { defineStore } from "pinia";

export interface Entry {
    title?: string;
    type?: string;
    room?: string[];
    date?: string;
    timeStart?: string;
    timeEnd?: string;
    num?: number;
}

export interface Subject {
    title?: string;
    short?: string;
    color?: string;
    type?: string;
    prof?: string;
    numH?: number;
}

export interface Period {
    start: string;
    end: string;
}

export interface State {
    group: string;
    date: Date;
    entries: {
        [key: string]: Entry[];
    };
    subjects: Subject[];
    periods: Period[];
    now: Date;
}

export default defineStore('store', {
    state: (): State => ({
        group: 'WCY22IY1S1',
        date: new Date(),
        entries: {},
        subjects: [],
        periods: [
            { start: '08:00', end: '09:35' },
            { start: '09:50', end: '11:25' },
            { start: '11:40', end: '13:15' },
            { start: '13:30', end: '15:05' },
            { start: '15:45', end: '17:20' },
            { start: '17:35', end: '19:10' },
            { start: '19:25', end: '21:00' },
        ],
        now: new Date()
    }),
    getters: {
        groups: (state) => {
            return Object.keys(state.entries);
        },
        gEntries: (state) => {
            return state.entries[state.group];
        },
        gSubjects: (state) => {
            return state.subjects.filter((s) => s.type == state.group);
        }
    }
});