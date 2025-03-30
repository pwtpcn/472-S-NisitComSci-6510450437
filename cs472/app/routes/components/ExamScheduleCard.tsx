
import { format } from "date-fns";

interface DataProps {
  data: {
    start_time: Date;
    end_time: Date;
    course_id: string;
    course_name: string;
    room: string;
  };
}

export default function ExamScheduleCard({ data }: DataProps) {
  const examStart = new Date(data.start_time);
  const examEnd = new Date(data.end_time);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = daysOfWeek[examStart.getDay()];
  const foramattedDate = format(examStart, "dd MMM");

  const start_time = format(new Date(data.start_time.getTime()-(3600000*7)), "HH:mm");
  const end_time = format(new Date(data.end_time.getTime()-(3600000*7)), "HH:mm");

  const dayColors = {
    SUN: "#FF0000", // แดง
    MON: "#ffe86a", // เหลือง
    TUE: "#eaa7db", // ชมพู
    WED: "#55ea94", // เขียว
    THU: "#f8c471", // ส้ม
    FRI: "#85c1e9", // ฟ้า
    SAT: "#c39bd3", // ม่วง
  } as const;

  return (
    <div className="flex items-center bg-white shadow-md rounded-lg p-4 space-x-4">
      {/* Left Section (Day & Time) */}
      <div className="w-32 text-black p-4 rounded-lg flex flex-col h-full"
      style={{ backgroundColor: dayColors[day as keyof typeof dayColors]}}>
        <div className="font-bold">{day} {foramattedDate}</div>
        <div className="text-lg font-semibold">{start_time} - {end_time}</div>
      </div>

      {/* Right Section (Details) */}
      <div className="flex-grow space-y-2">
        <div className="text-gray-700 font-semibold"> {data.course_id} </div>

        <div className="text-[#0f1d2a] font-bold">
          {data.course_name}
        </div>

        <div className="text-gray-600">ห้อง: {data.room}</div>
      </div>
    </div>
  );
}
