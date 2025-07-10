import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface TermsModalProps {
    visible: boolean;
    onHide: () => void;
    onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onHide, onAccept }) => {
    const headerElement = (
        <div className="w-full flex justify-between items-center text-white">
            <h2 className="text-xl font-semibold">Términos y Condiciones</h2>
        </div>
    );
    return (
        <Dialog
            header={headerElement}
            footer={false}
            draggable={false}
            resizable={false}
            closable={false}
            visible={visible}
            style={{ width: '700px', borderRadius: '8px', overflow: 'hidden' }}
            modal
            onHide={onHide}
            contentClassName="p-0"
            headerClassName="bg-dark px-4 py-3 border-b border-dark-border"
            className="bg-dark-card shadow-xl"
            breakpoints={{ '960px': '80vw', '640px': '90vw' }}
        >
            <div className="flex flex-col p-5 bg-[#1e1f1e]">
                <div className="flex items-center mb-5">
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-full mr-4">
                        <i className="pi pi-file-edit text-secondary text-2xl"></i>
                    </div>
                    <h2 className="text-xl font-bold text-white">Resumen Ejecutivo - TutorMatch</h2>
                </div>

                <div className="bg-dark p-4 rounded mb-4 border border-dark-border h-80 overflow-y-auto">
                    <h3 className="text-white font-medium text-lg mb-3">Qué es TutorMatch</h3>
                    <p className="text-light-gray mb-4">
                        TutorMatch conecta estudiantes de UPC con tutores calificados. Al usar nuestra plataforma, 
                        aceptas estos términos de uso.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Registro de Usuarios</h3>
                    <p className="text-light-gray mb-4">
                        • Debes ser estudiante de UPC<br/>
                        • Proporciona información veraz<br/>
                        • Mantén tu cuenta segura<br/>
                        • Si eres menor de edad, necesitas autorización de tus padres
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Membresía de Tutores</h3>
                    <p className="text-light-gray mb-4">
                        • Los tutores pagan una membresía única para acceder a la plataforma<br/>
                        • Pago solo por Yape o Plin<br/>
                        • Reembolso en 1-2 horas si hay errores en el pago<br/>
                        • Un administrador revisa y aprueba cada membresía
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Servicios y Pagos</h3>
                    <p className="text-light-gray mb-4">
                        • TutorMatch solo conecta tutores y estudiantes<br/>
                        • Los acuerdos de pago son directamente entre tutor y estudiante<br/>
                        • No procesamos pagos de tutorías<br/>
                        • Los tutores definen sus horarios y tarifas
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Reglas de Conducta</h3>
                    <p className="text-light-gray mb-4">
                        • Comportamiento respetuoso y profesional<br/>
                        • No actividades ilegales o fraudulentas<br/>
                        • No acoso ni discriminación<br/>
                        • No contenido inapropiado
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Responsabilidades</h3>
                    <p className="text-light-gray mb-4">
                        • TutorMatch no garantiza resultados académicos<br/>
                        • No somos responsables de transacciones entre usuarios<br/>
                        • Los tutores son responsables de la calidad de sus clases<br/>
                        • Protegemos tus datos según nuestra política de privacidad
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Comunicación</h3>
                    <p className="text-light-gray mb-4">
                        Facilitamos el contacto inicial. Después pueden comunicarse por email o WhatsApp 
                        de manera profesional.
                    </p>

                    <h3 className="text-white font-medium text-lg mb-3">Cambios y Terminación</h3>
                    <p className="text-light-gray mb-4">
                        • Podemos actualizar estos términos (te avisaremos)<br/>
                        • Puedes cancelar tu cuenta cuando quieras<br/>
                        • Podemos suspender cuentas que violen las reglas<br/>
                        • Rigen las leyes de Perú
                    </p>
                </div>

                <div className="bg-dark p-3 rounded border border-secondary border-opacity-30 mb-4">
                    <div className="flex items-center">
                        <i className="pi pi-info-circle text-secondary mr-2"></i>
                        <p className="text-light-gray text-sm">Al aceptar, confirmas que entiendes estos términos. Tiempo estimado de lectura: 2-3 minutos.</p>
                    </div>
                </div>

                <div className="flex justify-end bg-[#1e1f1e] gap-2">
                    <Button
                        label="Aceptar"
                        icon="pi pi-check"
                        onClick={onAccept}
                        className="bg-secondary hover:bg-primary-hover text-white border-none transition-colors duration-200 shadow-md"
                        style={{ fontWeight: 500 }}
                    />
                    <Button
                        label="Cancelar"
                        icon="pi pi-times"
                        onClick={onHide}
                        className="p-button-text hover:bg-dark-light text-light-gray"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default TermsModal;