'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Lead } from '@prisma/client';
import { createLeadAction } from '@/app/admin/lead-actions';

export const ETAPAS_CONFIG: Record<string, { label: string; bg: string; text: string; pinColor: string }> = {
  novo: { label: 'Novo Lead', bg: 'bg-blue-500/15', text: 'text-blue-400', pinColor: '#3b82f6' },
  chamado: { label: 'Chamado', bg: 'bg-amber-500/15', text: 'text-amber-400', pinColor: '#f59e0b' },
  respondeu: { label: 'Respondeu', bg: 'bg-purple-500/15', text: 'text-purple-400', pinColor: '#a855f7' },
  call: { label: 'Call Agendada', bg: 'bg-orange-500/15', text: 'text-orange-400', pinColor: '#f97316' },
  proposta: { label: 'Proposta Enviada', bg: 'bg-cyan-500/15', text: 'text-cyan-400', pinColor: '#06b6d4' },
  fechado: { label: 'Fechado / Cliente', bg: 'bg-emerald-500/15', text: 'text-emerald-400', pinColor: '#10b981' },
  perdido: { label: 'Perdido / Inativo', bg: 'bg-rose-500/15', text: 'text-rose-400', pinColor: '#f43f5e' },
};

export const PRIORIDADES_CONFIG: Record<number, { label: string; desc: string; badge: string; border: string }> = {
  1: {
    label: 'Prioridade 1',
    desc: 'Pequeno, de dono, produto visual (Fazer Amostra)',
    badge: 'bg-amber-400/20 text-amber-300 ring-amber-400/40',
    border: '#f59e0b',
  },
  2: {
    label: 'Prioridade 2',
    desc: 'Bom encaixe, negócio maior',
    badge: 'bg-blue-400/20 text-blue-300 ring-blue-400/40',
    border: '#3b82f6',
  },
  3: {
    label: 'Prioridade 3',
    desc: 'Encaixe fraco',
    badge: 'bg-zinc-500/20 text-zinc-300 ring-zinc-500/40',
    border: '#71717a',
  },
};

type Props = {
  initialLeads: Lead[];
  onLeadCreated?: () => void;
};

