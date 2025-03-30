import { Teach } from "@prisma/client";
import db from "../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

class TeachRepository {
  public async getTeachsByUser(user_uuid: string): Promise<Teach[]> {
    return await db.teach.findMany({
      where: { user_uuid: user_uuid },
    });
  }

  public async getAllTeachs(): Promise<Teach[]> {
    return await db.teach.findMany();
  }

  public async createTeach({
    user_uuid,
    course_id,
  }: {
    user_uuid: string;
    course_id: string;
  }): Promise<Teach> {
    try {
      const response = await db.teach.create({
        data: {
          user_uuid: user_uuid,
          course_id: course_id,
        },
      });
      return response;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new Error("Internal Server Error");
        }
      }
    }
    throw new Error("Internal Server Error");
  }
}

export default TeachRepository;
