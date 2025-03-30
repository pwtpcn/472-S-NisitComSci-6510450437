import { Elysia, t } from "elysia";
import ReviewRepository from "../repositories/ReviewRepository";

const reviewController = new Elysia({
  prefix: "/review",
  tags: ["Review"],
});

reviewController.model({
  Review: t.Object({
    review_id: t.Number(),
    review_text: t.String(),
    rating: t.Number({ minimum: 0, maximum: 10 }),
    review_date: t.String(),
    user_uuid: t.String(),
    course_id: t.String(),
  }),
});

reviewController.get("/all", async () => {
    const reviewRepository = new ReviewRepository();
    return await reviewRepository.getAllReviews();
  },
  {
    detail: {
      summary: "Get All Reviews",
      description: "Get all reviews from database",
    },
  }
);

reviewController.get("/course/:course_id",  async ({ params }) => {
    const reviewRepository = new ReviewRepository();
    return await reviewRepository.getReviewsByCourse(params.course_id);
  },
  {
    detail: {
      summary: "Get Reviews by Course ID",
      description: "Get all reviews for a specific course",
    },
  }
);

reviewController.post("/add", async ({ body }) => {
    // ตัวอย่าง console.log
    console.log("[POST /review/add] body:", body);
    const { course_id, uuid, rating, review_text } = body;
    if (rating < 0 || rating > 10) {
      throw new Error("Rating must be between 0 and 10");
    }

    const reviewRepository = new ReviewRepository();
    return await reviewRepository.addReview(course_id, uuid, rating, review_text);
  },
  {
    body: t.Object({
      course_id: t.String(),
      uuid: t.String(),
      rating: t.Number({ minimum: 0, maximum: 10 }),
      review_text: t.String(),
    }),
    detail: {
      summary: "Add Review",
      description: "Allow students to add a review to a course",
    },
  }
);


reviewController.delete(
  "/delete/:id",
  async ({ params }) => {
    const reviewRepository = new ReviewRepository();
    return await reviewRepository.deleteReview(Number(params.id));
  },
  {
    detail: {
      summary: "Delete Review",
      description: "Allow users to delete their own review",
    },
  }
);

export default reviewController;