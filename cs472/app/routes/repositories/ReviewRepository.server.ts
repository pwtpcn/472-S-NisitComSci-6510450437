interface Review {
    review_id: number;
    course_id: string;
    user_uuid: string;
    review_text: string;
    rating: number;
}
  
export default class ReviewRepository {
    // Method to get all reviews
    public async getAllReviews(): Promise<Review[]> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/review/all`);
        const data: Review[] = await response.json();
        return data;
    }

    // Method to get reviews by course ID
    public async getReviewsByCourse(course_id: string): Promise<Review[]> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/review/course/${course_id}`);
        const data: Review[] = await response.json();
        return data;
    }

    // Method to add a new review
    public async addReview(
        course_id: string,
        uuid: string,
        rating: number,
        review_text: string,
    ): Promise<Review> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/review/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({course_id, uuid, rating, review_text}),
        });
        const data: Review = await response.json();
        console.log("[addReview] got called with:", { course_id, uuid, rating, review_text });
        return data;
    }

    // Method to delete a review
    public async deleteReview(review_id: number): Promise<Review | null> {
        const BACKEND_URL = process.env.BACKEND_URL as string;
        const response = await fetch(`${BACKEND_URL}/review/delete/${review_id}`,
        {
            method: "DELETE",
        }
        );

        if (!response.ok) {
        throw new Error("Failed to delete review");
        }
        

        const data: Review = await response.json();
        return data;
    }
}