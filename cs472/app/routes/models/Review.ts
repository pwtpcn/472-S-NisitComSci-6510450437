interface Review {
    review_id: number;
    course_id: string;
    user_uuid: string;
    user: {name: string};
    review_text: string;
    rating: number;
    review_date: string;
}