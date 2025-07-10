import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useAuth } from '../../public/hooks/useAuth';
import DashboardLayout from '../../dashboard/components/DashboardLayout';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

// Tipos de solicitud de soporte
const supportTypes = [
    { label: 'Problema técnico', value: 'technical' },
    { label: 'Consulta sobre tutoría', value: 'tutoring' },
    { label: 'Reclamo o queja', value: 'complaint' },
    { label: 'Sugerencia', value: 'suggestion' },
    { label: 'Otro', value: 'other' }
];

// Correo de soporte
const SUPPORT_EMAIL = "rlopezhuaman321@gmail.com";

const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useRef<any>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        supportType: null as any,
        message: ''
    });

    useEffect(() => {
        if (user) {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            setFormData(prev => ({
                ...prev,
                name: fullName,
                email: user.email || ''
            }));
        }
    }, [user]);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [method,] = useState<'formspree' | 'mailto'>('mailto'); // 'formspree' o 'mailto'

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupportTypeChange = (e: { value: any }) => {
        setFormData(prev => ({ ...prev, supportType: e.value }));
    };

    // Método 1: Usando FormSubmit (no requiere registro)
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.subject || !formData.supportType || !formData.message) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos',
                life: 3000
            });
            return;
        }

        setSubmitting(true);

        try {
            if (method === 'formspree') {
                // Usando FormSubmit.co (no requiere registro)
                const form = formRef.current;
                if (form) {
                    form.action = `https://formsubmit.co/${SUPPORT_EMAIL}`;
                    form.method = "POST";

                    // Crear campos ocultos para información adicional
                    const hiddenType = document.createElement("input");
                    hiddenType.type = "hidden";
                    hiddenType.name = "_tipo_consulta";
                    hiddenType.value = formData.supportType?.label || '';

                    // Agregar campos al formulario
                    form.appendChild(hiddenType);

                    // Configuración para formsubmit
                    const redirect = document.createElement("input");
                    redirect.type = "hidden";
                    redirect.name = "_next";
                    redirect.value = window.location.origin + "/dashboard";

                    const subject = document.createElement("input");
                    subject.type = "hidden";
                    subject.name = "_subject";
                    subject.value = `Soporte TutorMatch: ${formData.subject}`;

                    form.appendChild(redirect);
                    form.appendChild(subject);

                    // Enviar el formulario
                    form.submit();
                }
            } else {
                // Usando mailto: (abre el cliente de correo del usuario)
                openMailClient();

                // Simulamos espera para mostrar el mensaje de éxito
                await new Promise(resolve => setTimeout(resolve, 1500));

                toast.current.show({
                    severity: 'success',
                    summary: 'Correo preparado',
                    detail: 'Se ha abierto tu cliente de correo con los datos del formulario.',
                    life: 5000
                });

                setSuccess(true);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.',
                life: 3000
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Función para abrir el cliente de correo del usuario
    const openMailClient = () => {
        const supportTypeText = formData.supportType?.label || 'No especificado';

        const subject = encodeURIComponent(`Soporte TutorMatch: ${formData.subject}`);
        const body = encodeURIComponent(`
Nombre: ${formData.name}
Correo: ${formData.email}
Tipo de consulta: ${supportTypeText}

${formData.message}

--
Enviado desde el formulario de soporte de TutorMatch
    `);

        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    };

    // Manejar el envío directo a través de mailto
    const handleDirectEmailSend = () => {
        openMailClient();
    };

    // Si el formulario se envió con éxito
    if (success) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto p-6 bg-dark-card rounded-lg border border-dark-border">
                    <div className="text-center mb-6">
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                        <h2 className="text-2xl text-white font-semibold mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-light-gray">
                            Hemos preparado tu solicitud de soporte.
                            {method === 'mailto'
                                ? 'Se ha abierto tu cliente de correo para que puedas enviar el mensaje directamente.'
                                : 'Tu mensaje ha sido enviado a nuestro equipo de soporte.'}
                        </p>
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button
                            label="Volver al Inicio"
                            className="bg-primary text-white"
                            onClick={() => navigate('/dashboard')}
                        />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Toast ref={toast} />
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Centro de Soporte</h1>
                    <p className="text-light-gray mt-2">
                        Estamos aquí para ayudarte. Completa el formulario a continuación y nuestro equipo te responderá lo antes posible.
                    </p>
                </div>

                <div className="bg-dark-card rounded-lg border border-dark-border p-6">
                    <div className="flex items-center mb-6">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
                            <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Formulario de Soporte</h2>
                            <p className="text-light-gray text-sm">
                                Cuéntanos en qué podemos ayudarte
                            </p>
                        </div>
                    </div>

                    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Campos ocultos para FormSubmit */}
                        <input type="hidden" name="name" value={formData.name} />
                        <input type="hidden" name="email" value={formData.email} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre - Autocompletado y deshabilitado */}
                            <div>
                                <label htmlFor="name" className="block text-light-gray mb-2">Nombre completo <span className="text-red-500">*</span></label>
                                <InputText
                                    id="name"
                                    value={formData.name}
                                    className="w-full h-12 bg-dark border border-dark-border text-white p-2 rounded-md opacity-80 cursor-not-allowed"
                                    placeholder="Tu nombre"
                                    readOnly
                                    disabled
                                />
                            </div>

                            {/* Email - Autocompletado y deshabilitado */}
                            <div>
                                <label htmlFor="email" className="block text-light-gray mb-2">Correo electrónico <span className="text-red-500">*</span></label>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    className="w-full h-12 bg-dark border border-dark-border text-white p-2 rounded-md opacity-80 cursor-not-allowed"
                                    placeholder="ejemplo@correo.com"
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Asunto */}
                            <div>
                                <label htmlFor="subject" className="block text-light-gray mb-2">Asunto <span className="text-red-500">*</span></label>
                                <InputText
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full h-12 bg-dark border border-dark-border text-white p-2 rounded-md"
                                    placeholder="Asunto de tu consulta"
                                    required
                                />
                            </div>

                            {/* Tipo de soporte */}
                            <div>
                                <label htmlFor="supportType" className="block text-light-gray mb-2">Tipo de consulta <span className="text-red-500">*</span></label>
                                <Dropdown
                                    id="supportType"
                                    value={formData.supportType}
                                    options={supportTypes}
                                    onChange={handleSupportTypeChange}
                                    placeholder="Selecciona una opción"
                                    className="w-full h-12 bg-dark border border-dark-border text-white rounded-md"
                                    style={{ height: '3rem' }} // Asegurar altura consistente
                                    panelClassName="bg-dark text-white border border-dark-border"
                                />
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label htmlFor="message" className="block text-light-gray mb-2">Mensaje <span className="text-red-500">*</span></label>
                            <InputTextarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="w-full bg-dark border border-dark-border text-white p-2 rounded-md"
                                placeholder="Describe tu problema o consulta en detalle"
                                required
                            />
                        </div>

                        {/* Sección de Libro de Reclamaciones */}
                        <div className="p-4 border border-yellow-600 border-opacity-30 rounded-lg bg-yellow-500 bg-opacity-5">
                            <h3 className="text-yellow-500 font-medium mb-2 flex items-center">
                                <AlertCircle className="mr-2" size={18} />
                                Libro de Reclamaciones
                            </h3>
                            <p className="text-light-gray text-sm">
                                Este formulario también funciona como Libro de Reclamaciones virtual. Si deseas presentar una queja o reclamo formal,
                                selecciona "Reclamo o queja" en el tipo de consulta y proporciona todos los detalles necesarios. Tu reclamo será
                                procesado de acuerdo a la normativa vigente en un plazo no mayor a 30 días hábiles.
                            </p>
                        </div>

                        {/* Botones de envío */}
                        <div className="flex justify-end gap-4">
                            {/* Botón para enviar usando cliente de correo */}
                            <Button
                                type="button"
                                label="Usar cliente de correo"
                                icon="pi pi-envelope"
                                className="bg-secondary text-white px-4 py-2"
                                onClick={handleDirectEmailSend}
                                disabled={submitting || !formData.subject || !formData.message}
                            />
                        </div>
                    </form>
                </div>

                {/* Información adicional de contacto */}
                <div className="mt-8 bg-dark-card rounded-lg border border-dark-border p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Otros canales de atención</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-primary font-medium mb-2">Correo electrónico</h3>
                            <p className="text-light-gray">rlopezhuaman321@gmail.com</p>
                        </div>
                        <div>
                            <h3 className="text-primary font-medium mb-2">Horario de atención</h3>
                            <p className="text-light-gray">Lunes a Viernes: 9:00 am - 6:00 pm</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SupportPage;