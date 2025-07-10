import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Mail, MessageCircle, User2 } from 'lucide-react';
import { User } from '../../user/types/User';

interface ContactTutorModalProps {
  visible: boolean;
  onHide: () => void;
  tutor: User | undefined;
}

const ContactTutorModal: React.FC<ContactTutorModalProps> = ({
  visible,
  onHide,
  tutor
}) => {
  if (!tutor) return null;

  const handleEmailContact = () => {
    window.open(`mailto:${tutor.email}?subject=Consulta sobre tutoría&body=Hola ${tutor.firstName}, me interesa tu tutoría...`, '_blank');
    onHide();
  };

  const customStyles = `
    .p-dialog .p-dialog-header {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      border-bottom: 1px solid #374151;
      border-radius: 16px 16px 0 0;
      padding: 1.5rem;
    }
    
    .p-dialog .p-dialog-content {
      background: #1f2937;
      border-radius: 0 0 16px 16px;
      padding: 0;
    }
    
    .p-dialog {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border: 1px solid #374151;
    }
    
    .contact-button {
      background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      border: 1px solid #2563EB;
      transform: translateY(0);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .contact-button:hover {
      background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1);
    }
    
    .contact-button:active {
      transform: translateY(0);
    }
  `;

  const headerElement = (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Contactar tutor</h2>
          <p className="text-sm text-gray-300">Inicia una conversación</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{customStyles}</style>
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: '95%', maxWidth: '480px' }}
        modal
        header={headerElement}
        footer={false}
        className="border-none shadow-xl"
        draggable={false}
        resizable={false}
        closable={false}
        contentClassName="bg-[#1f2937] text-white"
      >
        <div className="p-6 space-y-6">
          {/* Información del tutor */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{tutor.firstName} {tutor.lastName}</h3>
                <p className="text-sm text-gray-300">Tutor especializado</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2 text-white">¿Cómo deseas contactar a {tutor.firstName}?</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Selecciona tu método preferido para iniciar la comunicación y resolver tus dudas.
            </p>
          </div>

          {/* Opciones de contacto */}
          <div className="space-y-3">
            <button
              onClick={handleEmailContact}
              className="contact-button w-full p-4 rounded-xl flex items-center space-x-4 text-white font-medium"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Correo electrónico</div>
                <div className="text-sm text-blue-100 truncate">{tutor.email}</div>
              </div>
              <div className="text-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Footer con botones de acción */}
          <div className="flex justify-center pt-4 border-t border-gray-700">
            <Button
              label="Cancelar"
              className="p-button-text text-gray-400 hover:text-white px-6 py-2 rounded-lg transition-colors"
              onClick={onHide}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ContactTutorModal;