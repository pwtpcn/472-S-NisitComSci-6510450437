export default class TeachRepository {
  public async getTeachsByUserId(user_uuid: string): Promise<Teach[]> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/teach/get/${user_uuid}`);
    const data: Teach[] = await response.json();
    return data;
  }

  public async createTeachRecord(
    user_uuid: string,
    course_id: string
  ): Promise<Teach> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const response = await fetch(`${BACKEND_URL}/api/teach/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_uuid, course_id }),
    });
    const data: Teach = await response.json();

    return data;
  }
}