export function LeadCaptureMap({ initialLeads }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeEtapa, setActiveEtapa] = useState<string>('todos');
  const [activePrioridade, setActivePrioridade] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal / Form state para capturar novo lead ao clicar no mapa
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [captureCoords, setCaptureCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [captureAddress, setCaptureAddress] = useState({ cidade: '', estado: '', endereco: '', bairro: '' });
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isConsultingCnpj, setIsConsultingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    nome: '',
    bairro: '',
    cidade: '',
    estado: '',
    horario: '',
    email: '',
    whatsapp: '',
    instagram: '',
    siteUrl: '',
    nicho: 'Alimentação / Confeitaria / Varejo',
    cnpj: '',
    situacaoCnpj: '',
    porte: 'MEI',
    dataAbertura: '',
    nomeSocio: '',
    prioridade: '1',
    motivoPrioridade: '',
    primeiraMensagem: '',
    valor: '',
    notas: '',
    etapa: 'novo',
  });

  // Atualizar lista local se props mudar
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Carregar Leaflet e inicializar o mapa
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current || mapInstanceRef.current) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [-27.5948, -48.5482], // Florianópolis / Brasil
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Clique no mapa para capturar coordenadas
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        setCaptureCoords({ lat, lng });
        setCaptureModalOpen(true);
        setCnpjFeedback(null);

        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
        }

        const tempIcon = L.divIcon({
          className: 'custom-temp-pin',
          html: `<div style="
            width: 28px; height: 28px; background: #e11d48; border: 3px solid #ffffff;
            border-radius: 50%; box-shadow: 0 0 15px #e11d48;
            animation: pulse 1.5s infinite;
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);

        setIsGeocoding(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const cidade = addr.city || addr.town || addr.municipality || addr.village || '';
            const estado = addr.state || '';
            const bairro = addr.suburb || addr.neighbourhood || addr.quarter || '';
            const road = addr.road || '';
            setCaptureAddress({
              cidade,
              estado,
              bairro,
              endereco: road ? `${road}, ${bairro}` : bairro,
            });
            setFormData((prev) => ({
              ...prev,
              bairro: bairro || prev.bairro,
            }));
          }
        } catch {
          /* ignora */
        } finally {
          setIsGeocoding(false);
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualizar pins no mapa
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersGroupRef.current) return;
      const L = await import('leaflet');
      const markersGroup = markersGroupRef.current;
      markersGroup.clearLayers();

      const filtered = leads.filter((l) => {
        if (activeEtapa !== 'todos' && l.etapa !== activeEtapa) return false;
        if (activePrioridade !== 'todas' && String(l.prioridade) !== activePrioridade) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            l.nome.toLowerCase().includes(q) ||
            (l.bairro || '').toLowerCase().includes(q) ||
            (l.cidade || '').toLowerCase().includes(q) ||
            (l.nomeSocio || '').toLowerCase().includes(q) ||
            (l.cnpj || '').toLowerCase().includes(q) ||
            (l.nicho || '').toLowerCase().includes(q) ||
            (l.instagram || '').toLowerCase().includes(q)
          );
        }
        return true;
      });

      const bounds: [number, number][] = [];

      filtered.forEach((lead) => {
        if (lead.lat === null || lead.lng === null) return;

        bounds.push([lead.lat, lead.lng]);
        const conf = ETAPAS_CONFIG[lead.etapa] || ETAPAS_CONFIG.novo;
        const prioConf = PRIORIDADES_CONFIG[lead.prioridade || 1] || PRIORIDADES_CONFIG[1];

        // Se Prioridade 1, pin em destaque dourado/brasa
        const isP1 = lead.prioridade === 1;
        const pinBg = isP1 ? '#f59e0b' : conf.pinColor;
        const pinBorder = isP1 ? '#ffffff' : '#ffffff';

        const customIcon = L.divIcon({
          className: 'custom-lead-pin',
          html: `
            <div style="
              width: ${isP1 ? '36px' : '30px'}; height: ${isP1 ? '36px' : '30px'};
              background: ${pinBg}; border: 3px solid ${pinBorder};
              border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
              box-shadow: ${isP1 ? '0 0 16px rgba(245, 158, 11, 0.8)' : '0 4px 10px rgba(0,0,0,0.35)'};
              cursor: pointer; color: white; font-weight: 800; font-size: ${isP1 ? '12px' : '11px'};
            ">
              ${isP1 ? '★' : lead.nome.charAt(0).toUpperCase()}
            </div>
          `,
          iconSize: isP1 ? [36, 36] : [30, 30],
          iconAnchor: isP1 ? [18, 18] : [15, 15],
        });

        const waLink = lead.whatsapp
          ? `https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(lead.primeiraMensagem || `Oi, tudo bem? Sou o Pedro Barbarotti!`)}`
          : null;

        const cnpjaUrl = lead.cnpj ? `https://open.cnpja.com/office/${lead.cnpj.replace(/\D/g, '')}` : null;

        const popupHtml = `
          <div style="font-family: system-ui, sans-serif; min-width: 250px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${isP1 ? '#f59e0b25' : '#3b82f625'}; color: ${isP1 ? '#d97706' : '#2563eb'}; border: 1px solid currentColor;">
                Prioridade ${lead.prioridade || 1} ${isP1 ? '· Fazer Amostra' : ''}
              </span>
              <span style="font-size: 11px; color: #666; font-weight: 600;">${lead.bairro ? `${lead.bairro}, ` : ''}${lead.cidade || 'Brasil'}</span>
            </div>

            <h4 style="font-weight: 800; font-size: 16px; margin: 0 0 2px 0; color: #111;">${lead.nome}</h4>
            
            ${lead.nomeSocio ? `<div style="font-size: 12px; color: #047857; font-weight: 700; margin-bottom: 4px;">👤 Sócio / Dono: ${lead.nomeSocio}</div>` : ''}
            ${lead.nicho ? `<p style="font-size: 11px; color: #555; margin: 0 0 6px 0;">🏷️ ${lead.nicho}</p>` : ''}
            
            <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; margin-bottom: 10px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0;">
              ${lead.cnpj ? `<div><strong>CNPJ:</strong> ${lead.cnpj} ${lead.porte ? `(${lead.porte})` : ''} ${cnpjaUrl ? `<a href="${cnpjaUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; margin-left: 4px;">Ver na CNPJá</a>` : ''}</div>` : ''}
              ${lead.horario ? `<div><strong>Horário:</strong> ${lead.horario}</div>` : ''}
              ${lead.instagram ? `<div><strong>Instagram:</strong> @${lead.instagram.replace('@', '')}</div>` : ''}
              ${lead.whatsapp ? `<div><strong>WhatsApp comercial:</strong> ${lead.whatsapp}</div>` : ''}
              ${lead.motivoPrioridade ? `<div style="color: #64748b; font-style: italic;">"${lead.motivoPrioridade}"</div>` : ''}
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${
                lead.primeiraMensagem
                  ? `<button onclick="navigator.clipboard.writeText(${JSON.stringify(lead.primeiraMensagem)}); alert('1ª Mensagem copiada com sucesso!');" style="width: 100%; text-align: center; background: #0f172a; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 700; font-size: 11px; cursor: pointer;">
                      📋 Copiar 1ª Mensagem (5 linhas)
                    </button>`
                  : ''
              }
              <div style="display: flex; gap: 6px;">
                ${
                  lead.instagram
                    ? `<a href="https://instagram.com/${lead.instagram.replace('@', '')}" target="_blank" style="flex: 1; text-align: center; background: #E1306C; color: white; text-decoration: none; padding: 6px; border-radius: 8px; font-weight: 700; font-size: 11px;">Instagram</a>`
                    : ''
                }
                ${
                  waLink
                    ? `<a href="${waLink}" target="_blank" style="flex: 1; text-align: center; background: #25D366; color: white; text-decoration: none; padding: 6px; border-radius: 8px; font-weight: 700; font-size: 11px;">WhatsApp</a>`
                    : ''
                }
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([lead.lat, lead.lng], { icon: customIcon });
        marker.bindPopup(popupHtml);
        markersGroup.addLayer(marker);
      });

      if (bounds.length > 0 && mapInstanceRef.current && activeEtapa === 'todos' && activePrioridade === 'todas' && !searchQuery) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }

    updateMarkers();
  }, [leads, activeEtapa, activePrioridade, searchQuery]);

  // Consulta automática de CNPJ no modal
  async function handleConsultarCnpj() {
    const raw = formData.cnpj.replace(/\D/g, '');
    if (raw.length !== 14) {
      setCnpjFeedback('Digite um CNPJ válido com 14 dígitos.');
      return;
    }

    setIsConsultingCnpj(true);
    setCnpjFeedback('Consultando base pública da Receita Federal...');
    try {
      const res = await fetch(`/api/admin/cnpj/${raw}`);
      if (!res.ok) throw new Error('Não encontrado');
      const info = await res.json();

      setFormData((prev) => {
        const socio = info.socioPrincipal || prev.nomeSocio;
        const nomeEmpresa = info.nomeFantasia || info.razaoSocial || prev.nome;
        const msg = [
          socio ? `Oi, ${socio.split(' ')[0]}!` : 'Olá, tudo bem?',
          `Sou o Pedro Barbarotti, aqui da região. Vi o perfil da ${nomeEmpresa} e curti muito o posicionamento de vocês.`,
          'Tô com uma condição especial de 6 fotos de produto com IA para os 5 primeiros negócios da região (entrega em 48h).',
          'Se fizer sentido pra vocês, preparo uma amostra rápida sem compromisso.',
          'Se não fizer sentido agora, é só me avisar que não mando mais nada!',
        ].join('\n');

        return {
          ...prev,
          nome: prev.nome || nomeEmpresa,
          bairro: info.bairro || prev.bairro,
          cidade: info.cidade || prev.cidade,
          porte: info.porte || prev.porte,
          situacaoCnpj: info.situacao || prev.situacaoCnpj,
          dataAbertura: info.dataAbertura || prev.dataAbertura,
          nomeSocio: socio,
          whatsapp: info.telefoneDivulgado || prev.whatsapp,
          email: info.emailCorporativo || prev.email,
          primeiraMensagem: prev.primeiraMensagem || msg,
        };
      });

      setCnpjFeedback(
        `✓ Dados encontrados! ${info.isMei ? 'MEI detectado (protegendo dados pessoais).' : `Porte: ${info.porte}.`} ${info.socioPrincipal ? `Sócio: ${info.socioPrincipal}.` : ''}`
      );
    } catch {
      setCnpjFeedback('Não foi possível obter dados automáticos. Consulte no link https://open.cnpja.com/office/' + raw);
    } finally {
      setIsConsultingCnpj(false);
    }
  }

  // Pesquisar cidade no mapa
  async function handleSearchLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Brasil')}`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 13);
        }
      }
    } catch {
      /* ignora */
    } finally {
      setIsSearching(false);
    }
  }

  function closeCaptureModal() {
    setCaptureModalOpen(false);
    if (tempMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-carvao text-white ring-1 ring-white/10 shadow-2xl">
      {/* Header do Mapa com busca e filtros */}
      <div className="flex flex-col gap-3 border-b border-white/10 bg-carvao/90 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <span>Mapa de Leads — Pesquisa & Abordagem</span>
              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                ★ Prioridade 1 = Fazer Amostra
              </span>
            </h3>
            <p className="text-xs text-white/60">Clique no mapa para adicionar um lead na localização exata ou consulte o CNPJ gratuitamente</p>
          </div>
        </div>

        <form onSubmit={handleSearchLocation} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar bairro, negócio, sócio ou cidade..."
            className="w-full rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-brasa md:w-72"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="rounded-xl bg-brasa px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSearching ? '...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Barra de Filtros Duplos: Prioridade + Estágio do Funil */}
      <div className="flex flex-col gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-white/50 uppercase text-[10px] tracking-wider">Prioridade:</span>
          <button
            type="button"
            onClick={() => setActivePrioridade('todas')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activePrioridade === 'todas' ? 'bg-white text-carvao shadow' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Todas ({leads.length})
          </button>
          {[1, 2, 3].map((prio) => {
            const count = leads.filter((l) => l.prioridade === prio).length;
            const conf = PRIORIDADES_CONFIG[prio];
            return (
              <button
                key={prio}
                type="button"
                onClick={() => setActivePrioridade(String(prio))}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition-all ${
                  activePrioridade === String(prio) ? `${conf.badge} ring-1 font-bold shadow` : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{conf.label}</span>
                <span>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
          <span className="font-bold text-white/50 uppercase text-[10px] tracking-wider">Etapa:</span>
          <button
            type="button"
            onClick={() => setActiveEtapa('todos')}
            className={`rounded-lg px-2 py-0.5 font-medium transition-all ${
              activeEtapa === 'todos' ? 'bg-white/20 text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            Todas
          </button>
          {Object.entries(ETAPAS_CONFIG).map(([key, conf]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveEtapa(key)}
              className={`flex items-center gap-1 rounded-lg px-2 py-0.5 font-medium transition-all ${
                activeEtapa === key ? `${conf.bg} ${conf.text} ring-1 ring-current font-bold` : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: conf.pinColor }} />
              {conf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Renderização do mapa Leaflet */}
      <div ref={mapContainerRef} className="h-[520px] w-full bg-[#191a1a] z-0" />

      {/* Modal de Captura de Lead ao Clicar no Mapa */}
      {captureModalOpen && captureCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-carvao p-6 text-white ring-1 ring-white/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-amber-400 animate-ping" />
                <h3 className="font-display text-lg font-bold text-white">Cadastrar Lead no Mapa</h3>
              </div>
              <button onClick={closeCaptureModal} type="button" className="text-white/60 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {/* Localização GPS */}
            <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-white/80 flex items-center justify-between">
              <div>
                📍 <strong>Coordenadas:</strong> {captureCoords.lat.toFixed(5)}, {captureCoords.lng.toFixed(5)}
                {captureAddress.bairro && <span className="ml-2 text-amber-300">({captureAddress.bairro})</span>}
              </div>
              {isGeocoding && <span className="animate-pulse text-amber-400">Identificando bairro...</span>}
            </div>

            {/* Ferramenta de Consulta Rápida de CNPJ Gratuita */}
            <div className="mt-3 rounded-xl bg-blue-950/40 border border-blue-500/30 p-3">
              <label className="block text-xs font-bold text-blue-300 mb-1">
                🔍 Consulta Gratuita de CNPJ (Traz Nome do Sócio, Porte, Abertura & Bairro)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole os 14 números do CNPJ..."
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="flex-1 rounded-xl bg-black/40 px-3 py-1.5 text-xs text-white placeholder-white/40 ring-1 ring-white/20 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleConsultarCnpj}
                  disabled={isConsultingCnpj}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:bg-blue-500 disabled:opacity-50"
                >
                  {isConsultingCnpj ? 'Consultando...' : 'Puxar Dados Grátis'}
                </button>
              </div>
              {cnpjFeedback && <p className="mt-1.5 text-[11px] text-blue-200">{cnpjFeedback}</p>}
            </div>

            <form action={createLeadAction} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="lat" value={captureCoords.lat} />
              <input type="hidden" name="lng" value={captureCoords.lng} />
              <input type="hidden" name="cidade" value={captureAddress.cidade} />
              <input type="hidden" name="estado" value={captureAddress.estado} />
              <input type="hidden" name="bairro" value={formData.bairro || captureAddress.bairro} />
              <input type="hidden" name="origem" value="mapa_click" />
              <input type="hidden" name="returnUrl" value="/admin/leads" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Nome do Negócio *</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    placeholder="Ex: Doce Encanto, Barba Negra..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/20 focus:ring-2 focus:ring-brasa focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    placeholder="Ex: Centro, Itacorubi, Jardins..."
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/20 focus:ring-2 focus:ring-brasa focus:outline-none"
                  />
                </div>
              </div>

              {/* Sócio & Prioridade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Nome do Sócio / Dono (para "Oi, [Nome]")
                  </label>
                  <input
                    type="text"
                    name="nomeSocio"
                    placeholder="Ex: Daniela, Marcos..."
                    value={formData.nomeSocio}
                    onChange={(e) => setFormData({ ...formData, nomeSocio: e.target.value })}
                    className="w-full rounded-xl bg-emerald-950/20 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-emerald-500/40 focus:ring-2 focus:ring-emerald-400 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">Prioridade (1 a 3)</label>
                  <select
                    name="prioridade"
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                    className="w-full rounded-xl bg-amber-950/20 px-3 py-2 text-sm text-amber-200 ring-1 ring-amber-500/40 focus:ring-2 focus:ring-amber-400 focus:outline-none font-bold"
                  >
                    <option value="1" className="bg-carvao text-white">1 - Alta (Fazer Amostra - Pequeno/Dono)</option>
                    <option value="2" className="bg-carvao text-white">2 - Média (Bom encaixe / Maior)</option>
                    <option value="3" className="bg-carvao text-white">3 - Fraca (Encaixe difícil)</option>
                  </select>
                </div>
              </div>

              {/* Contatos Públicos da Marca */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Instagram (@da_marca)</label>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="@marca"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/20 focus:ring-2 focus:ring-brasa focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">WhatsApp divulgado pela marca</label>
                  <input
                    type="text"
                    name="whatsapp"
                    placeholder="48999999999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/20 focus:ring-2 focus:ring-brasa focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Horário de Funcionamento</label>
                  <input
                    type="text"
                    name="horario"
                    placeholder="Ex: Seg-Sáb 10h-22h"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Porte / Tipo</label>
                  <input
                    type="text"
                    name="porte"
                    placeholder="MEI, ME, EPP"
                    value={formData.porte}
                    onChange={(e) => setFormData({ ...formData, porte: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Abertura</label>
                  <input
                    type="text"
                    name="dataAbertura"
                    placeholder="DD/MM/AAAA"
                    value={formData.dataAbertura}
                    onChange={(e) => setFormData({ ...formData, dataAbertura: e.target.value })}
                    className="w-full rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Motivo da Prioridade (1 linha)</label>
                <input
                  type="text"
                  name="motivoPrioridade"
                  placeholder="Ex: Pequeno, fotos do feed antigas, cardápio visual com alto potencial..."
                  value={formData.motivoPrioridade}
                  onChange={(e) => setFormData({ ...formData, motivoPrioridade: e.target.value })}
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  1ª Mensagem Personalizada (até 5 linhas com saída fácil)
                </label>
                <textarea
                  name="primeiraMensagem"
                  rows={4}
                  value={formData.primeiraMensagem}
                  onChange={(e) => setFormData({ ...formData, primeiraMensagem: e.target.value })}
                  placeholder="Oi, [Nome]! Sou o Pedro Barbarotti..."
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-mono text-white placeholder-white/40 ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-brasa"
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={closeCaptureModal}
                  className="flex-1 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brasa py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Salvar Lead no Mapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
