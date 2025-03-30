import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import MenuBar from "./components/MenuBar";
import { authCookie } from "~/utils/session.server";
import ExamScheduleCard from "./components/ExamScheduleCard";
import CourseRepository from "./repositories/CourseRepository.server";
import Header from "./components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = request.headers.get("Cookie");
  const user: AuthCookie = await authCookie.parse(session);
  if (!user) return redirect("/login");

  const courseRepo = new CourseRepository();
  const coursesWithExams = await courseRepo.getCourseWithExams(user.uuid);

  const exams = coursesWithExams.flatMap((course) =>
    course.exam.map((exam) => ({
      exam_id: exam.exam_id,
      course_id: course.course_id,
      course_name: course.course_name,
      room: exam.room,
      start_time: new Date(exam.start_time),
      end_time: new Date(exam.end_time),
    }))
  );

  // เรียงลำดับตาม start_time
  exams.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

  return { user, exams };
}

export default function ExamSchedule() {
  const { user, exams } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <MenuBar user={user} />
      <div className="bg-[#C0E0FF] h-screen w-screen p-6 relative overflow-auto">
        
        <Header data="Exam Schedule" />

        <div
          className="bg-white rounded-2xl shadow-lg w-full mx-auto overflow-y-auto p-4"
          style={{ maxHeight: "min(85vh, 850px)" }}
        >
          <div className="space-y-4">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <ExamScheduleCard key={exam.exam_id} data={exam} />
              ))
            ) : (
              <p className="text-black">No exams scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
