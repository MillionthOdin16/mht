// client/src/pages/Export.tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Entry } from '../db/dexie';
import { Button } from '@/components/ui/button';

const Export: React.FC = () => {
  const entries = useLiveQuery(() => db.entries.toArray());

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportJSON = () => {
    if (!entries) return;
    const jsonContent = JSON.stringify({ entries }, null, 2);
    downloadFile(jsonContent, 'mental-health-export.json', 'application/json');
  };

  const handleExportCSV = () => {
    if (!entries) return;
    const headers = [
      'id',
      'date',
      'mood',
      'energy',
      'sleep_hours',
      'sleep_quality',
      'med_bupropion',
      'med_venlafaxine',
      'med_adderall',
      'si_present',
      'si_severity',
      'diary'
    ];

    const csvRows = entries.map(entry => {
        const row = [
            entry.id,
            entry.date.toISOString(),
            entry.mood,
            entry.energy,
            entry.sleep.hours,
            entry.sleep.quality,
            entry.medication.bupropion,
            entry.medication.venlafaxine,
            entry.medication.adderall,
            entry.si.present,
            entry.si.severity ?? '',
            `"${entry.diary.replace(/"/g, '""')}"`
        ];
        return row.join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    downloadFile(csvContent, 'mental-health-export.csv', 'text/csv');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Export Data</h1>
      {entries && entries.length > 0 ? (
        <div className="space-x-4">
          <Button onClick={handleExportJSON}>Export as JSON</Button>
          <Button onClick={handleExportCSV}>Export as CSV</Button>
        </div>
      ) : (
        <p>No entries to export.</p>
      )}
    </div>
  );
};

export default Export;
