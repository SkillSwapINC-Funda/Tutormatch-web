import { Course } from "./Course";

export class Semester {
  id: number;
  name: string;
  courses: Course[];

  constructor(semester: {
    id?: number;
    name?: string;
    courses?: Course[];
  }) {
    this.id = semester.id || 0;
    this.name = semester.name || '';
    this.courses = semester.courses || [];
  }
}