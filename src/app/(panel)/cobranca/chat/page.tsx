'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DebtorContact {
  id: string;
  name: string;
  whatsappPhone: string | null;
  status: string;
  debtAmount: number | null;
  lastMessage: { text: string; direction: string; createdAt: string; status: string } | null;
  lastActivityAt: string | null;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  direction: 'OUTBOUND' | 'INBOUND';
  content: string;
  status: string;
  media_type: string | null;
  media_url: string | null;
  response_time_minutes: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  ATIVO:      'bg-red-500/20 text-red-300',
  NEGOCIANDO: 'bg-yellow-500/20 text-yellow-300',
  QUITADO:    'bg-green-500/20 text-green-300',
  INATIVO:    'bg-gray-500/20 text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Ativo', NEGOCIANDO: 'Negociando', QUITADO: 'Quitado', INATIVO: 'Inativo',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Ontem';
  if (days < 7)  return `${days}d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CobrancaChatPage() {
  const searchParams = useSearchParams();

  const [contacts, setContacts]           = useState<DebtorContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [search, setSearch]               = useState('');

  const [selected, setSelected]           = useState<DebtorContact | null>(null);
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);
  const prevMsgCountRef                   = useRef(0);

  const [chatInput, setChatInput]         = useState('');
  const [sending, setSending]             = useState(false);
  const [mediaFile, setMediaFile]         = useState<File | null>(null);
  const [mediaPreview, setMediaPreview]   = useState<string | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording]     = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef                  = useRef<MediaRecorder | null>(null);
  const audioChunksRef                    = useRef<Blob[]>([]);
  const recordingTimerRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showChat, setShowChat]           = useState(false); // mobile

  // ─── Load contacts ─────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/contacts');
      if (res.ok) {
        const data: DebtorContact[] = await res.json();
        setContacts(data);
        // Restore from URL param
        const debtorParam = searchParams.get('debtor');
        if (debtorParam && !selected) {
          const found = data.find(c => c.id === debtorParam);
          if (found) setSelected(found);
        }
      }
    } finally {
      setContactsLoading(false);
    }
  }, [searchParams, selected]);

  useEffect(() => { loadContacts(); }, []);

  // ─── Load messages ──────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (debtorId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/debtors/${debtorId}/messages`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
        prevMsgCountRef.current = data.length;
      }
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected.id);
      setShowChat(true);
    }
  }, [selected?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMsgCountRef.current = messages.length;
    }
  }, [messages]);

  // ─── SSE ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selected) return;
    const es = new EventSource(`/api/chat/stream?debtorId=${selected.id}`);
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'new_messages') {
          loadMessages(selected.id);
          loadContacts();
        }
      } catch { /* ignora */ }
    };
    return () => es.close();
  }, [selected?.id]);

  // ─── Send message ───────────────────────────────────────────────────────────
  async function handleSend() {
    if (!selected || sending) return;
    if (!chatInput.trim() && !mediaFile) return;

    setSending(true);
    try {
      let res: Response;
      if (mediaFile) {
        const fd = new FormData();
        fd.append('file', mediaFile);
        if (chatInput.trim()) fd.append('caption', chatInput.trim());
        res = await fetch(`/api/debtors/${selected.id}/send-message`, { method: 'POST', body: fd });
      } else {
        res = await fetch(`/api/debtors/${selected.id}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: chatInput.trim() }),
        });
      }

      if (res.ok) {
        setChatInput('');
        setMediaFile(null);
        setMediaPreview(null);
        await loadMessages(selected.id);
        await loadContacts();
      }
    } finally {
      setSending(false);
    }
  }

  // ─── File pick ──────────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    if (file.type.startsWith('image/')) {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview(null);
    }
    e.target.value = '';
  }

  // ─── Audio recording ────────────────────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
        const file = new File([blob], 'audio.ogg', { type: 'audio/ogg' });
        setMediaFile(file);
        setMediaPreview(null);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch { /* mic denied */ }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  }

  // ─── Filtered contacts ──────────────────────────────────────────────────────
  const filtered = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar contatos */}
      <div className={`w-80 flex-shrink-0 bg-[#060d1f] border-r border-white/5 flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white font-semibold mb-3">Chat Cobrança</h2>
          <input
            type="text"
            placeholder="Buscar devedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/30 border border-white/10 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsLoading ? (
            <p className="text-white/30 text-sm text-center py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Nenhum contato.</p>
          ) : (
            filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-white/5 transition-colors ${
                  selected?.id === c.id ? 'bg-cyan-500/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium truncate">{c.name}</span>
                    {c.lastActivityAt && (
                      <span className="text-white/30 text-xs ml-2 flex-shrink-0">{relativeTime(c.lastActivityAt)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-white/40 text-xs truncate">
                      {c.lastMessage
                        ? (c.lastMessage.direction === 'OUTBOUND' ? '→ ' : '') + c.lastMessage.text
                        : c.debtAmount
                          ? `R$ ${Number(c.debtAmount).toLocaleString('pt-BR')}`
                          : 'Sem mensagens'}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      {!selected ? (
        <div className={`flex-1 flex items-center justify-center ${showChat ? 'flex' : 'hidden md:flex'}`}>
          <div className="text-center text-white/30">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-sm">Selecione um devedor para iniciar</p>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col min-w-0 ${showChat ? 'flex' : 'hidden md:flex'}`}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-[#060d1f] flex items-center gap-3">
            <button className="md:hidden text-white/40 hover:text-white mr-1" onClick={() => setShowChat(false)}>←</button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials(selected.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{selected.name}</p>
              {selected.whatsappPhone && (
                <p className="text-white/30 text-xs">{selected.whatsappPhone}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selected.debtAmount != null && (
                <span className="text-white/50 text-xs">
                  R$ {Number(selected.debtAmount).toLocaleString('pt-BR')}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[selected.status] ?? ''}`}>
                {STATUS_LABELS[selected.status] ?? selected.status}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: '#0a1628' }}>
            {messagesLoading ? (
              <p className="text-white/30 text-sm text-center py-8">Carregando mensagens...</p>
            ) : messages.length === 0 ? (
              <p className="text-white/20 text-sm text-center py-8">Nenhuma mensagem ainda. Inicie a conversa!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    msg.direction === 'OUTBOUND'
                      ? 'bg-cyan-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-white/90 rounded-bl-sm'
                  }`}>
                    {/* Mídia */}
                    {msg.media_type === 'IMAGE' && msg.media_url && (
                      <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                        <img src={msg.media_url} alt="imagem" className="rounded-lg max-w-full mb-1 max-h-48 object-cover" />
                      </a>
                    )}
                    {msg.media_type === 'AUDIO' && msg.media_url && (
                      <audio controls className="max-w-full mb-1" style={{ height: 36 }}>
                        <source src={msg.media_url} />
                      </audio>
                    )}
                    {msg.media_type === 'VIDEO' && msg.media_url && (
                      <video controls className="rounded-lg max-w-full mb-1 max-h-40">
                        <source src={msg.media_url} />
                      </video>
                    )}
                    {msg.media_type === 'DOCUMENT' && msg.media_url && (
                      <a href={msg.media_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs underline mb-1">
                        📄 {msg.content}
                      </a>
                    )}
                    {/* Texto */}
                    {(msg.media_type === 'TEXT' || !msg.media_type || (msg.media_type !== 'DOCUMENT' && msg.content && !msg.content.startsWith('['))) && (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs opacity-50">{formatTime(msg.created_at)}</span>
                      {msg.direction === 'OUTBOUND' && (
                        <span className="text-xs opacity-50">
                          {msg.status === 'SENT' || msg.status === 'READ' ? '✓✓' : msg.status === 'FAILED' ? '✗' : '⏳'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5 bg-[#060d1f]">
            {/* Media preview */}
            {mediaFile && (
              <div className="mb-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                {mediaPreview ? (
                  <img src={mediaPreview} alt="preview" className="w-12 h-12 object-cover rounded" />
                ) : (
                  <span className="text-2xl">{mediaFile.type.startsWith('audio/') ? '🎵' : '📄'}</span>
                )}
                <span className="text-white/60 text-sm truncate flex-1">{mediaFile.name}</span>
                <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="text-white/40 hover:text-red-400 text-lg">✕</button>
              </div>
            )}

            {/* Recording */}
            {isRecording && (
              <div className="mb-2 flex items-center gap-2 text-red-400 text-sm">
                <span className="animate-pulse">⏺</span>
                <span>Gravando {recordingSeconds}s...</span>
                <button onClick={stopRecording} className="ml-auto text-white/50 hover:text-white text-xs border border-white/20 px-2 py-0.5 rounded">Parar</button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,application/pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 text-lg"
                title="Anexar arquivo"
              >
                📎
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-lg ${
                  isRecording ? 'bg-red-500/20 text-red-400' : 'bg-white/10 hover:bg-white/20 text-white/60'
                }`}
                title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
              >
                🎤
              </button>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Digite uma mensagem..."
                rows={1}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/10 text-sm resize-none focus:outline-none focus:border-cyan-500 max-h-28 overflow-y-auto"
              />
              <button
                onClick={handleSend}
                disabled={sending || (!chatInput.trim() && !mediaFile)}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-lg"
              >
                {sending ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
