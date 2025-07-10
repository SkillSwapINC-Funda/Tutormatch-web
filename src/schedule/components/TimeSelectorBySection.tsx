import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface TimeSlotSelectorBySectionProps {
  days: string[];
  initialSelectedSlots?: { [day: string]: { [timeSlot: string]: boolean } };
  onChange: (selectedSlots: { [day: string]: { [timeSlot: string]: boolean } }) => void;
}

const TimeSlotSelectorBySection: React.FC<TimeSlotSelectorBySectionProps> = ({
  days,
  initialSelectedSlots,
  onChange
}) => {
  // Define los rangos de horas para cada sección del día
  const morningTimeSlots = ['08-09', '09-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  
  const [selectedTab, setSelectedTab] = useState<string>('morning');
  const [selectedSlots, setSelectedSlots] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>(
    initialSelectedSlots || {}
  );

  useEffect(() => {
    if (!initialSelectedSlots) {
      const initialSlots: { [day: string]: { [timeSlot: string]: boolean } } = {};
      for (let day of days) {
        initialSlots[day] = {};
        for (let timeSlot of [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots]) {
          initialSlots[day][timeSlot] = false;
        }
      }
      setSelectedSlots(initialSlots);
    }
  }, [days, initialSelectedSlots]);

  useEffect(() => {
    onChange(selectedSlots);
  }, [selectedSlots, onChange]);

  const toggleSlot = (day: string, timeSlot: string): void => {
    setSelectedSlots(prev => {
      const newSlots = { ...prev };
      if (!newSlots[day]) newSlots[day] = {};
      newSlots[day][timeSlot] = !newSlots[day][timeSlot];
      return newSlots;
    });
  };

  const isSelected = (day: string, timeSlot: string): boolean => {
    return !!selectedSlots[day]?.[timeSlot];
  };
  
  const renderTimeGrid = (timeSlots: string[]) => {
    return (
      <div className="grid grid-cols-8 gap-2">
        <div className="col-span-1"></div>
        {days.map(day => (
          <div key={day} className="col-span-1 text-center font-semibold text-sm uppercase text-gray-300">
            {day}
          </div>
        ))}

        {timeSlots.map(time => (
          <React.Fragment key={`row-${time}`}>
            <div className="col-span-1 flex items-center text-sm text-gray-400 font-medium">
              {time}
            </div>
            {days.map(day => {
              const selected = isSelected(day, time);
              return (
                <div key={`${day}-${time}`} className="col-span-1">
                  <button
                    className={`w-full h-10 flex items-center justify-center rounded-md border transition-all duration-200
                      ${selected
                        ? 'bg-green-600 border-green-700 text-white hover:bg-green-700' 
                        : 'bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                      }`}
                    onClick={() => toggleSlot(day, time)}
                  >
                    {selected && <Check size={16} />}
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#1f1f1f] text-white p-4">
      {/* Tabs de navegación */}
      <div className="flex justify-center border-b border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
            selectedTab === 'morning' 
              ? 'border-b-2 border-red-500 text-red-500' // Bordes y texto rojo para el tab seleccionado
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setSelectedTab('morning')}
        >
          Mañana (08h-12h)
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
            selectedTab === 'afternoon' 
              ? 'border-b-2 border-red-500 text-red-500' // Bordes y texto rojo para el tab seleccionado
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setSelectedTab('afternoon')}
        >
          Tarde (13h-17h)
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
            selectedTab === 'evening' 
              ? 'border-b-2 border-red-500 text-red-500' // Bordes y texto rojo para el tab seleccionado
              : 'text-gray-400 hover:text-gray-200'
          }`}
          onClick={() => setSelectedTab('evening')}
        >
          Noche (18h-22h)
        </button>
      </div>
    
      {/* Contenido según el tab seleccionado */}
      <div className="mt-2">
        {selectedTab === 'morning' && renderTimeGrid(morningTimeSlots)}
        {selectedTab === 'afternoon' && renderTimeGrid(afternoonTimeSlots)}
        {selectedTab === 'evening' && renderTimeGrid(eveningTimeSlots)}
      </div>
    </div>
  );
};

export default TimeSlotSelectorBySection;