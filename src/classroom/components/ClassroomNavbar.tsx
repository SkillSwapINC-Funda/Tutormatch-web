import React from "react";
import { Bell, User } from "lucide-react";

    interface ClassroomNavbarProps {}

    const ClassroomNavbar: React.FC<ClassroomNavbarProps> = () => (
        <header className="bg-dark-light px-6 py-4 flex items-center justify-between">
            <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => window.location.assign("/classroom")}
            >
                <h1 className="text-xl font-bold text-light">TutorMatch</h1>
                <span className="bg-primary text-light text-sm px-2 py-1 rounded">Classroom</span>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Bell className="w-6 h-6 text-light-gray" />
                    <span className="absolute -top-1 -right-1 bg-primary text-xs w-5 h-5 rounded-full flex items-center justify-center">1</span>
                </div>
                <div className="w-8 h-8 bg-dark-border rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-light-gray" />
                </div>
            </div>
        </header>
    );

    export default ClassroomNavbar;