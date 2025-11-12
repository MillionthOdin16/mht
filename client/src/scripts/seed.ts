// client/src/scripts/seed.ts
import { db } from '../db/dexie';
import { subDays } from 'date-fns';

export const seedDatabase = async () => {
  const count = await db.entries.count();
  if (count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');
  const sampleEntries = [
    {
      date: subDays(new Date(), 6),
      mood: 3,
      energy: 4,
      sleep: { hours: 5.5, quality: 3 },
      medication: { bupropion: true, venlafaxine: true, adderall: false },
      si: { present: true, severity: 4 },
      diary: 'Felt worthless again. Work is overwhelming.',
    },
    {
      date: subDays(new Date(), 5),
      mood: 5,
      energy: 6,
      sleep: { hours: 7, quality: 6 },
      medication: { bupropion: true, venlafaxine: true, adderall: true },
      si: { present: false },
      diary: 'A more productive day. The Adderall helped focus.',
    },
    {
      date: subDays(new Date(), 4),
      mood: 4,
      energy: 3,
      sleep: { hours: 4, quality: 2 },
      medication: { bupropion: true, venlafaxine: true, adderall: false },
      si: { present: true, severity: 3 },
      diary: 'Anxiety was high. Couldn\'t sleep well.',
    },
    {
      date: subDays(new Date(), 3),
      mood: 6,
      energy: 7,
      sleep: { hours: 8, quality: 7 },
      medication: { bupropion: true, venlafaxine: true, adderall: true },
      si: { present: false },
      diary: 'Felt stable. Managed to complete a project.',
    },
    {
      date: subDays(new Date(), 2),
      mood: 2,
      energy: 2,
      sleep: { hours: 3.5, quality: 1 },
      medication: { bupropion: true, venlafaxine: false, adderall: false },
      si: { present: true, severity: 5 },
      diary: 'Deep depressive episode. Very dark thoughts.',
    },
    {
      date: subDays(new Date(), 1),
      mood: 5,
      energy: 5,
      sleep: { hours: 6, quality: 5 },
      medication: { bupropion: true, venlafaxine: true, adderall: true },
      si: { present: false },
      diary: 'Feeling neutral today. Just going through the motions.',
    },
    {
      date: new Date(),
      mood: 7,
      energy: 8,
      sleep: { hours: 7.5, quality: 8 },
      medication: { bupropion: true, venlafaxine: true, adderall: true },
      si: { present: false },
      diary: 'A good day. Felt optimistic and capable.',
    },
  ];

  await db.entries.bulkAdd(sampleEntries as any);
  console.log('Database seeded successfully.');
};
