import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Plus, Trash2, CheckCircle, ExternalLink, ArrowRight, MapPin, Lock, LogOut } from 'lucide-react';

export default function App() {
  // Controle de Rotas: 'landing' | 'barber-dashboard' | 'client-dashboard' | 'login'
  const [currentRoute, setCurrentRoute] = useState('landing');
  const [loginType, setLoginType] = useState('barber'); // 'barber' | 'client'

  // Usuários Logados no momento
  const [loggedBarber, setLoggedBarber] = useState(null);
  const [loggedClient, setLoggedClient] = useState(null);

  // Filtro de cidade na Home
  const [searchCity, setSearchCity] = useState('');

  // Estados Globais salvos no LocalStorage
  const [barbers, setBarbers] = useState(() => {
    const saved = localStorage.getItem('cb_barbers');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Carlos Barber',
        shopName: 'Barbearia Estilo Clássico',
        city: 'São Paulo',
        email: 'carlos@barber.com',
        password: '123',
        services: [
          { id: 's1', name: 'Corte Masculino', price: 45, duration: 30 },
          { id: 's2', name: 'Barba Alinhada', price: 30, duration: 25 }
        ],
        hours: { start: '09:00', end: '19:00' },
        appointments: []
      },
      {
        id: '2',
        name: 'Lucas Silva',
        shopName: 'Barber Shop Premium',
        city: 'Rio de Janeiro',
        email: 'lucas@barber.com',
        password: '123',
        services: [
          { id: 's3', name: 'Corte + Barba', price: 70, duration: 50 }
        ],
        hours: { start: '08:00', end: '18:00' },
        appointments: []
      }
    ];
  });

  // Lista global de clientes para o Login/Histórico funcionarem
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('cb_clients');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Rodrigo Souza', email: 'rodrigo@cliente.com', password: '123', phone: '(11) 99999-9999' }
    ];
  });

  // Sincronizar dados com o LocalStorage
  useEffect(() => {
    localStorage.setItem('cb_barbers', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('cb_clients', JSON.stringify(clients));
  }, [clients]);

  // --- FUNÇÕES DE CADASTRO E LOGIN ---
  const registerBarber = (name, shopName, city, email, password) => {
    const newBarber = {
      id: Date.now().toString(),
      name,
      shopName,
      city,
      email,
      password,
      services: [
        { id: '1', name: 'Corte Padrão', price: 40, duration: 30 },
        { id: '2', name: 'Barba', price: 30, duration: 20 }
      ],
      hours: { start: '09:00', end: '18:00' },
      appointments: []
    };
    setBarbers([...barbers, newBarber]);
    setLoggedBarber(newBarber);
    setCurrentRoute('barber-dashboard');
  };

  const registerClient = (name, email, password, phone) => {
    const newClient = { id: Date.now().toString(), name, email, password, phone };
    setClients([...clients, newClient]);
    setLoggedClient(newClient);
    setCurrentRoute('client-dashboard');
  };

  const handleLogin = (email, password, type) => {
    if (type === 'barber') {
      const barber = barbers.find(b => b.email === email && b.password === password);
      if (barber) {
        setLoggedBarber(barber);
        setCurrentRoute('barber-dashboard');
        return true;
      }
    } else {
      const client = clients.find(c => c.email === email && c.password === password);
      if (client) {
        setLoggedClient(client);
        setCurrentRoute('client-dashboard');
        return true;
      }
    }
    alert('Credenciais incorretas. Tente novamente ou cadastre-se.');
    return false;
  };

  const handleLogout = () => {
    setLoggedBarber(null);
    setLoggedClient(null);
    setCurrentRoute('landing');
  };

  // --- FUNÇÕES DE AGENDAMENTO ---
  const addAppointment = (barberId, service, date, time) => {
    if (!loggedClient) {
      alert('Você precisa estar logado como cliente para agendar!');
      setCurrentRoute('login');
      setLoginType('client');
      return;
    }

    const appointment = {
      id: Date.now().toString(),
      clientId: loggedClient.id,
      clientName: loggedClient.name,
      clientPhone: loggedClient.phone,
      date,
      time,
      service,
      status: 'pendente'
    };

    setBarbers(barbers.map(b => {
      if (b.id === barberId) {
        return { ...b, appointments: [...b.appointments, appointment] };
      }
      return b;
    }));

    alert('Agendamento realizado com sucesso!');
    setCurrentRoute('client-dashboard');
  };

  const updateAppointmentStatus = (barberId, appId, status) => {
    setBarbers(barbers.map(b => {
      if (b.id === barberId) {
        return {
          ...b,
          appointments: b.appointments.map(a => a.id === appId ? { ...a, status } : a)
        };
      }
      return b;
    }));
  };

  // Coleta todos os agendamentos do cliente logado varrendo todos os barbeiros
  const getClientAppointments = () => {
    if (!loggedClient) return [];
    let list = [];
    barbers.forEach(b => {
      b.appointments.forEach(app => {
        if (app.clientId === loggedClient.id) {
          list.push({ ...app, shopName: b.shopName, barberName: b.name });
        }
      });
    });
    return list;
  };

  // --- COMPONENTE: TELA DE LOGIN / CADASTRO ---
  function LoginPage() {
    const [isCadastro, setIsCadastro] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [shopName, setShopName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    const onSubmit = (e) => {
      e.preventDefault();
      if (isCadastro) {
        if (loginType === 'barber') {
          registerBarber(name, shopName, city, email, password);
        } else {
          registerClient(name, email, password, phone);
        }
      } else {
        handleLogin(email, password, loginType);
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-amber-500">Central do Barbeiro</h2>
            <p className="text-slate-400 text-sm mt-1">Acesse ou crie sua conta na plataforma</p>
          </div>

          {/* Seleção do tipo de conta */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setLoginType('barber'); setIsCadastro(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginType === 'barber' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              Sou Barbeiro
            </button>
            <button
              onClick={() => { setLoginType('client'); setIsCadastro(false); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginType === 'client' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              Sou Cliente
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {isCadastro && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
              </div>
            )}

            {isCadastro && loginType === 'barber' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Nome da Barbearia</label>
                  <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Cidade</label>
                  <input type="text" placeholder="Ex: São Paulo" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
                </div>
              </>
            )}

            {isCadastro && loginType === 'client' && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">WhatsApp / Telefone</label>
                <input type="tel" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none" required />
            </div>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all mt-2">
              {isCadastro ? 'Criar Minha Conta' : 'Entrar no Sistema'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            {isCadastro ? 'Já tem uma conta?' : 'Ainda não tem conta?'} {' '}
            <button onClick={() => setIsCadastro(!isCadastro)} className="text-amber-500 font-bold underline">
              {isCadastro ? 'Fazer Login' : 'Cadastre-se grátis'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- COMPONENTE: LANDING PAGE ---
  function LandingPage() {
    // Filtra as barbearias de acordo com a cidade digitada
    const filteredBarbers = barbers.filter(b =>
      b.city?.toLowerCase().includes(searchCity.toLowerCase())
    );

    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selService, setSelService] = useState(null);
    const [selDate, setSelDate] = useState('');
    const [selTime, setSelTime] = useState('');

    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scissors className="text-amber-500 h-6 w-6" />
              <span className="text-xl font-bold text-amber-500 tracking-wider">Central do Barbeiro</span>
            </div>
            <div className="flex gap-3">
              {loggedBarber && <button onClick={() => setCurrentRoute('barber-dashboard')} className="text-sm text-amber-500 font-bold">Meu Painel</button>}
              {loggedClient && <button onClick={() => setCurrentRoute('client-dashboard')} className="text-sm text-amber-500 font-bold">Meus Agendamentos</button>}

              {loggedBarber || loggedClient ? (
                <button onClick={handleLogout} className="bg-red-500/10 text-red-500 p-2 rounded-lg text-sm"><LogOut h-4 w-4 /></button>
              ) : (
                <button onClick={() => setCurrentRoute('login')} className="bg-amber-500 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs">Entrar / Cadastrar</button>
              )}
            </div>
          </div>
        </header>

        {/* Busca por cidade */}
        <div className="max-w-6xl mx-auto px-4 pt-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black">Encontre a barbearia ideal perto de você</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Selecione o serviço, escolha o profissional e agende seu horário em tempo real sem complicações.</p>

          <div className="max-w-md mx-auto flex items-center bg-slate-950 rounded-xl p-2 border border-slate-800 shadow-xl">
            <MapPin className="text-amber-500 ml-2" />
            <input
              type="text"
              placeholder="Filtrar por cidade (Ex: São Paulo...)"
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              className="w-full bg-transparent p-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Listagem com Agendamento Integrado */}
        <main className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Barbearias em Destaque ({filteredBarbers.length})</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredBarbers.map(b => (
                <div key={b.id} className={`p-5 bg-slate-950 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${selectedBarber?.id === b.id ? 'border-amber-500' : 'border-slate-800'}`} onClick={() => { setSelectedBarber(b); setSelService(null); }}>
                  <div>
                    <h4 className="font-bold text-lg">{b.shopName}</h4>
                    <p className="text-xs text-slate-400">Profissional: {b.name}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-amber-500 mt-2 bg-amber-500/10 px-2 py-1 rounded-md"><MapPin className="h-3 w-3" /> {b.city || 'Não Informada'}</span>
                  </div>
                  <button className="mt-4 text-xs font-bold text-left text-amber-500 flex items-center gap-1">Ver horários e agendar <ArrowRight className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Lateral Dinâmico */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
            <h3 className="font-bold text-amber-500 flex items-center gap-2"><Calendar className="h-5 w-5" /> Agendamento</h3>

            {selectedBarber ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Barbearia selecionada:</p>
                  <p className="text-sm font-bold text-white">{selectedBarber.shopName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-bold">1. Escolha o serviço:</p>
                  {selectedBarber.services.map(s => (
                    <div key={s.id} onClick={() => setSelService(s)} className={`p-3 rounded-lg border text-xs flex justify-between cursor-pointer ${selService?.id === s.id ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800'}`}>
                      <span>{s.name} ({s.duration}min)</span>
                      <span className="font-bold text-amber-500">R$ {s.price}</span>
                    </div>
                  ))}
                </div>

                {selService && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Data:</label>
                        <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Horário:</label>
                        <select value={selTime} onChange={e => setSelTime(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs">
                          <option value="">Selecione</option>
                          <option value="10:00">10:00</option>
                          <option value="11:30">11:30</option>
                          <option value="14:00">14:00</option>
                          <option value="16:30">16:30</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => addAppointment(selectedBarber.id, selService, selDate, selTime)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase"
                    >
                      Confirmar Agendamento
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">Selecione uma barbearia ao lado para abrir os horários de agendamento.</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // --- COMPONENTE: ÁREA EXCLUSIVA DO CLIENTE (HISTÓRICO) ---
  function ClientDashboard() {
    const myAppointments = getClientAppointments();

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-slate-800 bg-slate-900/50 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <span className="text-xs uppercase text-amber-500 font-bold tracking-widest">Painel do Cliente</span>
              <h1 className="text-xl font-bold">{loggedClient?.name}</h1>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={() => setCurrentRoute('landing')} className="text-xs bg-slate-800 px-3 py-2 rounded-lg">Voltar para Home</button>
              <button onClick={handleLogout} className="text-xs bg-red-500/20 text-red-400 px-3 py-2 rounded-lg flex items-center gap-1"><LogOut h-3 w-3 /> Sair</button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="text-amber-500" /> Seus Agendamentos Realizados</h2>

          {myAppointments.length === 0 ? (
            <div className="p-12 border border-slate-800 bg-slate-900/40 rounded-2xl text-center text-slate-500">
              Você ainda não realizou nenhum agendamento na plataforma.
            </div>
          ) : (
            <div className="grid gap-4">
              {myAppointments.map(app => (
                <div key={app.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center flex-wrap gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg text-white">{app.shopName}</h4>
                    <p className="text-xs text-slate-400">Profissional: {app.barberName}</p>
                    <p className="text-sm font-semibold text-amber-500 pt-1">{app.service.name} • R$ {app.service.price}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-500" /> {app.date}</p>
                      <p className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" /> {app.time}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${app.status === 'concluído' ? 'bg-green-500/10 text-green-400' :
                      app.status === 'cancelado' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- COMPONENTE: PAINEL ADMINISTRATIVO DO BARBEIRO ---
  function BarberDashboard() {
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');

    // Sincroniza dados específicos do barbeiro logado
    const currentBarberData = barbers.find(b => b.id === loggedBarber?.id) || loggedBarber;

    const handleAddService = (e) => {
      e.preventDefault();
      if (!newServiceName || !newServicePrice) return;

      setBarbers(barbers.map(b => {
        if (b.id === currentBarberData.id) {
          return {
            ...b,
            services: [...b.services, { id: Date.now().toString(), name: newServiceName, price: Number(newServicePrice), duration: 30 }]
          };
        }
        return b;
      }));
      setNewServiceName('');
      setNewServicePrice('');
    };

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Painel Administrativo</span>
              <h2 className="text-xl font-black text-white">{currentBarberData?.shopName}</h2>
              <p className="text-xs text-slate-400">{currentBarberData?.name} ({currentBarberData?.city})</p>
            </div>
            <button onClick={() => setCurrentRoute('landing')} className="w-full text-left text-xs bg-slate-950 border border-slate-800 p-3 rounded-lg hover:border-slate-600 transition-colors flex items-center gap-2"><ExternalLink h-3 w-3 /> Acessar Site Público</button>
          </div>
          <button onClick={handleLogout} className="text-xs text-red-400 underline font-semibold flex items-center gap-1 mt-6"><LogOut h-3 w-3 /> Desconectar Conta</button>
        </aside>

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full grid md:grid-cols-3 gap-8">
          {/* Lista de Agendamentos dos Clientes */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-amber-500" /> Agenda da Barbearia</h3>
            {currentBarberData?.appointments.length === 0 ? (
              <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-xl text-center text-slate-500 text-sm">Nenhum cliente agendou horário ainda.</div>
            ) : (
              <div className="space-y-3">
                {[...currentBarberData.appointments].reverse().map(app => (
                  <div key={app.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-bold text-base">{app.clientName} <span className="text-xs font-normal text-slate-400">{app.clientPhone}</span></p>
                      <p className="text-xs text-amber-500 font-bold">{app.service.name} • R$ {app.service.price}</p>
                      <p className="text-xs text-slate-400 font-semibold">{app.date} às {app.time}</p>
                    </div>
                    {app.status === 'pendente' ? (
                      <div className="flex gap-1">
                        <button onClick={() => updateAppointmentStatus(currentBarberData.id, app.id, 'concluído')} className="bg-green-500/20 text-green-400 p-2 rounded-lg text-xs font-bold hover:bg-green-500/30">✓</button>
                        <button onClick={() => updateAppointmentStatus(currentBarberData.id, app.id, 'cancelado')} className="bg-red-500/20 text-red-400 p-2 rounded-lg text-xs font-bold hover:bg-red-500/30">✕</button>
                      </div>
                    ) : (
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500">{app.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adicionar Serviços */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">Gerenciar Serviços</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentBarberData?.services.map(s => (
                <div key={s.id} className="text-xs flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span>{s.name}</span>
                  <span className="font-bold text-amber-500">R$ {s.price}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddService} className="pt-2 space-y-2">
              <input type="text" placeholder="Nome do Serviço" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg p-2 outline-none" required />
              <input type="number" placeholder="Preço (R$)" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg p-2 outline-none" required />
              <button type="submit" className="w-full bg-slate-950 text-amber-500 border border-amber-500/30 text-xs font-bold py-2 rounded-lg hover:bg-amber-500 hover:text-slate-950 transition-colors">Adicionar</button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Navegação condicional das telas
  if (currentRoute === 'login') return <LoginPage />;
  if (currentRoute === 'barber-dashboard') return <BarberDashboard />;
  if (currentRoute === 'client-dashboard') return <ClientDashboard />;
  return <LandingPage />;
}