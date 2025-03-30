export default class CourseRepository {
  // ดึงข้อมูล Course ทั้งหมด
  public async getAllCourse(): Promise<Course[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/all`);
    const data: Course[] = await response.json();
    return data;
  }

  // fetch course ทั้งหมดตาม course_id ที่ใส่ไป
  public async getCoursesListByIds(courseIds: string[]): Promise<Course[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const queryParam = courseIds.join(","); // แปลง Array เป็น String
    const response = await fetch(`${BACKEND_URL}/course/getList/${queryParam}`);
    const data: Course[] = await response.json();
    return data;
  }

  public async getCourseWithExams(user_uuid: string): Promise<Course[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/getCourseWithExams/${user_uuid}`);
    const data: Course[] = await response.json();
    return data;
  }

  public async getTeacherCourses(user_uuid: string): Promise<Course[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/getTeacherCourses/${user_uuid}`);
    const data: Course[] = await response.json();
    return data
  }

  public async getCourseById(course_id: string): Promise<Course> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/get/${course_id}`);
    const data: Course = await response.json();
    return data;
  }

  public async getCourseByName(course_name: string): Promise<Course> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/get/courseName/${course_name}`);
    const data: Course = await response.json();
    return data;
  }

  public async createCourse(
    course_id: string,
    course_name: string,
    course_detail: string,
    year: number
  ): Promise<Course> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/course/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course_id, course_name, course_detail, year }),
    });
    const data: Course = await response.json();

    return data;
  }
}
