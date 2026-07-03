import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

export const MockInterview = pgTable('mockInterview', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition', { length: 255 }).notNull(),
  jobDesc: text('jobDesc').notNull(),
  jobExperience: varchar('jobExperience', { length: 255 }).notNull(),
  createdBy: varchar('createdBy', { length: 255 }).notNull(),
  createdAt: varchar('createdAt', { length: 255 }).notNull(),
  mockId: varchar('mockId', { length: 255 }).notNull(),
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockIdRef', { length: 255 }).notNull(),
  question: varchar('question', { length: 255 }).notNull(),
  correctAns: text('correctAns').notNull(),
  userAns: text('userAns').notNull(),
  feedback: text('feedback').notNull(),
  rating: varchar('rating', { length: 255 }).notNull(),
  userEmail: varchar('userEmail', { length: 255 }).notNull(),
  createdAt: varchar('createdAt', { length: 255 }).notNull(),
});
