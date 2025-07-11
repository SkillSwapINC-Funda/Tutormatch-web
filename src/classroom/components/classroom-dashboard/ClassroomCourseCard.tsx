import { MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassroomCourseCardProps {
  id: string;
  title: string;
  tutorName: string;
  chatNotifications: number;
  materialsNotifications: number;
  imageUrl?: string | null;
}

const ClassroomCourseCard = ({
  id,
  title,
  tutorName,
  chatNotifications,
  materialsNotifications,
  imageUrl
}: ClassroomCourseCardProps) => {
  const navigate = useNavigate();
  const handleEnterClassroom = () => {
    navigate(`/classroom/details/${id}`);
  };
  return (
    <div className="bg-dark-card rounded-lg overflow-hidden hover:bg-dark-light transition-colors">
      {/* Course Content Area */}
      <div className="bg-light-gray h-40 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center rounded-t-lg"
            style={{ maxHeight: '160px' }}
          />
        ) : (
          <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-light-gray" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="px-4 py-4">
        {/* Status Badge */}

        <h3 className="text-lg font-semibold mb-2 text-light leading-tight">
          {title}
        </h3>
        <p className="text-light-gray text-sm mb-1">
          Tutor: {tutorName}
        </p>
        {/* Enter Classroom Button */}
        <button
          className="w-full bg-primary hover:bg-primary-hover text-light font-medium py-3 px-4 rounded-lg transition-colors mb-4"
          onClick={handleEnterClassroom}
        >
          Entrar al Classroom
        </button>

        {/* Chat and Materials */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 text-light-gray">
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {chatNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {chatNotifications}
                </span>
              )}
            </div>
            <span className="text-sm">Chat</span>
          </div>
          <div className="flex items-center space-x-2 text-light-gray">
            <div className="relative">
              <FileText className="w-5 h-5" />
              {materialsNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {materialsNotifications}
                </span>
              )}
            </div>
            <span className="text-sm">Materiales</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomCourseCard;
