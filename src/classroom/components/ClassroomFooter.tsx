import React from "react";

    const ClassroomFooter: React.FC = () => (
        <footer className="bg-primary text-light text-center py-4">
            <div className="flex items-center justify-center space-x-2">
                <span className="font-bold">TutorMatch</span>
                <span className="bg-secondary px-2 py-1 rounded text-sm">Classroom</span>
            </div>
            <p className="text-sm mt-2 opacity-90">© 2025 TutorMatch. Todos los derechos reservados.</p>
        </footer>
    );

    export default ClassroomFooter;