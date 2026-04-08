import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Event, Registration } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Trophy, Users, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function Dashboard() {
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<(Registration & { event?: Event })[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<(Registration & { event?: Event })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // My Created Events
    const eventsQuery = query(collection(db, 'events'), where('organizerId', '==', uid));
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setMyEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Event)));
    });

    // My Registrations (as participant)
    const regQuery = query(collection(db, 'registrations'), where('participantId', '==', uid));
    const unsubRegs = onSnapshot(regQuery, async (snap) => {
      const regs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Registration));
      setMyRegistrations(regs);
    });

    // Pending Registrations for my events (as organizer)
    const pendingRegQuery = query(collection(db, 'registrations'), where('organizerId', '==', uid));
    const unsubPendingRegs = onSnapshot(pendingRegQuery, (snap) => {
      const regs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Registration));
      setPendingRegistrations(regs);
    });

    setLoading(false);
    return () => {
      unsubEvents();
      unsubRegs();
      unsubPendingRegs();
    };
  }, []);

  const handleUpdateStatus = async (regId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'registrations', regId), { status });
      toast.success(`Inscrição ${status === 'approved' ? 'aprovada' : 'rejeitada'}!`);
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const myEventIds = myEvents.map(e => e.id);
  const registrationsToManage = pendingRegistrations.filter(r => myEventIds.includes(r.eventId));

  return (
    <div className="py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu Painel</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e inscrições em um só lugar.</p>
        </div>
      </div>

      <Tabs defaultValue="organizer" className="space-y-6">
        <TabsList className="bg-white p-1 border">
          <TabsTrigger value="organizer" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Como Organizador
          </TabsTrigger>
          <TabsTrigger value="participant" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Minhas Inscrições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizer" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-orange-50 border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600 uppercase">Meus Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{myEvents.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 uppercase">Total de Inscritos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{registrationsToManage.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600 uppercase">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {registrationsToManage.filter(r => r.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Inscrições</CardTitle>
              <CardDescription>Valide os pagamentos e aprove os participantes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participante</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationsToManage.length > 0 ? (
                      registrationsToManage.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">
                            {reg.participantData['Nome Completo'] || 'Participante'}
                          </TableCell>
                          <TableCell>
                            {myEvents.find(e => e.id === reg.eventId)?.title || reg.eventId}
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(new Date(reg.createdAt), "dd/MM/yy HH:mm")}
                          </TableCell>
                          <TableCell>
                            {reg.paymentProofUrl ? (
                              <a href={reg.paymentProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                                <ExternalLink className="w-3 h-3" /> Ver Comprovante
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sem comprovante</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {reg.status === 'pending' && <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>}
                            {reg.status === 'approved' && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Aprovado</Badge>}
                            {reg.status === 'rejected' && <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {reg.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(reg.id, 'approved')}>Aprovar</Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(reg.id, 'rejected')}>Recusar</Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          Nenhuma inscrição pendente.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participant" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRegistrations.length > 0 ? (
              myRegistrations.map((reg) => (
                <Card key={reg.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg">Inscrição #{reg.id.slice(-4)}</CardTitle>
                    <CardDescription>Evento ID: {reg.eventId}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      {reg.status === 'pending' && <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">Pendente</Badge>}
                      {reg.status === 'approved' && <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Aprovado</Badge>}
                      {reg.status === 'rejected' && <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Rejeitado</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Realizada em: {format(new Date(reg.createdAt), "PPP", { locale: ptBR })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl">
                <p className="text-muted-foreground">Você ainda não se inscreveu em nenhum evento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
