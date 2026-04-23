import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  jsonb,
  boolean,
  pgEnum,
  unique,
  AnyPgColumn,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
import { categoryEnum, unitEnum } from "../validators"


export const categoryEnumPg = pgEnum("category", categoryEnum)

export const unitEnumPg = pgEnum("unit", unitEnum)



export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"),
  image: text("image"),
  isPublicProfile: boolean("isPublicProfile").default(true).notNull(),
  bio: text("bio"),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)



export const components = pgTable("component", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  genericName: text("genericName").notNull(), 
  mpn: text("mpn"), 
  manufacturer: text("manufacturer"),
  
  category: categoryEnumPg("category").notNull(),
  value: text("value").notNull(),
  unit: unitEnumPg("unit").default("None").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  
  metadata: jsonb("metadata").default({}).notNull(),
  
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const projects = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: jsonb("instructions").notNull(),
  mermaidDiagram: text("mermaidDiagram"),
  schematicUrl: text("schematicUrl"),
  requiredComponents: jsonb("requiredComponents").notNull(),
  difficulty: text("difficulty").notNull(),
  safetyWarnings: jsonb("safetyWarnings").default([]),
  isPublic: boolean("isPublic").default(false).notNull(),
  clonedFromId: uuid("clonedFromId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type Component = typeof components.$inferSelect;

export const savedProjects = pgTable("savedProject", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (sp) => ({
  unq: unique().on(sp.userId, sp.projectId)
}));

export const blogPosts = pgTable("blogPost", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  images: jsonb("images").default([]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scanSessions = pgTable("scanSession", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["awaiting", "scanning", "processing", "completed", "failed"] }).default("awaiting").notNull(),
  step1Image: text("step1Image"),
  step2Image: text("step2Image"),
  result: jsonb("result"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const postComments = pgTable("postComment", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("postId").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  parentId: uuid("parentId").references((): AnyPgColumn => postComments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const commentLikes = pgTable("commentLike", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  commentId: uuid("commentId").notNull().references(() => postComments.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (cl) => ({
  unq: unique().on(cl.userId, cl.commentId)
}));
export const postLikes = pgTable("postLike", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("postId").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (pl) => ({
  unq: unique().on(pl.userId, pl.postId)
}));
