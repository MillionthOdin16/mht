import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateClinicalSummary } from "./gemini";
import {
  insertDailyEntrySchema,
  insertSocialInteractionSchema,
  insertActivitySchema,
  insertTriggerSchema,
  insertMedicationSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {

  // Daily Entries
  app.get("/api/entries", async (req, res) => {
    try {
      const { startDate, endDate, complete } = req.query;
      
      if (complete === "true") {
        const entries = await storage.getCompleteEntries(
          startDate as string,
          endDate as string
        );
        return res.json(entries);
      }
      
      const entries = await storage.getDailyEntries(
        startDate as string,
        endDate as string
      );
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { complete } = req.query;
      
      if (complete === "true") {
        const entry = await storage.getCompleteEntry(id);
        if (!entry) {
          return res.status(404).json({ error: "Entry not found" });
        }
        return res.json(entry);
      }
      
      const entry = await storage.getDailyEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    try {
      const validated = insertDailyEntrySchema.parse(req.body);
      const entry = await storage.createDailyEntry(validated);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid entry data", details: error.errors });
      }
      console.error("Error creating entry:", error);
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  app.patch("/api/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const entry = await storage.updateDailyEntry(id, updates);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating entry:", error);
      res.status(500).json({ error: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDailyEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  // Social Interactions
  app.get("/api/entries/:entryId/social", async (req, res) => {
    try {
      const { entryId } = req.params;
      const interactions = await storage.getSocialInteractions(entryId);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching social interactions:", error);
      res.status(500).json({ error: "Failed to fetch social interactions" });
    }
  });

  app.post("/api/social", async (req, res) => {
    try {
      const validated = insertSocialInteractionSchema.parse(req.body);
      const interaction = await storage.createSocialInteraction(validated);
      res.status(201).json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid social interaction data", details: error.errors });
      }
      console.error("Error creating social interaction:", error);
      res.status(500).json({ error: "Failed to create social interaction" });
    }
  });

  app.delete("/api/social/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSocialInteraction(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Social interaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting social interaction:", error);
      res.status(500).json({ error: "Failed to delete social interaction" });
    }
  });

  // Activities
  app.get("/api/entries/:entryId/activities", async (req, res) => {
    try {
      const { entryId } = req.params;
      const activities = await storage.getActivities(entryId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validated = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validated);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid activity data", details: error.errors });
      }
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  });

  app.delete("/api/activities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // Triggers
  app.get("/api/entries/:entryId/triggers", async (req, res) => {
    try {
      const { entryId } = req.params;
      const triggers = await storage.getTriggers(entryId);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching triggers:", error);
      res.status(500).json({ error: "Failed to fetch triggers" });
    }
  });

  app.post("/api/triggers", async (req, res) => {
    try {
      const validated = insertTriggerSchema.parse(req.body);
      const trigger = await storage.createTrigger(validated);
      res.status(201).json(trigger);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid trigger data", details: error.errors });
      }
      console.error("Error creating trigger:", error);
      res.status(500).json({ error: "Failed to create trigger" });
    }
  });

  app.delete("/api/triggers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTrigger(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Trigger not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting trigger:", error);
      res.status(500).json({ error: "Failed to delete trigger" });
    }
  });

  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validated = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validated);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid medication data", details: error.errors });
      }
      console.error("Error creating medication:", error);
      res.status(500).json({ error: "Failed to create medication" });
    }
  });

  // AI Summary Generation
  app.post("/api/ai-summary", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }
      
      const entries = await storage.getCompleteEntries(startDate, endDate);
      const summary = await generateClinicalSummary(entries, startDate, endDate);
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating AI summary:", error);
      res.status(500).json({ error: "Failed to generate AI summary" });
    }
  });

  // Export Data
  app.post("/api/export", async (req, res) => {
    try {
      const { startDate, endDate, format, includeFields } = req.body;
      
      const entries = await storage.getCompleteEntries(startDate, endDate);
      
      const filteredData = entries.map(entry => {
        const filtered: any = { date: entry.date };
        
        if (includeFields.mood) filtered.mood = entry.mood;
        if (includeFields.energy) filtered.energy = entry.energy;
        if (includeFields.sleepHours) filtered.sleepHours = entry.sleepHours;
        if (includeFields.sleepQuality) filtered.sleepQuality = entry.sleepQuality;
        if (includeFields.medications) filtered.medications = entry.medications;
        if (includeFields.siTracking) filtered.siTracking = entry.siTracking;
        if (includeFields.diary) filtered.diary = entry.diary;
        if (includeFields.socialInteractions) filtered.socialInteractions = entry.socialInteractions;
        if (includeFields.activities) filtered.activities = entry.activities;
        if (includeFields.triggers) filtered.triggers = entry.triggers;
        
        return filtered;
      });
      
      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=mindtrack-export-${Date.now()}.json`);
        return res.json(filteredData);
      }
      
      if (format === "csv") {
        const headers = Object.keys(filteredData[0] || {}).filter(k => k !== "socialInteractions" && k !== "activities" && k !== "triggers");
        const csvRows = [headers.join(",")];
        
        filteredData.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            if (Array.isArray(value)) return `"${value.join("; ")}"`;
            if (typeof value === "object") return `"${JSON.stringify(value)}"`;
            return `"${value}"`;
          });
          csvRows.push(values.join(","));
        });
        
        const csv = csvRows.join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=mindtrack-export-${Date.now()}.csv`);
        return res.send(csv);
      }
      
      res.status(400).json({ error: "Invalid format" });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
