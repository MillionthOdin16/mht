// client/src/pages/Dashboard.tsx
import React from 'react';
import  EntryForm  from '../components/EntryForm';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Entry</h1>
      <EntryForm />
    </div>
  );
};

export default Dashboard;
