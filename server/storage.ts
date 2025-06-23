import { users, searchQueries, type User, type InsertUser, type SearchQuery, type InsertSearchQuery } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search query logging
  logSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  getRecentSearches(limit?: number): Promise<SearchQuery[]>;
  getPopularSearches(limit?: number): Promise<SearchQuery[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async logSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const [query] = await db
      .insert(searchQueries)
      .values({
        ...insertQuery,
        filter: insertQuery.filter || null,
        resultsCount: insertQuery.resultsCount || null,
        searchTime: insertQuery.searchTime || null,
      })
      .returning();
    return query;
  }

  async getRecentSearches(limit: number = 10): Promise<SearchQuery[]> {
    return await db
      .select()
      .from(searchQueries)
      .orderBy(desc(searchQueries.timestamp))
      .limit(limit);
  }

  async getPopularSearches(limit: number = 10): Promise<SearchQuery[]> {
    const popularQueries = await db
      .select({
        query: searchQueries.query,
        filter: searchQueries.filter,
        count: sql<number>`count(*)`.as('count'),
        // Get the most recent instance of each query
        id: sql<number>`max(${searchQueries.id})`.as('id'),
        searchId: sql<string>`max(${searchQueries.searchId})`.as('searchId'),
        resultsCount: sql<number>`max(${searchQueries.resultsCount})`.as('resultsCount'),
        searchTime: sql<number>`max(${searchQueries.searchTime})`.as('searchTime'),
        timestamp: sql<Date>`max(${searchQueries.timestamp})`.as('timestamp'),
      })
      .from(searchQueries)
      .groupBy(searchQueries.query, searchQueries.filter)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    // Convert the aggregated results back to SearchQuery format
    return popularQueries.map(item => ({
      id: item.id,
      searchId: item.searchId,
      query: item.query,
      filter: item.filter,
      resultsCount: item.resultsCount,
      searchTime: item.searchTime,
      timestamp: item.timestamp,
    }));
  }
}

export const storage = new DatabaseStorage();
