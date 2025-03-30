// src/controllers/CourseController.ts
import { Elysia, t } from "elysia";
import CourseRepository from "../repositories/CourseRepository";
import { Course } from "@prisma/client";

const courseController = new Elysia({
  prefix: "/course", // Changed from "/api/course" to just "/course"
  tags: ["Course"],
});

// Schema
courseController.model({
  course_id: t.String(),
  course_name: t.String(),
  course_detail: t.String(),
});

// GET all courses
courseController.get(
  "/all",
  async () => {
    const courseRepository = new CourseRepository();
    const courses: Course[] = await courseRepository.getAllCourse();
    return courses;
  },
  {
    detail: {
      summary: "Get All Courses",
      description: "Get all courses from database",
    },
  }
);

courseController.get(
  "/get/:course_id",
  async ({ params }) => {
    const courseRepository = new CourseRepository();
    const course: Course | null = await courseRepository.getCourseByID(
      params.course_id
    );
    return course;
  },
  {
    detail: {
      summary: "Get Course by course id",
      description: "Get course from database by course id",
    },
  }
);

courseController.get(
  "/get/courseName/:course_name",
  async ({ params }) => {
    const courseRepository = new CourseRepository();
    const course: Course | null = await courseRepository.getCourseByName(
      params.course_name
    );
    return course;
  },
  {
    detail: {
      summary: "Get Course by course name",
      description: "Get course from database by course name",
    },
  }
);

//get course ที่ต้องการพร้อมกันหลายตัว input = course_id1,course_id2,... ไม่ต้อง space
courseController.get(
  "/getList/:course_id",
  async ({ params }) => {
    const courseRepository = new CourseRepository();

    const courseIds = params.course_id.split(",");
    const courses = await courseRepository.getCourseListById(courseIds);
    return courses;
  },
  {
    detail: {
      summary: "Get Course list by course_id",
      description: "Get list of Course from database by using course_id",
    },
  }
);

courseController.get(
  "getCourseWithExams/:user_uuid",
  async ({ params }) => {
    const courseRepository = new CourseRepository();
    const courses = await courseRepository.getCourseWithExams(params.user_uuid);
    return courses;
  },
  {
    detail: {
      summary: "Get course with exam",
      description: "Get course with exam using user_uuid",
    },
  }
);

courseController.get(
  "getTeacherCourses/:user_uuid",
  async ({ params }) => {
    const courseRepository = new CourseRepository();
    const teacherCourses = await courseRepository.getTeacherCourses(
      params.user_uuid
    );
    return teacherCourses;
  },
  {
    detail: {
      summary: "Get courses taught by a teacher",
      description:
        "Retrieve courses that a teacher is responsible for using user_uuid",
    },
  }
);

//Create a course
courseController.post(
  "/create",
  async ({ body }) => {
    const courseRepository = new CourseRepository();
    try {
      const course: Course = {
        course_id: body.course_id,
        course_name: body.course_name,
        course_detail: body.course_detail,
        year: body.year,
      };
      const newCourse: Course = await courseRepository.createCourse(course);
      return newCourse;
    } catch (error: any) {
      return { error: error.message };
    }
  },
  {
    body: t.Object({
      course_id: t.String(),
      course_name: t.String(),
      course_detail: t.String(),
      year: t.Number(),
    }),
    detail: {
      summary: "Create a Course",
      description: "Create a course in database",
    },
  }
);

export default courseController;
