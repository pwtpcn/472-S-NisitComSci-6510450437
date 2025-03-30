import { Enrollment } from "@prisma/client";
import db from "../database";

class EnrollmentRepository {
  // ดึง Enrollment ของผู้ใช้ตาม user_uuid
  public async getEnrollmentsByUser(user_uuid: string): Promise<Enrollment[]> {
    return await db.enrollment.findMany({
      where: { user_uuid: user_uuid },
    });
  }

  // อัปเดต Enrollment ของผู้ใช้โดยลบข้อมูลเก่าทั้งหมดแล้วสร้างใหม่ตาม course_ids ที่เลือก
  public async updateEnrollments(
    user_uuid: string,
    course_ids: string[]
  ): Promise<void> {
    // ลบ Enrollment เก่า
    await db.enrollment.deleteMany({
      where: { user_uuid },
    });

    // ถ้ามีคอร์สที่ถูกเลือก ให้สร้าง Enrollment ใหม่
    if (course_ids.length > 0) {
      const newEnrollments = course_ids.map((course_id) => ({
        user_uuid,
        course_id,
      }));

      await db.enrollment.createMany({
        data: newEnrollments,
      });
    }
  }
}

export default EnrollmentRepository;
