import {
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunction,
} from "react-router";
import { authCookie } from "~/utils/session.server";
import TeachRepository from "./repositories/TeachRepository.server";
import CourseRepository from "./repositories/CourseRepository.server";
import TMenuBar from "./components/TMenuBar";
import ExamRepository from "./repositories/ExamRepository.server";
import { useState, useEffect } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");
  if (user.role !== "teacher") return redirect("/");

  const teachRepo = new TeachRepository();
  const teachs = await teachRepo.getTeachsByUserId(user.uuid);

  const courseIds = teachs.map((teach) => teach.course_id);

  const courseRepo = new CourseRepository();
  const courses: Course[] = await courseRepo.getCoursesListByIds(courseIds);

  return { user, courses };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const course_id = formData.get("course_id") as string;
  const start_time = new Date(formData.get("start_time") as string);
  const end_time = new Date(formData.get("end_time") as string);
  const room = formData.get("room") as string;

  // console.log("Form Data: ", { course_id, start_time, end_time, room });

  let errors: Record<string, any> = {};

  const examRepo = new ExamRepository();
  const conflict = await examRepo.checkExamConflict(room, start_time, end_time);

  if (conflict)
    errors.conflict = "This room is already booked for the selected time.";
  if (end_time < start_time)
    errors.time = "End time must be later than the start time.";

  if (Object.keys(errors).length > 0) {
    return { errors }; // Return all errors if any exist
  }

  try {
    const newExam = await examRepo.createExam(
      course_id,
      start_time,
      end_time,
      room
    );
    console.log("New Exam: ", newExam);
    return { success: "Exam created successful!" };
  } catch (error) {
    return { errors: { database: "Failed to create exam. Please try again." } };
  }
}

type LoaderData = {
  user: AuthCookie;
  courses: Course[];
};

export default function CreateExam() {
  const { user, courses } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors || {};
  const successMessage = fetcher.data?.success || "";

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (successMessage) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  }, [successMessage]);

  return (
    <div className="flex">
      <TMenuBar user={user} />
      <div className="bg-[#C0E0FF] h-screen w-screen flex flex-col justify-center items-center overflow-auto">
        <fetcher.Form
          method="post"
          className="flex flex-col gap-6 bg-white items-center rounded-lg p-6 shadow-2xl w-[600px] max-w-[90%]"
        >
          <h1 className="text-2xl font-semibold mb-4">Create Exam</h1>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4">
              <label className="font-medium w-1/3">Course:</label>
              <select
                name="course_id"
                className="bg-amber-100 rounded-2xl p-2 w-2/3"
                required
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_id} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-medium w-1/3">Start Date and Time:</label>
              <input
                type="datetime-local"
                name="start_time"
                className="bg-amber-100 rounded-2xl p-2 w-2/3"
                required
              />
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-center gap-4">
                <label className="font-medium w-1/3">End Date and Time:</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  className="bg-amber-100 rounded-2xl p-2 w-2/3"
                  required
                />
              </div>
              {errors.time && (
                <h1 className="text-red-500 text-[12px] mt-1 ml-[33%]">{errors.time}</h1>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="font-medium w-1/3">Room:</label>
              <input
                type="text"
                name="room"
                className="bg-amber-100 rounded-2xl p-2 w-2/3"
                required
              />
            </div>
          </div>

          {showMessage && (
            <div className="text-[#397d44]">{successMessage}</div>
          )}

          {errors.conflict && (
            <h1 className="text-red-500">{errors.conflict}</h1>
          )}

          <button
            type="submit"
            className="w-full bg-[#7793AE] hover:bg-[#43586c] font-semibold text-white py-2 rounded-lg shadow-md mt-4"
          >
            Create Exam
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
