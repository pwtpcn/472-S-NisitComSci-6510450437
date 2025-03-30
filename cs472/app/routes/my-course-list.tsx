import {
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunction,
  type LoaderFunction,
} from "react-router";
import CourseRepository from "./repositories/CourseRepository.server";
import EnrollmentRepository from "./repositories/EnrollmentRepository.server";
import { authCookie } from "~/utils/session.server";
import MenuBar from "./components/MenuBar";
import { useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  // ตรวจสอบ session ของผู้ใช้
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  const courseRepo = new CourseRepository();
  const enrollmentRepo = new EnrollmentRepository();

  // ดึงข้อมูลคอร์สทั้งหมดจากฐานข้อมูล
  const allCourses: Course[] = await courseRepo.getAllCourse();

  // ใช้ userId จาก sessionดึง Enrollment ปัจจุบัน
  const enrollments = await enrollmentRepo.getEnrollmentsByUser(user.uuid);

  const enrolledCourseIds = enrollments.map((e) => e.course_id);

  return { user, allCourses, enrolledCourseIds };
};

export const action: ActionFunction = async ({ request }) => {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const action = formData.get("_action") as string;
  switch (action) {
    case "updateEnrollments":
      const courseIds = formData.getAll("courseIds") as string[];
      const enrollmentRepo = new EnrollmentRepository();
      const message = await enrollmentRepo.updateEnrollments(
        user.uuid,
        courseIds
      );
      return { message: message.message, error: "", data: null };
    default:
      return { message: "", error: "Action not found", data: null };
  }
};

interface ActionMessage {
  message: string;
  error: string;
  data: any;
}

type LoaderData = {
  allCourses: Course[];
  enrolledCourseIds: string[];
  user: AuthCookie;
};

export default function MyCourseList() {
  const { user, allCourses, enrolledCourseIds } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionMessage>();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredCourses = selectedYear
    ? allCourses.filter((course) => course.year === selectedYear)
    : allCourses;

  return (
    <div className="flex">

      <MenuBar user={user} />
      
      <div className="bg-[#C0E0FF] h-screen w-screen p-6 relative overflow-auto">
        <div className="bg-white p-4 mb-4 rounded-2xl text-center w-full">
          <h1 className="text-[#0f1d2a] text-2xl font-bold">
            {user.name} Course List
          </h1>
        </div>

        <div className="flex gap-4 mb-4">
          {[1, 2, 3, 4].map((year) => (
            <button
              key={year}
              className={`px-4 py-2 rounded-lg shadow-md font-semibold ${
                selectedYear === year
                  ? "bg-[#7793AE] text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setSelectedYear(year)}
            >
              Year {year}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg max-h-[800px] overflow-y-auto border border-gray-300">
          <fetcher.Form method="post" className="mt-4 space-y-4">
            <ul className="space-y-2">
              {filteredCourses.map((course) => {
                const isChecked = enrolledCourseIds.includes(course.course_id);
                return (
                  <li
                    key={course.course_id}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      name="courseIds"
                      value={course.course_id}
                      defaultChecked={isChecked}
                      id={`course_${course.course_id}`}
                    />
                    <label htmlFor={`course_${course.course_id}`}>
                      {course.course_name}
                    </label>
                  </li>
                );
              })}
            </ul>

            {fetcher.data?.message && (
              <p className="text-[#397d44]">{fetcher.data.message}</p>
            )}
            {fetcher.data?.error && (
              <p className="text-red-700">{fetcher.data.error}</p>
            )}

            <button
              type="submit"
              name="_action"
              value="updateEnrollments"
              className="mt-4 px-4 py-2 bg-[#7793AE] text-white font-semibold rounded-lg shadow-md hover:bg-[#43586c] transition "
            >
              save
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
