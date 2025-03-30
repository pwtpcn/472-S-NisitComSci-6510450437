// controllers/EnrollmentController.ts
import { Elysia, t } from "elysia";
import EnrollmentRepository from "../repositories/EnrollmentRepository";

const enrollmentController = new Elysia({
    prefix: "/enrollment",
    tags: ["Enrollment"],
});

// Schema สำหรับ Enrollment
enrollmentController.model({
    user_uuid: t.String(),
    course_id: t.String(),
});

// GET /enrollment/user/:user_uuid
// ดึงข้อมูล Enrollment ของผู้ใช้ตาม user_uuid
enrollmentController.get(
    "/user/:user_uuid",
    async ({ params: { user_uuid } }) => {
        const enrollmentRepository = new EnrollmentRepository();
        const enrollments = await enrollmentRepository.getEnrollmentsByUser(user_uuid);
        return enrollments;
    },
    {
        params: t.Object({ user_uuid: t.String() }),
        detail: {
            summary: "Get Enrollments by User",
            description: "ดึงข้อมูล Enrollment ของผู้ใช้ตาม user_uuid",
        },
    }
);

// POST /enrollment/update
// อัปเดต Enrollment ของผู้ใช้ด้วยการรับ user_uuid และ course_ids (array)
enrollmentController.post(
    "/update",
    async ({ body }) => {
        const { user_uuid, course_ids } = body;
        const enrollmentRepository = new EnrollmentRepository();
        await enrollmentRepository.updateEnrollments(user_uuid, course_ids);
        return { message: "Enrollment updated successfully" };
    },
    {
        body: t.Object({
            user_uuid: t.String(),
            course_ids: t.Array(t.String()),
        }),
        detail: {
            summary: "Update Enrollments",
            description: "อัปเดตข้อมูล Enrollment ของผู้ใช้",
        },
    }
);

export default enrollmentController;
