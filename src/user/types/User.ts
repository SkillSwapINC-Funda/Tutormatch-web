export type UserRole = 'student' | 'tutor' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  gender: string;
  role: UserRole;
  status: UserStatus;
  semesterNumber: number;
  academicYear: string;
  phone?: string;
  bio?: string;
  tutorId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    gender?: string;
    role?: UserRole;
    status?: UserStatus;
    semesterNumber?: number;
    academicYear?: string;
    phone?: string;
    bio?: string;
    tutorId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id || '';
    this.firstName = (user.firstName || '').trim();
    this.lastName = (user.lastName || '').trim();
    this.email = (user.email || '').trim();
    this.avatar = user.avatar || undefined;
    this.gender = user.gender || 'other';
    this.role = user.role || 'student';
    this.status = user.status || 'active';
    this.semesterNumber = user.semesterNumber || 1;
    this.academicYear = (user.academicYear || '').trim();
    this.phone = user.phone || '';
    this.bio = (user.bio || '').trim();
    this.tutorId = (user.tutorId || '').trim();
    this.createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    this.updatedAt = user.updatedAt ? new Date(user.updatedAt) : new Date();
  }
}