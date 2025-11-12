// client/src/db/dexie.ts
import Dexie, { Table } from 'dexie';

export interface Entry {
  id?: number;
  date: Date;
  mood: number;
  energy: number;
  sleep: {
    hours: number;
    quality: number;
  };
  medication: {
    bupropion: boolean;
    venlafaxine: boolean;
    adderall: boolean;
  };
  si: {
    present: boolean;
    severity?: number;
  };
  diary: string;
}

export class MySubClassedDexie extends Dexie {
  entries!: Table<Entry>;

  constructor() {
    super('mentalHealthDB');
    this.version(1).stores({
      entries: '++id, date', // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
