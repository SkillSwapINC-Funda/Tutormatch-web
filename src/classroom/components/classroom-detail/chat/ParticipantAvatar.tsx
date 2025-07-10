import React from 'react';

interface ParticipantProps {
  name: string;
  role: string;
  initials: string;
}

const ParticipantAvatar: React.FC<ParticipantProps> = ({ role, initials }) => (
  <div className="relative">
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-light text-sm font-medium">
      {initials}
    </div>
    {role === 'Tutor' && (
      <span className="absolute -bottom-1 -right-1 bg-primary text-light text-xs px-1 rounded">Tutor</span>
    )}
  </div>
);

export default ParticipantAvatar;
