import {
  type DailyEntry,
  type InsertDailyEntry,
  type SocialInteraction,
  type InsertSocialInteraction,
  type Activity,
  type InsertActivity,
  type Trigger,
  type InsertTrigger,
  type Medication,
  type InsertMedication,
  type CompleteEntry,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDailyEntry(id: string): Promise<DailyEntry | undefined>;
  getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]>;
  getCompleteEntry(id: string): Promise<CompleteEntry | undefined>;
  getCompleteEntries(startDate?: string, endDate?: string): Promise<CompleteEntry[]>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(id: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry | undefined>;
  deleteDailyEntry(id: string): Promise<boolean>;

  getSocialInteractions(entryId: string): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  deleteSocialInteraction(id: string): Promise<boolean>;

  getActivities(entryId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: string): Promise<boolean>;

  getTriggers(entryId: string): Promise<Trigger[]>;
  createTrigger(trigger: InsertTrigger): Promise<Trigger>;
  deleteTrigger(id: string): Promise<boolean>;

  getMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
}

export class MemStorage implements IStorage {
  private dailyEntries: Map<string, DailyEntry>;
  private socialInteractions: Map<string, SocialInteraction>;
  private activities: Map<string, Activity>;
  private triggers: Map<string, Trigger>;
  private medications: Map<string, Medication>;

  constructor() {
    this.dailyEntries = new Map();
    this.socialInteractions = new Map();
    this.activities = new Map();
    this.triggers = new Map();
    this.medications = new Map();

    this.initializeMockMedications();
  }

  private initializeMockMedications() {
    const mockMeds = [
      "Bupropion 300mg",
      "Venlafaxine 225mg",
      "Adderall 30mg XR"
    ];
    mockMeds.forEach((name) => {
      const id = randomUUID();
      this.medications.set(id, {
        id,
        name,
        isActive: 1,
        createdAt: new Date(),
      });
    });
  }

  async getDailyEntry(id: string): Promise<DailyEntry | undefined> {
    return this.dailyEntries.get(id);
  }

  async getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]> {
    let entries = Array.from(this.dailyEntries.values());
    
    if (startDate) {
      entries = entries.filter(e => e.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter(e => e.date <= endDate);
    }
    
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }

  async getCompleteEntry(id: string): Promise<CompleteEntry | undefined> {
    const entry = this.dailyEntries.get(id);
    if (!entry) return undefined;

    const socialInteractions = await this.getSocialInteractions(id);
    const activities = await this.getActivities(id);
    const triggers = await this.getTriggers(id);

    return {
      ...entry,
      socialInteractions,
      activities,
      triggers,
    };
  }

  async getCompleteEntries(startDate?: string, endDate?: string): Promise<CompleteEntry[]> {
    const entries = await this.getDailyEntries(startDate, endDate);
    
    return Promise.all(
      entries.map(async (entry) => {
        const socialInteractions = await this.getSocialInteractions(entry.id);
        const activities = await this.getActivities(entry.id);
        const triggers = await this.getTriggers(entry.id);

        return {
          ...entry,
          socialInteractions,
          activities,
          triggers,
        };
      })
    );
  }

  async createDailyEntry(insertEntry: InsertDailyEntry): Promise<DailyEntry> {
    const id = randomUUID();
    const now = new Date();
    const entry: DailyEntry = {
      ...insertEntry,
      id,
      sleepHours: insertEntry.sleepHours ?? 7,
      sleepQuality: insertEntry.sleepQuality ?? 5,
      medications: (insertEntry.medications || []) as string[],
      siTracking: (insertEntry.siTracking || { present: false }) as {
        present: boolean;
        intensity?: number;
        thoughts?: string;
      },
      diary: insertEntry.diary || "",
      createdAt: now,
      updatedAt: now,
    };
    this.dailyEntries.set(id, entry);
    return entry;
  }

  async updateDailyEntry(id: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntry | undefined> {
    const entry = this.dailyEntries.get(id);
    if (!entry) return undefined;

    const updated: DailyEntry = {
      ...entry,
      ...updates,
      medications: (updates.medications !== undefined ? updates.medications : entry.medications) as string[],
      siTracking: (updates.siTracking !== undefined ? updates.siTracking : entry.siTracking) as {
        present: boolean;
        intensity?: number;
        thoughts?: string;
      },
      diary: updates.diary !== undefined ? updates.diary : entry.diary,
      updatedAt: new Date(),
    };
    this.dailyEntries.set(id, updated);
    return updated;
  }

  async deleteDailyEntry(id: string): Promise<boolean> {
    const deleted = this.dailyEntries.delete(id);
    
    if (deleted) {
      Array.from(this.socialInteractions.values())
        .filter(si => si.entryId === id)
        .forEach(si => this.socialInteractions.delete(si.id));
      
      Array.from(this.activities.values())
        .filter(a => a.entryId === id)
        .forEach(a => this.activities.delete(a.id));
      
      Array.from(this.triggers.values())
        .filter(t => t.entryId === id)
        .forEach(t => this.triggers.delete(t.id));
    }
    
    return deleted;
  }

  async getSocialInteractions(entryId: string): Promise<SocialInteraction[]> {
    return Array.from(this.socialInteractions.values()).filter(
      (si) => si.entryId === entryId
    );
  }

  async createSocialInteraction(insertInteraction: InsertSocialInteraction): Promise<SocialInteraction> {
    const id = randomUUID();
    const interaction: SocialInteraction = {
      ...insertInteraction,
      id,
      notes: insertInteraction.notes || "",
      createdAt: new Date(),
    };
    this.socialInteractions.set(id, interaction);
    return interaction;
  }

  async deleteSocialInteraction(id: string): Promise<boolean> {
    return this.socialInteractions.delete(id);
  }

  async getActivities(entryId: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (a) => a.entryId === entryId
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      duration: insertActivity.duration || 0,
      enjoyment: insertActivity.enjoyment || 5,
      notes: insertActivity.notes || "",
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activities.delete(id);
  }

  async getTriggers(entryId: string): Promise<Trigger[]> {
    return Array.from(this.triggers.values()).filter(
      (t) => t.entryId === entryId
    );
  }

  async createTrigger(insertTrigger: InsertTrigger): Promise<Trigger> {
    const id = randomUUID();
    const trigger: Trigger = {
      ...insertTrigger,
      id,
      notes: insertTrigger.notes || "",
      createdAt: new Date(),
    };
    this.triggers.set(id, trigger);
    return trigger;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    return this.triggers.delete(id);
  }

  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values()).filter(m => m.isActive === 1);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const id = randomUUID();
    const medication: Medication = {
      ...insertMedication,
      id,
      isActive: insertMedication.isActive !== undefined ? insertMedication.isActive : 1,
      createdAt: new Date(),
    };
    this.medications.set(id, medication);
    return medication;
  }

  async updateMedication(id: string, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const medication = this.medications.get(id);
    if (!medication) return undefined;

    const updated: Medication = {
      ...medication,
      ...updates,
    };
    this.medications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
