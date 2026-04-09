import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { Event, Registration } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Calendar, MapPin, Wallet, Info, CheckCircle2, QrCode, Building2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { EventAssistant } from '../components/EventAssistant';

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<Record<string, any>>({});
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const start = new Date(event.registrationStartDate);
    const end = new Date(event.registrationEndDate);
    return now >= start && now <= end;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Você precisa estar logado para se inscrever.");
      return;
    }

    if (!isRegistrationOpen()) {
      toast.error("As inscrições para este evento não estão abertas no momento.");
      return;
    }
    
    if (event?.price && event.price > 0 && !showPayment) {
      setShowPayment(true);
      return;
    }

    setSubmitting(true);
    try {
      const registration: Omit<Registration, 'id'> = {
        eventId: id!,
        participantId: auth.currentUser.uid,
        organizerId: event.organizerId,
        participantData: registrationData,
        paymentProofUrl: paymentProofUrl || undefined,
        status: event.price === 0 ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'registrations'), registration);
      toast.success("Inscrição realizada com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Erro ao realizar inscrição.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Carregando...</div>;
  if (!event) return <div className="py-20 text-center">Evento não encontrado.</div>;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(event.location)}`;
  const simpleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const finalMapUrl = apiKey ? googleMapsUrl : simpleMapsUrl;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      {/* Banner */}
      <div className="relative h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={event.bannerUrl || `https://picsum.photos/seed/${event.id}/1200/600`} 
          alt={event.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
          <div className="text-white space-y-2">
            <Badge className="bg-orange-500 mb-2">Esportes</Badge>
            <h1 className="text-3xl md:text-5xl font-black">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm md:text-base opacity-90">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(event.startDate), "PPP p", { locale: ptBR })}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Info className="w-5 h-5" />
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Início do Evento</p>
                  <p className="font-medium">{format(new Date(event.startDate), "PPP p", { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Término do Evento</p>
                  <p className="font-medium">{format(new Date(event.endDate), "PPP p", { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Início das Inscrições</p>
                  <p className="font-medium">{format(new Date(event.registrationStartDate), "PPP p", { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fim das Inscrições</p>
                  <p className="font-medium">{format(new Date(event.registrationEndDate), "PPP p", { locale: ptBR })}</p>
                </div>
              </div>

              <div className="prose prose-orange max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Sponsors Section */}
              {event.sponsors && event.sponsors.length > 0 && (
                <div className="pt-8 border-t space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    Patrocinadores e Parceiros
                  </h3>
                  <div className="flex flex-wrap gap-8 items-center justify-center md:justify-start">
                    {event.sponsors.map((sponsor) => (
                      <div key={sponsor.id} className="flex flex-col items-center gap-2 group">
                        <div className="w-24 h-24 p-2 bg-white rounded-2xl shadow-sm border group-hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden">
                          {sponsor.logoUrl ? (
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{sponsor.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <CheckCircle2 className="w-5 h-5" />
                Inscrição Online
              </CardTitle>
              {!isRegistrationOpen() && (
                <Badge variant="destructive" className="mt-2">Inscrições Encerradas ou Não Iniciadas</Badge>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {!showPayment ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.registrationFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                        {field.type === 'select' ? (
                          <select
                            id={field.id}
                            required={field.required}
                            disabled={!isRegistrationOpen()}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => setRegistrationData({ ...registrationData, [field.label]: e.target.value })}
                          >
                            <option value="">Selecione uma opção</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <Input 
                            id={field.id}
                            type={field.type}
                            required={field.required}
                            disabled={!isRegistrationOpen()}
                            placeholder={`Digite seu ${field.label.toLowerCase()}`}
                            onChange={(e) => setRegistrationData({ ...registrationData, [field.label]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex flex-col items-center text-center space-y-4">
                      <div className="bg-white p-4 rounded-xl shadow-sm">
                        <QRCodeSVG value={`pix:${event.pixKey}?amount=${event.price}`} size={200} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg">Valor: R$ {event.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Escaneie o QR Code ou use a chave PIX abaixo</p>
                      </div>
                      <div className="w-full max-w-xs">
                        <Label className="text-xs uppercase text-orange-600 font-bold">Chave PIX</Label>
                        <div className="flex gap-2 mt-1">
                          <Input readOnly value={event.pixKey} className="bg-white" />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              navigator.clipboard.writeText(event.pixKey);
                              toast.success("Chave PIX copiada!");
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proof">Anexar Comprovante (Imagem ou PDF)</Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group" onClick={() => document.getElementById('proof-upload')?.click()}>
                        {paymentProofUrl ? (
                          <div className="text-center space-y-2">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                            <p className="text-sm font-medium text-green-700">Comprovante anexado com sucesso!</p>
                            <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPaymentProofUrl(''); }} className="text-red-500 hover:text-red-700">Remover</Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-sm font-medium">Clique para anexar o comprovante do PIX</p>
                            <p className="text-xs text-muted-foreground">Formatos suportados: JPG, PNG, PDF (Máx 2MB)</p>
                          </div>
                        )}
                        <input 
                          id="proof-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*,application/pdf" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2000000) {
                              toast.error("O arquivo é muito grande. Use um arquivo menor que 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPaymentProofUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground italic mt-2">
                        * O organizador validará sua inscrição após conferir o comprovante.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {showPayment && (
                    <Button type="button" variant="outline" onClick={() => setShowPayment(false)}>
                      Voltar
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold" 
                    disabled={submitting || !isRegistrationOpen()}
                  >
                    {submitting ? "Processando..." : showPayment ? "Confirmar Pagamento" : "Ir para o Pagamento"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-orange-600 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle>Investimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="text-4xl font-black">
                {event.price === 0 ? 'GRÁTIS' : `R$ ${event.price.toFixed(2)}`}
              </div>
              <p className="text-orange-100 text-sm">
                Inscrição segura via PIX diretamente para o organizador.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 w-full">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={finalMapUrl}
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <p className="font-medium text-sm">{event.location}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EventAssistant 
        eventName={event.title} 
        eventLocation={event.location} 
        eventDescription={event.description} 
      />
    </div>
  );
}
