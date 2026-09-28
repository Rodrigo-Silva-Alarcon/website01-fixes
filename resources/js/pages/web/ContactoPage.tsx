import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "./layouts/Layout";
import Seo from "@/components/Seo";

function formatWhatsapp(raw?: string): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("591") && digits.length >= 11) {
    const local = digits.slice(3, 11);
    return `+591 ${local.slice(0, 4)} ${local.slice(4)}`;
  }
  if (digits.startsWith("591")) {
    const local = digits.slice(3);
    return `+591 ${local}`;
  }
  return `+${digits}`;
}

export default function ContactoPage() {
  const { cmsTexts } = usePage<{ cmsTexts?: Record<string, string> }>().props;
  const texts = cmsTexts ?? {};
  const contactEmail = texts.footer_email || "contacto@smarthouse.com.bo";
  const contactWhatsapp = formatWhatsapp(texts.footer_whatsapp);
  const contactAddress = texts.footer_address || "La Paz, Bolivia";

  const { data: formData, setData, post, processing, errors, recentlySuccessful } = useForm({
    name: "", email: "", phone: "", company: "", message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/enviar', {
      preserveScroll: true,
      onSuccess: () => {
        setData({ name: "", email: "", phone: "", company: "", message: "" });
        toast.success('El mensaje fue enviado exitosamente.');
      },
      onError: () => {
        toast.error('Revisa los campos del formulario e inténtalo de nuevo.');
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData(e.target.name as keyof typeof formData, e.target.value);
  };

  return (
    <Layout>
      <Seo
        title="Contáctanos"
        description="¿Tienes dudas o necesitas ayuda? Contáctanos y te responderemos pronto. Estamos aquí para ayudarte."
      />
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="mb-6">Contáctanos</h1>
              <p className="text-xl opacity-90">
                Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="mb-8">Información de Contacto</h2>
                
                <div className="flex gap-4">
                  <div className="bg-[#c2410c] text-white size-12 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-1">Email</h3>
                    <p className="text-gray-600">{contactEmail}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#c2410c] text-white size-12 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-1">WhatsApp</h3>
                    {contactWhatsapp ? (
                      <p className="text-gray-600">{contactWhatsapp}</p>
                    ) : (
                      <p className="text-gray-600">&mdash;</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-[#c2410c] text-white size-12 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <h3 className="mb-1">Dirección</h3>
                    <p className="text-gray-600">{contactAddress}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="mb-3">Horario de Atención</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                    <p>Sábado: 10:00 AM - 4:00 PM</p>
                    <p>Domingo: Cerrado</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h2 className="mb-6">Envíanos un Mensaje</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {recentlySuccessful && <p role="status">El mensaje fue enviado exitosamente.</p>}
                    {Object.values(errors).map((error, index) => <p role="alert" key={index} className="text-red-600">{error}</p>)}
                    <div>
                      <label htmlFor="name" className="block mb-2 text-gray-700">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block mb-2 text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        placeholder="Tu teléfono"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block mb-2 text-gray-700">
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c] resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-[#c2410c] text-white px-6 py-3 rounded-lg hover:bg-[#9a3412] transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="size-5" />
                      Enviar Mensaje
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </Layout>
  );
}
