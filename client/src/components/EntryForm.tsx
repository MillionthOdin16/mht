// client/src/components/EntryForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '../db/dexie';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const formSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  medication: z.object({
    bupropion: z.boolean(),
    venlafaxine: z.boolean(),
    adderall: z.boolean(),
  }),
  si: z.object({
    present: z.boolean(),
    severity: z.number().min(1).max(5).optional(),
  }),
  diary: z.string(),
});

const EntryForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
      mood: 5,
      energy: 5,
      sleepHours: 8,
      sleepQuality: 5,
      medication: {
        bupropion: false,
        venlafaxine: false,
        adderall: false,
      },
      si: {
        present: false,
      },
      diary: '',
    },
  });

  const siPresent = form.watch('si.present');
  const [entryId, setEntryId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const subscription = form.watch((value) => {
        const debouncedSave = setTimeout(() => handleSave(value as any), 5000);
        return () => clearTimeout(debouncedSave);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, entryId]);

  const handleSave = async (data: z.infer<typeof formSchema>) => {
    const entryData = {
        date: new Date(data.date),
        mood: data.mood,
        energy: data.energy,
        sleep: {
            hours: data.sleepHours,
            quality: data.sleepQuality,
        },
        medication: data.medication,
        si: {
            present: data.si.present,
            severity: data.si.severity,
        },
        diary: data.diary,
    };

    try {
        if (entryId) {
            await db.entries.update(entryId, entryData);
            console.log('Entry updated');
        } else {
            const newId = await db.entries.add(entryData);
            setEntryId(newId);
            console.log('Entry saved with new ID:', newId);
        }
    } catch (error) {
        console.error('Failed to save entry', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood (1: Dark, 5: Neutral, 10: Stable)</FormLabel>
              <FormControl>
                <Slider min={1} max={10} step={1} onValueChange={field.onChange} defaultValue={[field.value]} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="energy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Energy (1-10)</FormLabel>
              <FormControl>
                <Slider min={1} max={10} step={1} onValueChange={field.onChange} defaultValue={[field.value]} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="sleepHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep (Hours)</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={24} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sleepQuality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep Quality (1-10)</FormLabel>
              <FormControl>
                <Slider min={1} max={10} step={1} onValueChange={field.onChange} defaultValue={[field.value]} />
              </FormControl>
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={form.control}
          name="medication"
          render={() => (
            <FormItem>
              <FormLabel>Medication</FormLabel>
              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name="medication.bupropion"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Bupropion 300mg</FormLabel>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="medication.venlafaxine"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Venlafaxine 225mg</FormLabel>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="medication.adderall"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Adderall 30mg XR</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="si.present"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>Suicidal Ideation (Y/N)</FormLabel>
            </FormItem>
          )}
        />
        {siPresent && (
          <FormField
            control={form.control}
            name="si.severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SI Severity (1-5)</FormLabel>
                <FormControl>
                  <Slider min={1} max={5} step={1} onValueChange={field.onChange} defaultValue={[field.value || 1]} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="diary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diary</FormLabel>
              <FormControl>
                <Textarea rows={10} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};

export default EntryForm;
