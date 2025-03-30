import Elysia, { t } from "elysia";
import TeachRepository from "../repositories/TeachRepository";
import { Teach } from "@prisma/client";

const TeachController = new Elysia({
  prefix: "/api/teach",
  tags: ["Teach"],
});

TeachController.get(
  "/get/:user_uuid",
  async ({ params: { user_uuid } }) => {
    const teachRepo = new TeachRepository();
    const teachs: Teach[] = await teachRepo.getTeachsByUser(user_uuid);
    return teachs;
  },
  {
    params: t.Object({ user_uuid: t.String() }),
    detail: {
      summary: "Get Teach By user uuid",
      description: "Get Teach By user uuid from database",
    },
  }
);

TeachController.get(
  "/getAll",
  async () => {
    const teachRepository = new TeachRepository();
    const teachs: Teach[] = await teachRepository.getAllTeachs();
    return teachs;
  },
  {
    detail: {
      summary: "Get All Teach",
      description: "Get all teach from database",
    },
  }
);

TeachController.post(
  "/create",
  async ({ body }) => {
    const teachRepo = new TeachRepository();
    try {
      const teach: Teach = await teachRepo.createTeach(body);
      return teach;
    } catch (error: any) {
      return { error: error.message };
    }
  },
  {
    body: t.Object({
      user_uuid: t.String(),
      course_id: t.String(),
    }),
    detail: {
      summary: "Create Teach",
      description: "Create new Teach in database",
    },
  }
);

export default TeachController;
