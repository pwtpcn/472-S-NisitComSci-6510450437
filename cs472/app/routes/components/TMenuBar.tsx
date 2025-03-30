import { Link } from "react-router";
import LogoutButton from "./LogoutButton";

interface TMenuBarProps {
  user: {
    name: string;
  };
}

export default function TMenuBar({ user }: TMenuBarProps) {
  return (
    <div className="w-60 min-w-60 max-w-60 h-screen bg-[#0f1d2a] text-white flex flex-col justify-between p-4 shadow-lg overflow-auto">
      {/* Username at the top */}
      <div className="text-xl font-bold text-center py-4 border-b border-gray-700">
        {user.name}
      </div>
      
      {/* Navigation Buttons */}
      <nav className="flex flex-col space-y-4 flex-grow mt-4">
        <Link 
        to="/add-course" 
        className="px-4 py-2 bg-[#1a3043] rounded hover:bg-[#5685af]">My Course</Link>

        <Link to="/create-exam" 
        className="px-4 py-2 bg-[#1a3043] rounded hover:bg-[#5685af]">Exam Schedule</Link>
      </nav>

      <br/>

      <LogoutButton/>
      
    </div>
  );
}


