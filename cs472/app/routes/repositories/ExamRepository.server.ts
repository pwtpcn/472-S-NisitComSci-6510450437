export default class ExamRepository {
  public async getExamsByCourseId(course_id: string): Promise<Exam[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(
      `${BACKEND_URL}/api/exam/get/course/${course_id}`
    );
    const data: Exam[] = await response.json();
    return data;
  }

  public async createExam(
    course_id: string,
    start_time: Date,
    end_time: Date,
    room: string
  ): Promise<Exam> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/exam/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course_id, start_time, end_time, room }),
    });
    const data: Exam = await response.json();
    return data;
  }

  public async checkExamConflict(
    room: string,
    start_time: Date,
    end_time: Date
  ): Promise<Exam | null> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/exam/examConflict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, start_time, end_time }),
    });
    const data: Exam = await response.json();
    return data;
  }
}
