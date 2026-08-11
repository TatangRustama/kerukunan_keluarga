import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { requireAuth, AuthRequest } from "./middleware/auth.js";
import { eq, ilike, or, desc, sql, and } from 'drizzle-orm';
import { db } from "./db/index.js";
import { members, users, events, announcements } from "./db/schema.js";
import { getOrCreateUser } from "./db/users.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export const app = express();

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { nik, name, password } = req.body;
      
      const existingNik = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.nik, nik)
      });

      if (existingNik) {
        return res.status(400).json({ error: "NIK sudah terdaftar" });
      }

      const superAdmins = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.role, 'super_admin'),
        limit: 1
      });
      const role = superAdmins.length === 0 ? 'super_admin' : 'pending_operator';

      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = crypto.randomUUID();

      const newUser = await db.insert(users).values({
        uid,
        email: `${nik}@basanohi.app`,
        name,
        nik,
        role,
        password: hashedPassword,
      }).returning();

      const token = jwt.sign({ uid: newUser[0].uid, email: newUser[0].email, name: newUser[0].name }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ token, user: newUser[0] });
    } catch (error) {
      console.error("Failed to register user:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { nik, password } = req.body;
      
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.nik, nik)
      });

      if (!user || !user.password) {
        return res.status(401).json({ error: "NIK atau Password salah" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "NIK atau Password salah" });
      }

      const token = jwt.sign({ uid: user.uid, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ token, user });
    } catch (error) {
      console.error("Failed to login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // User related routes
  app.get("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid } = req.user!;
      let user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, uid)
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:uid/role", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { uid } = req.params;
      const { role } = req.body;

      const updatedUser = await db.update(users)
        .set({ role })
        .where(eq(users.uid, uid))
        .returning();

      res.json(updatedUser[0]);
    } catch (error) {
      console.error("Failed to update user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.delete("/api/users/:uid", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { uid } = req.params;

      // Ensure super_admin cannot delete themselves
      if (uid === req.user!.uid) {
        return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri" });
      }

      await db.delete(users).where(eq(users.uid, uid));

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/members", requireAuth, async (req: AuthRequest, res) => {
    try {
      const allMembers = await db.select().from(members);
      res.json(allMembers);
    } catch (error) {
      console.error("Database query failed:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.post("/api/members", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email } = req.user!;
      const user = await getOrCreateUser(uid, email || '');

      const { name, pekerjaan, address, tanggalLahir, jenisKelamin, agama, statusPerkawinan, nomorKtp, nomorHp, imageUrl } = req.body;
      const newMember = await db.insert(members).values({
        userId: user.id,
        name,
        pekerjaan,
        address,
        tanggalLahir,
        jenisKelamin,
        agama,
        statusPerkawinan,
        nomorKtp,
        nomorHp,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
      }).returning();

      res.json(newMember[0]);
    } catch (error) {
      console.error("Failed to create member:", error);
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.get("/api/events", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.query.all === 'true') {
        const allEvents = await db.select().from(events).orderBy(desc(events.date));
        return res.json(allEvents);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const history = req.query.history === 'true';
      
      const offset = (page - 1) * limit;

      let whereClause = undefined;
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(events.title, `%${search}%`),
            ilike(events.description, `%${search}%`)
          )
        );
      }
      
      if (!history) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const minDateStr = threeMonthsAgo.toISOString().split('T')[0];
        conditions.push(sql`${events.date} >= ${minDateStr}`);
      }
      
      if (conditions.length > 0) {
        whereClause = and(...conditions);
      }

      const eventsList = await db.select()
        .from(events)
        .where(whereClause)
        .orderBy(desc(events.date))
        .limit(limit)
        .offset(offset);
        
      const countResult = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(events).where(whereClause);
      const totalCount = countResult[0].count;

      res.json({
        data: eventsList,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      console.error("Failed to fetch events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { title, description, date } = req.body;
      
      const newEvent = await db.insert(events).values({
        title,
        description,
        date,
      }).returning();

      res.json(newEvent[0]);
    } catch (error) {
      console.error("Failed to create event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { title, description, date } = req.body;
      const eventId = parseInt(req.params.id);
      
      const updatedEvent = await db.update(events).set({
        title,
        description,
        date,
      }).where(eq(events.id, eventId)).returning();

      if (updatedEvent.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(updatedEvent[0]);
    } catch (error) {
      console.error("Failed to update event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });
      if (caller?.role !== 'super_admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const eventId = parseInt(req.params.id);
      
      await db.delete(events).where(eq(events.id, eventId));

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Announcements Routes
  app.get("/api/announcements", requireAuth, async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      
      const offset = (page - 1) * limit;

      let whereClause = undefined;
      if (search) {
        whereClause = or(
          ilike(announcements.title, `%${search}%`),
          ilike(announcements.content, `%${search}%`)
        );
      }

      const list = await db.select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        authorId: announcements.authorId,
        createdAt: announcements.createdAt,
        authorName: users.name
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);
        
      const countResult = await db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(announcements).where(whereClause);
      const totalCount = countResult[0].count;

      res.json({
        data: list,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });

      if (caller?.role !== 'super_admin' && caller?.role !== 'operator') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { title, content } = req.body;
      
      const newAnn = await db.insert(announcements).values({
        title,
        content,
        authorId: caller.id
      }).returning();
      
      res.json(newAnn[0]);
    } catch (error) {
      console.error("Failed to create announcement:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  app.put("/api/announcements/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });

      if (caller?.role !== 'super_admin' && caller?.role !== 'operator') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { title, content } = req.body;
      const annId = parseInt(req.params.id);
      
      const updated = await db.update(announcements).set({
        title,
        content,
      }).where(eq(announcements.id, annId)).returning();
      
      if (updated.length === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      
      res.json(updated[0]);
    } catch (error) {
      console.error("Failed to update announcement:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  });

  app.delete("/api/announcements/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const caller = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.uid, req.user!.uid)
      });

      if (caller?.role !== 'super_admin' && caller?.role !== 'operator') {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const annId = parseInt(req.params.id);
      
      await db.delete(announcements).where(eq(announcements.id, annId));
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

