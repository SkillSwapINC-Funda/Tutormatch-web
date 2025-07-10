export class Course {
  id: string;
  name: string;
  semesterNumber: number;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: any) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.semesterNumber = typeof data.semesterNumber === 'number' 
      ? data.semesterNumber 
      : typeof data.semester_number === 'number'
        ? data.semester_number
        : 0;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }
}