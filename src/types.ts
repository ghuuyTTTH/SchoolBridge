/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: number;
  linkedIds: string[]; // For parents: children IDs. For students: teacher ID.
  studentId?: string; // Student-specific ID
  schoolCode?: string; // Teacher-specific
  xp?: number;
  level?: string;
  subjects?: Subject[];
  firstTimeUser?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  confidence: number; // 1-5 stars
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  timestamp: number;
  status: 'sent' | 'read';
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: 1 | 2 | 3 | 4; // 1: 😫, 2: 😞, 3: 😐, 4: 😊
  timestamp: number;
  note?: string;
}

export interface HelpRequest {
  id: string;
  studentId: string;
  subject: string;
  body: string;
  anonymous: boolean;
  status: 'pending' | 'resolved';
  teacherReply?: string;
  createdAt: number;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  weekOf: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  subject: string;
  description: string;
  dueDay: string;
  completed: boolean;
}

export interface Intervention {
  id: string;
  teacherId: string;
  studentId: string;
  type: string;
  timestamp: number;
  note: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  duration: number;
  task: string;
  timestamp: number;
}

export interface Class {
  id: string;
  teacherId: string;
  classCode: string;
  className: string;
  createdAt: number;
  studentIds: string[];
  isArchived?: boolean;
  requireApproval?: boolean;
}

export interface ClassJoinRequest {
  id: string;
  studentId: string;
  classId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
}
