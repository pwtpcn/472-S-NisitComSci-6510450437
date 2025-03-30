import { Review } from "@prisma/client";
import db from "../database";

class ReviewRepository {
  // ✅ ดึงข้อมูล Review ตาม ID
  public async getReviewByID(review_id: number): Promise<Review | null> {
    return await db.review.findUnique({
      where: { review_id },
    });
  }

  // ✅ ดึงข้อมูล Review ทั้งหมด
  public async getAllReviews(): Promise<Review[]> {
    return await db.review.findMany();
  }

  // ✅ ดึงรีวิวทั้งหมดของรายวิชาหนึ่ง ๆ
  // public async getReviewsByCourse(course_id: string): Promise<Review[]> {
  //   return await db.review.findMany({
  //     where: { course_id },
  //   });
  // }

  public async getReviewsByCourse(course_id: string): Promise<Review[]> {
    return await db.review.findMany({
      where: {
        course_id: course_id,
      },
      include: {
        user: {select: {name: true}},
      },
      orderBy: {
        review_date: "desc"
      }
    });
  }

  // ✅ เพิ่มรีวิวใหม่ (เฉพาะนักศึกษา)
  public async addReview(
    course_id: string,
    uuid: string,
    rating: number,
    review_text: string
  ): Promise<Review> {
    console.log("[addReview] input:", {
      course_id,
      uuid,
      rating,
      review_text,
    });
    try {
      const newReview = await db.review.create({
        data: {
          course_id,
          user_uuid: uuid,
          rating,
          review_text,
        },
      });

      // เช็คว่ากลับมาเป็น Object จริง ๆ ไหม
      console.log("[addReview] Created review:", newReview);
      return newReview;
    } catch (err) {
      console.error("[addReview] ERROR:", err);
      throw err; // โยน error ต่อไปให้ controller หรือ caller จัดการ
    }
  }

  // ✅ ลบรีวิว (เฉพาะเจ้าของรีวิว)
  public async deleteReview(review_id: number): Promise<Review | null> {
    const review = await db.review.findUnique({
      where: { review_id },
    });

    if (!review) throw new Error("Review not found");

    return await db.review.delete({
      where: { review_id },
    });
  }
}

export default ReviewRepository;