import { defineStore } from "pinia";
import { startOfMonth } from "date-fns";
import { uniq, uniqBy } from "lodash";

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

export interface Semester {
    id: string;
    name: string;
    start: string;
    end: string;
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
    subjects: {
        [key: string]: Subject[];
    };
    semesters: Semester[];
    periods: Period[];
    now: Date;
    monthMode: boolean;
    month: Date;
    search: string | null;
    year: string;
    settings: {
        hideWeekends: boolean;
        useMarkers: boolean;
        markers: {
            [key: string]: string;
        }
    };
}

export default defineStore('store', {
    state: (): State => ({
        group: 'WCY22IY1S1',
        date: new Date(),
        entries: {},
        subjects: {},
        periods: [
            { start: '08:00', end: '09:35' },
            { start: '09:50', end: '11:25' },
            { start: '11:40', end: '13:15' },
            { start: '13:30', end: '15:05' },
            { start: '15:45', end: '17:20' },
            { start: '17:35', end: '19:10' },
            { start: '19:25', end: '21:00' },
        ],
        now: new Date(),
        monthMode: false,
        month: startOfMonth(new Date()),
        search: null,
        year: "2022",
        semesters: [],
        settings: {
            hideWeekends: false,
            useMarkers: false,
            markers: {},
        },
    }),
    getters: {
        groups: (state) => {
            return Object.keys(state.entries);
        },
        gEntries: (state) => {
            return state.entries[state.group];
        },
        gSubjects: (state) => {
            return state.subjects[state.group];
        },
        subTypes: (state): string[] => {
            return Array.from(new Set(state.subjects[state.group].map((sub) => sub.type ?? '')));
        },
        dateSemester: (state) => {
            return state.semesters.find((semester) => {
                const start = new Date(semester.start);
                const end = new Date(semester.end);
                return state.date >= start && state.date <= end;
            });
        },
        yearSemesters: (state) => {
            return state.semesters.filter((semester) => semester.id.startsWith(state.year));
        },
        years: (state) => {
            return Array.from(new Set(state.semesters.map((semester) => semester.id.slice(0, 4))));
        }
    },
    actions: {
        loadState() {
            if (localStorage.getItem('settings') === null)
                return;
            this.year = localStorage.getItem('year') ?? '2022';
            this.group = localStorage.getItem('group') ?? 'WCY22IY1S1';
            this.settings = JSON.parse(localStorage.getItem('settings') ?? '{}');
        },
        saveState() {
            localStorage.setItem('year', this.year);
            localStorage.setItem('group', this.group);
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },
        async refresh() {
            for (let i = 0; i <= 1; i++) {
                const get = i === 1 ? getFetch : getCache;
                try {
                    var ent: State['entries'] = {};
                    var sub: State['subjects'] = {};
                    this.semesters = await get('/data/semesters.json').then((res) => (res?.json() ?? []));
                    for (const semester of this.yearSemesters) {
                        var entries: typeof ent = await get(`/data/entries-${semester.id}.json`).then((res) => (res?.json() ?? {}));
                        for (const group in entries) {
                            if (ent[group] === undefined) ent[group] = [];
                            ent[group].push(...entries[group]);
                            ent[group] = uniqBy(ent[group], x => (x.title! + x.type! + x.room! + x.date! + x.timeStart! + x.timeEnd! + x.num!));
                        }
                        var subjects: typeof sub = await get(`/data/subjects-${semester.id}.json`).then((res) => (res?.json() ?? {}));
                        for (const group in subjects) {
                            if (sub[group] === undefined) sub[group] = [];
                            sub[group].push(...subjects[group]);
                            sub[group] = uniqBy(sub[group], x => (x.title! + x.short! + x.color! + x.type! + x.prof! + x.numH!));
                        }
                    }
                    this.entries = ent;
                    this.subjects = sub;
                }
                catch (err) {
                    console.error(err);
                }
            }
            /*fetch('/data/entries.json', { cache: 'no-cache' }).then((res) => res.json()).then((data) => {
                this.entries = data;
            }).catch(err => console.log(err));
            fetch('/data/subjects.json', { cache: 'no-cache' }).then((res) => res.json()).then((data) => {
                this.subjects = data;
            }).catch(err => console.log(err));*/
        }
    }
});

function getFetch(url: string) {
    return fetch(url, { cache: 'no-cache' });
}

function getCache(url: string) {
    return caches.match(url);
}