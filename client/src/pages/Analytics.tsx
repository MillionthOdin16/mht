// client/src/pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { db, Entry } from '../db/dexie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';

const Analytics: React.FC = () => {
  const [days, setDays] = useState(30);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await db.entries.where('date').above(subDays(new Date(), days)).toArray();
      setEntries(data);
    };
    fetchEntries();
  }, [days]);

  const chartData = entries
    ? entries
        .map((entry) => ({
          date: new Date(entry.date).toISOString().split('T')[0],
          mood: entry.mood,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex space-x-2">
            <Button onClick={() => setDays(7)} variant={days === 7 ? 'default' : 'outline'}>7d</Button>
            <Button onClick={() => setDays(30)} variant={days === 30 ? 'default' : 'outline'}>30d</Button>
            <Button onClick={() => setDays(90)} variant={days === 90 ? 'default' : 'outline'}>90d</Button>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
