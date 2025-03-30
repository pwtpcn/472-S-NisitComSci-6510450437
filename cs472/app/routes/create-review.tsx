import React, { useState } from "react";
import {useLoaderData,Form,redirect,type LoaderFunctionArgs,type ActionFunctionArgs,useActionData} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MenuBar from "./components/MenuBar";
import ReviewRepository from "./repositories/ReviewRepository.server";
import CourseRepository from "./repositories/CourseRepository.server";
import { authCookie } from "~/utils/session.server";

// ===== Loader =====
export async function loader({ request }: LoaderFunctionArgs) {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  // ดึง course_id จาก query parameter
  const url = new URL(request.url);
  const course_id = url.searchParams.get("course_id") ?? "";

  // โหลดข้อมูล course
  const courseRepository = new CourseRepository();
  const courses: Course[] = await courseRepository.getAllCourse();
  const targetCourse = courses.find((c) => c.course_id === course_id);

  if (!targetCourse) {
    return redirect("/");
  }
  return { user, course: targetCourse };
}

// ===== Action =====
export async function action({ request }: ActionFunctionArgs) {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const course_id = url.searchParams.get("course_id") ?? "";

  const formData = await request.formData();
  const review_text = formData.get("review_text") as string;
  const rating = Number(formData.get("rating"));

  // ถ้าไม่ได้กรอก -> ส่ง error กลับ
  if (!review_text || !rating) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    const reviewRepository = new ReviewRepository();
    const review = await reviewRepository.addReview(course_id, user.uuid, rating, review_text);
    // console.log("✅ Loaded User:", user.uuid);
    // console.log("✅ Loaded Create Reviews:", review);

    return redirect(`/review-each-course?course_id=${course_id}`);
  } catch (error) {
    // console.error("Error submitting review:", error);
    return { error: "เกิดข้อผิดพลาดในการโพสต์รีวิว" };
  }
}

// ===== Component หลัก =====
export default function CreateReviewPage() {
  // 1) ดึงข้อมูลจาก loader
  const { user, course } = useLoaderData() as {
    user: User;
    course: Course;
  };
  // 2) ดึง actionData จาก action
  const actionData = useActionData() as { error?: string };

  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState("");
  const [score, setScore] = useState("");

  return (
    <div className="flex">
      <MenuBar user={user} />

      <div className="review-container bg-[#C0E0FF] h-screen w-screen p-6 relative overflow-auto">
        <div className="bg-white p-2 mb-4 rounded-2xl">
          <h2 id="course-title" className="text-lg">
            {course.course_id} - {course.course_name}
          </h2>
        </div>

        <h2 className="review-heading w-[200px] bg-white p-2 mb-4 text-xl rounded-2xl">
          เขียนสิ่งที่อยากรีวิวเลย
        </h2>

        {/* แสดงข้อความ error ถ้ามี */}
        {actionData?.error && (
          <div className="mb-4 text-red-500 font-semibold">
            {actionData.error}
          </div>
        )}

        <Form method="post">
          <textarea
            name="review_text"
            placeholder="เขียนตรงนี้..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full h-[100px] bg-white p-2 mb-4 rounded-2xl"
          />

          <div className="score-container w-[170px] bg-white p-2 mb-4 rounded-2xl">
            <h3 className="score-heading text-lg">ให้คะแนนเท่าไหร่ดี :</h3>
            <select
              name="rating"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="p-2 border"
            >
              <option value="">เลือกคะแนนที่นี่</option>
              <option value="1">1 - ควรปรับปรุง</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5 - ปานกลาง</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10 - ดีมาก</option>
            </select>
          </div>

          <div className="button-container flex space-x-4">
            <button
              type="button"
              className="btn-cancel bg-red-500 text-black px-4 py-2 shadow-md hover:bg-[#990000] rounded-md"
              onClick={() => navigate(-1)}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="btn-submit bg-green-500 text-black px-4 py-2 shadow-md hover:bg-[#339900] rounded-md"
            >
              โพสต์เลย
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}