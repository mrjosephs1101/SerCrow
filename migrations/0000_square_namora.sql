CREATE TABLE "search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" text NOT NULL,
	"query" text NOT NULL,
	"filter" text DEFAULT 'all',
	"results_count" integer DEFAULT 0,
	"search_time" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now(),
	CONSTRAINT "search_queries_search_id_unique" UNIQUE("search_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
