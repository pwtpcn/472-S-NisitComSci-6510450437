import Elysia, { t } from "elysia";
import ExamRepository from "../repositories/ExamRepository";
import { Exam } from "@prisma/client";

const ExamController = new Elysia({
  prefix: "/api/exam",
  tags: ["Exam"],
});

ExamController.model({
  Exam: t.Object({
    exam_id: t.Number(),
    course_id: t.String(),
    date: t.Date(),
    room: t.String(),
  }),
});

ExamController.get(
  "getAll",
  async () => {
    const examRepo = new ExamRepository();
    const exams: Exam[] = await examRepo.getAllExams();
    return exams;
  },
  {
    detail: {
      summary: "Get All Exams",
      description: "Get all exam from database",
    },
  }
);

ExamController.get(
  "/get/:exam_id",
  async ({ params: { exam_id } }) => {
    const examRepo = new ExamRepository();
    const exam: Exam | null = await examRepo.getExamById(exam_id);
    return exam ?? { error: "Exam not found", status: 200 };
  },
  {
    params: t.Object({ exam_id: t.Number() }),
    detail: {
      summary: "Get Exam by id",
      description: "Get Exam by id from database",
    },
  }
);

ExamController.get(
  "/get/course/:course_id",
  async ({ params: { course_id } }) => {
    const examRepo = new ExamRepository();
    const exams = await examRepo.getExamsByCourseId(course_id);
    return exams;
  },
  {
    params: t.Object({
      course_id: t.String(),
    }),
    detail: {
      summary: "Get Exam by course id",
      description: "Get Exam by course id from database",
    },
  }
);

ExamController.post(
  "/create",
  async ({ body }) => {
    const examRepo = new ExamRepository();
    try {
      const exam: Exam = await examRepo.createExam(body);
      return exam;
    } catch (error: any) {
      return { error: error.message };
    }
  },
  {
    body: t.Object({
      course_id: t.String(),
      start_time: t.Date(),
      end_time: t.Date(),
      room: t.String(),
    }),
    detail: {
      summary: "Create Exam",
      description: "Create new Exam in database",
    },
  }
);

ExamController.delete(
  "/delete",
  async ({ body }) => {
    const examRepo = new ExamRepository();
    return examRepo.deleteExam(body.exam_id);
  },
  {
    body: t.Object({ exam_id: t.Number() }),
    detail: {
      summary: "Delete Exam",
      description: "Delete Exam by id",
    },
  }
);

ExamController.post(
  "/examConflict",
  async ({ body }) => {
    const examRepo = new ExamRepository();
    try {
      const conflict = examRepo.checkExamConflict(body);
      return conflict;
    } catch (error: any) {
      return { error: error.message };
    }
  },
  {
    body: t.Object({
      room: t.String(),
      start_time: t.Date(),
      end_time: t.Date(),
    }),
    detail: {
      summary: "Time Conflict",
      description: "Check if time overlap in this room",
    },
  }
);

export default ExamController;
