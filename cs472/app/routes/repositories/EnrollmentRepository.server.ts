export default class EnrollmentRepository {
    public async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
      const BACKEND_URL = process.env.BACKEND_URL as string;
      const response = await fetch(`${BACKEND_URL}/enrollment/user/${userId}`);
      const data: Enrollment[] = await response.json();
      return data;
    }

    public async updateEnrollments(userId: string, courseIds: string[]): Promise<{message : string}> {
      const BACKEND_URL = process.env.BACKEND_URL as string;
      const response = await fetch(`${BACKEND_URL}/enrollment/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_uuid: userId,
          course_ids: courseIds,
        }),
      });
      const data : {message : string} = await response.json();
      console.log(data);
      return data;
    }
  }
  