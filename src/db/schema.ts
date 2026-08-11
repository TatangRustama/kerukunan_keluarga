import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  role: text('role').notNull().default('pending_operator'),
  nik: text('nik'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  pekerjaan: text('pekerjaan'),
  address: text('address'),
  imageUrl: text('image_url'),
  tanggalLahir: text('tanggal_lahir'),
  jenisKelamin: text('jenis_kelamin'),
  agama: text('agama'),
  statusPerkawinan: text('status_perkawinan'),
  nomorKtp: text('nomor_ktp'),
  nomorHp: text('nomor_hp'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // ISO YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  members: many(members),
  announcements: many(announcements),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));
