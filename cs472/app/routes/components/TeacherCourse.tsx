interface TeacherCourseCardProps {
  course: {
    course_id: string;
    course_name: string;
    course_detail: string;
    year: number;
  };
}

export default function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  return (
    <div className="flex flex-col gap-4 bg-white shadow-md rounded-lg p-4">
      <div>
        <h3 className="text-gray-500 font-semibold">Course Id</h3>
        <p className="text-gray-500 font-semibold">{course.course_id}</p>
      </div>

      <div>
        <h3 className="text-gray-500 font-semibold">Course Name</h3>
        <p className="text-[#0f1d2a] font-bold text-lg">{course.course_name}</p>
      </div>

      <div>
        <h3 className="text-gray-500 font-semibold">Year</h3>
        <p className="text-[#0f1d2a] font-bold text-lg">{course.year}</p>
      </div>

      <div>
        <h3 className="text-gray-500 font-semibold">Details</h3>
        <p className="text-gray-700">{course.course_detail}</p>
      </div>
    </div>
  );
}
