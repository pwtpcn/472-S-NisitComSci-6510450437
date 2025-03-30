import MenuBar from "./components/MenuBar";
import { Form } from "react-router-dom";
import ReviewRepository from "./repositories/ReviewRepository.server";
import CourseRepository from "./repositories/CourseRepository.server";
import { useActionData, useNavigation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { type LoaderFunctionArgs, Link, redirect, useLoaderData, type LoaderFunction, type ActionFunction, type ActionFunctionArgs } from "react-router";
import { authCookie } from "~/utils/session.server";

// Loader function to handle data fetching before rendering the component
export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");
  const courseRepository = new CourseRepository();
  const courses: Course[] = await courseRepository.getAllCourse();
  const reviewRepository = new ReviewRepository();
  const url = new URL(request.url);
  const course_id = url.searchParams.get("course_id") ?? "";
  const reviews = await reviewRepository.getReviewsByCourse(course_id);
  const course = courses.filter(course => course.course_id === course_id);
  console.log("✅ Loaded user:", user);
  // console.log("✅ Loaded course_id:", course_id);
  // console.log("✅ Loaded course:", course);
  // console.log("✅ Loaded Reviews:", reviews);

  return { user, reviews, course};
};

// สร้าง Action function เพื่อจัดการลบรีวิว
export const action: ActionFunction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const review_id = Number(formData.get("review_id"));
  const review_user_uuid = formData.get("review_user_uuid") as string;

  // ดึงข้อมูลผู้ใช้งานปัจจุบัน
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  // ตรวจสอบว่าผู้ใช้งานเป็นเจ้าของรีวิวหรือไม่
  if (user.uuid !== review_user_uuid) {
    return new Response(JSON.stringify({ error: "ไม่สามารถลบรีวิวของคนอื่นได้" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ทำการลบรีวิวหากผ่านเงื่อนไข
  const reviewRepository = new ReviewRepository();
  await reviewRepository.deleteReview(review_id);

  // redirect กลับไปหน้าปัจจุบันหลังลบสำเร็จ
  return redirect(request.url);
};

const CourseReviews: React.FC = () => {
  // Use `useLoaderData` to get the loaded data from the loader
  const { user, reviews, course } = useLoaderData<{ user: User, reviews: Review[], course: Course[] }>();
  
  let total = 0;
  reviews.forEach((review) => {
    total += review.rating;  // Assuming review.rating is the score you want to average
  });

  const averageScore = reviews.length > 0 ? total / reviews.length : 0;

  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  useEffect(() => {
    if (actionData?.error) {
      alert(actionData.error); // แสดงข้อความแจ้งเตือน
    }
  }, [actionData, navigation.state]);

  // const time = new Date(reviews.review_date) รอตัดสินใจว่าจะใช้รูปแบบเวลาแบบไหน

  return (
    <div className="flex">
      <MenuBar user={user} />
      <div className="bg-[#C0E0FF] h-screen w-screen p-6 relative mx-auto overflow-auto border">
        {/* Course Header */}
        <div className="bg-white p-4 mb-4 rounded-2xl w-full">
          <h1 className="text-lg font-bold text-[#0f1d2a]">{course[0].course_id} {course[0].course_name}</h1>
        </div>

        {/* Course Description */}
        <div className="bg-white p-4 mb-4 rounded-2xl w-full">
          <p>{course[0].course_detail}</p>
        </div>

        {/* Buttons */}
        <div className="flex mb-4">
          <button className="bg-[#7793AE] text-white px-4 py-2 mr-2 rounded-2xl ">
            รีวิวทั้งหมด
          </button>
          <button className="bg-[#7793AE] text-white px-4 py-2 mr-2 rounded-2xl ">
            คะแนนรวมวิชานี้ : {averageScore.toString().slice(0, 5)}/10
          </button>
          <Link to={`/create-review?course_id=${course[0].course_id}`}>
            <button className="bg-[#61815D] text-white px-4 py-2 rounded-2xl shadow-md hover:bg-[#263824] transition">
              สร้างรีวิว
            </button>
          </Link>
        </div>

        {/* Reviews Section */}
        {reviews.length === 0 ? (
          <div className="text-[#0f1d2a]">No reviews available.</div>
        ) : (

          reviews.map((review, reviews) => (
              <div key={reviews} className="bg-white p-4 mb-4 rounded-2xl">
                <div className="flex items-center mb-2">
                  <div className="bg-gray-100 p-2 flex-1 rounded-2xl">{review.user.name ?? "Anonymous"} - {review.review_date.slice(0, 10)}</div>

                  <div className="bg-[#61815D] p-2 ml-2 rounded-2xl text-white">{review.rating}/10</div>
                </div>
                <div className="bg-gray-100 p-4 mb-2 w-full text-left rounded-2xl">
                  <p>{review.review_text}</p>
                </div>
                <br/>
                <Form method="delete"onSubmit={(e) => {
                  if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?")) {
                      e.preventDefault();  // ยกเลิกการส่งฟอร์มหากกดยกเลิก
                  }
                }}>
                  <input type="hidden" name="review_id" value={review.review_id}/>
                  <input type="hidden" name="review_user_uuid" value={review.user_uuid}/>
                    <button
                      type="submit"
                      className="bg-red-700 hover:bg-red-500 text-white px-4 py-2 transition rounded-2xl">
                      Delete
                    </button>
                </Form>
              </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseReviews;