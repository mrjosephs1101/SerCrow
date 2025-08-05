import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  searchId: text("search_id").notNull().unique(),
  query: text("query").notNull(),
  filter: text("filter").default("all"),
  resultsCount: integer("results_count").default(0),
  searchTime: integer("search_time").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).pick({
  searchId: true,
  query: true,
  filter: true,
  resultsCount: true,
  searchTime: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;

// Search result types
export interface SearchResult {
  id: string;
  title: string;
  url: string;
  description: string;
  favicon?: string;
  lastModified?: string;
  tags?: string[];
  imageUrl?: string; // For image search results
  videoUrl?: string; // For video search results
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  currentPage: number;
  totalPages: number;
  query: string;
  filter: string;
  searchId: string;
}

export interface SearchSuggestion {
  text: string;
  count?: number;
}
