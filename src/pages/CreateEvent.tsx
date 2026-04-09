import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Trash2, Save, ArrowLeft, Upload, Image as ImageIcon, Building2 } from 'lucide-react';
import { RegistrationField, Sponsor } from '../types';
import { toast } from 'sonner';
import { LocationInput } from '../components/LocationInput';

export function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<RegistrationField[]>([
    { id: '1', label: 'Nome Completo', type: 'text', required: true },
    { id: '2', label: 'Email', type: 'email', required: true },
  ]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    location: '',
    bannerUrl: '',
    pixKey: '',
    price: 0,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'sponsor', sponsorId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Firestore safety
      toast.error("A imagem é muito grande. Use uma imagem menor que 800KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'banner') {
        setFormData({ ...formData, bannerUrl: base64 });
      } else if (type === 'sponsor' && sponsorId) {
        setSponsors(sponsors.map(s => s.id === sponsorId ? { ...s, logoUrl: base64 } : s));
      }
    };
    reader.readAsDataURL(file);
  };

  const addSponsor = () => {
    const newSponsor: Sponsor = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      logoUrl: '',
    };
    setSponsors([...sponsors, newSponsor]);
  };

  const removeSponsor = (id: string) => {
    setSponsors(sponsors.filter(s => s.id !== id));
  };

  const updateSponsor = (id: string, name: string) => {
    setSponsors(sponsors.map(s => s.id === id ? { ...s, name } : s));
  };

  const addField = () => {
    const newField: RegistrationField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      type: 'text',
      required: true,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<RegistrationField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Você precisa estar logado para criar um evento.");
      return;
    }

    // Basic validation
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("A data de término do evento deve ser após a data de início.");
      return;
    }
    if (new Date(formData.registrationStartDate) >= new Date(formData.registrationEndDate)) {
      toast.error("A data de encerramento das inscrições deve ser após a data de início.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        organizerId: auth.currentUser.uid,
        registrationFields: fields,
        sponsors: sponsors,
        createdAt: new Date().toISOString(),
      });
      toast.success("Evento criado com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erro ao criar evento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
      </div>

      <Tabs defaultValue="basic" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 bg-white border h-12">
          <TabsTrigger value="basic" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Informações</TabsTrigger>
          <TabsTrigger value="form" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Formulário</TabsTrigger>
          <TabsTrigger value="sponsors" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Patrocinadores</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-8">
          <TabsContent value="basic" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Evento</Label>
                  <Input 
                    id="title" 
                    required 
                    placeholder="Ex: Maratona da Cidade"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Início do Evento</Label>
                    <Input id="startDate" type="datetime-local" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Término do Evento</Label>
                    <Input id="endDate" type="datetime-local" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="regStart">Início das Inscrições</Label>
                    <Input id="regStart" type="datetime-local" required value={formData.registrationStartDate} onChange={e => setFormData({...formData, registrationStartDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regEnd">Fim das Inscrições</Label>
                    <Input id="regEnd" type="datetime-local" required value={formData.registrationEndDate} onChange={e => setFormData({...formData, registrationEndDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização (Endereço para o Mapa)</Label>
                  <LocationInput 
                    value={formData.location} 
                    onChange={val => setFormData({...formData, location: val})} 
                    placeholder="Ex: Av. Paulista, 1000, São Paulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" required placeholder="Descreva seu evento..." className="min-h-[100px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <Label>Banner do Evento</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group" onClick={() => fileInputRef.current?.click()}>
                    {formData.bannerUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                        <img src={formData.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm font-medium">Clique para fazer upload do banner</p>
                        <p className="text-xs text-muted-foreground">Recomendado: 1200x600px (Máx 800KB)</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagamento (PIX)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave PIX</Label>
                    <Input id="pixKey" required placeholder="Chave PIX" value={formData.pixKey} onChange={e => setFormData({...formData, pixKey: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Valor (R$)</Label>
                    <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Formulário de Inscrição</CardTitle>
                  <CardDescription>Campos que o participante deve preencher.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Campo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 border-b pb-4 last:border-0">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Rótulo do Campo</Label>
                        <Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder="Ex: Tamanho da Camiseta" />
                      </div>
                      <div className="w-48 space-y-2">
                        <Label>Tipo</Label>
                        <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={field.type} onChange={e => updateField(field.id, { type: e.target.value as any })}>
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="email">Email</option>
                          <option value="tel">Telefone</option>
                          <option value="select">Múltipla Escolha (Lista)</option>
                        </select>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeField(field.id)} disabled={index < 2}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {field.type === 'select' && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                        <Label className="text-xs font-bold text-orange-600 uppercase tracking-wider">Opções de Escolha</Label>
                        <div className="space-y-2">
                          {(field.options || ['']).map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input 
                                placeholder={`Opção ${optIndex + 1}`}
                                value={option}
                                onChange={e => {
                                  const newOptions = [...(field.options || [''])];
                                  newOptions[optIndex] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const newOptions = [...(field.options || [''])];
                                    newOptions.splice(optIndex + 1, 0, '');
                                    updateField(field.id, { options: newOptions });
                                    // Focus will be handled by React re-render if we use a better key, 
                                    // but for now let's just add it.
                                  }
                                }}
                                autoFocus={optIndex === (field.options?.length || 1) - 1 && option === ''}
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  const newOptions = (field.options || ['']).filter((_, i) => i !== optIndex);
                                  updateField(field.id, { options: newOptions.length ? newOptions : [''] });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-dashed border-orange-200 text-orange-600 hover:bg-orange-50"
                            onClick={() => {
                              const newOptions = [...(field.options || ['']), ''];
                              updateField(field.id, { options: newOptions });
                            }}
                          >
                            <Plus className="w-3 h-3 mr-2" /> Adicionar Opção (ou aperte Enter)
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Patrocinadores</CardTitle>
                  <CardDescription>Adicione logotipos das empresas parceiras.</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSponsor} className="gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Patrocinador
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {sponsors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sponsors.map((sponsor) => (
                      <div key={sponsor.id} className="p-4 border rounded-2xl space-y-4 relative group">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSponsor(sponsor.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative" onClick={() => document.getElementById(`sponsor-file-${sponsor.id}`)?.click()}>
                            {sponsor.logoUrl ? (
                              <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="w-8 h-8 text-gray-300" />
                            )}
                            <input id={`sponsor-file-${sponsor.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sponsor', sponsor.id)} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Nome da Empresa</Label>
                            <Input value={sponsor.name} onChange={e => updateSponsor(sponsor.id, e.target.value)} placeholder="Ex: Nike" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <p className="text-muted-foreground">Nenhum patrocinador adicionado ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 min-w-[150px]" disabled={loading}>
              {loading ? "Salvando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

