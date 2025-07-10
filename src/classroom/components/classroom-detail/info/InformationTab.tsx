import React from 'react';

interface InformationTabProps {
  courseInfo: {
    description: string;
    startDate: string;
    endDate: string;
    sessions: string;
    type: string;
    tutorBio: string;
    studentName: string;
    studentBio: string;
  };
  syllabus: string[];
}

const InformationTab: React.FC<InformationTabProps> = ({ courseInfo, syllabus }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Course Information */}
    <div className="space-y-6">
      <div className="bg-dark-card rounded-lg p-6">
        <h3 className="text-light text-lg font-semibold mb-4">Información de la Tutoría</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-light font-medium mb-2">Complejidad Algorítmica: Asesorías</h4>
            <p className="text-light-gray text-sm leading-relaxed">{courseInfo.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-light-gray mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Fecha de inicio</span>
              </div>
              <p className="text-light font-medium">{courseInfo.startDate}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-light-gray mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Fecha de finalización</span>
              </div>
              <p className="text-light font-medium">{courseInfo.endDate}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-light-gray mb-1">
                <span className="text-sm">Sesiones</span>
              </div>
              <p className="text-light font-medium">{courseInfo.sessions}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-light-gray mb-1">
                <span className="text-sm">Tipo de tutoría</span>
              </div>
              <p className="text-light font-medium">{courseInfo.type}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Syllabus */}
      <div className="bg-dark-card rounded-lg p-6">
        <h3 className="text-light text-lg font-semibold mb-4">Temario de la Tutoría</h3>
        <div className="space-y-2">
          {syllabus.map((topic, index) => (
            <div key={index} className="flex items-center space-x-3 text-light-gray">
              <span className="text-primary font-medium">{index + 1}</span>
              <span className="text-sm">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* People Information */}
    <div className="space-y-6">
      {/* Tutor */}
      <div className="bg-dark-card rounded-lg p-6">
        <h3 className="text-light text-lg font-semibold mb-4">Tutor</h3>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center text-dark text-xl font-bold">
            CD
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-light font-semibold">Carlos Domínguez</h4>
              <span className="bg-primary text-light text-xs px-2 py-1 rounded">Tutor</span>
            </div>
            <p className="text-light-gray text-sm leading-relaxed">{courseInfo.tutorBio}</p>
          </div>
        </div>
      </div>
      {/* Student */}
      <div className="bg-dark-card rounded-lg p-6">
        <h3 className="text-light text-lg font-semibold mb-4">Estudiante</h3>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center text-dark text-xl font-bold">
            MG
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-light font-semibold">{courseInfo.studentName}</h4>
              <span className="bg-blue-500 text-light text-xs px-2 py-1 rounded">Estudiante</span>
            </div>
            <p className="text-light-gray text-sm leading-relaxed">{courseInfo.studentBio}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InformationTab;
