import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronDown, Compass, Headphones,
  Heart, MapPin, Menu, Plane, Search, ShieldCheck, Sparkles, Ticket,
  Users, X, AlertTriangle, LoaderCircle, Globe2
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const pesos = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n));
const paises = ['Todos', 'Colombia', 'Perú', 'Argentina', 'México', 'España', 'Italia'];
const iconos = { Colombia: '🌴', Perú: '⛰️', Argentina: '💃', México: '🌮', España: '🏛️', Italia: '🍋' };
const imagenes = {
  Colombia: 'card-cartagena', Perú: 'card-cusco', Argentina: 'card-buenosaires',
  México: 'card-mexico', España: 'card-madrid', Italia: 'card-roma'
};

function PaqueteCard({ paquete, onReservar }) {
  const [favorito, setFavorito] = useState(false);
  return (
    <article className="package-card">
      <div className={`package-art ${imagenes[paquete.pais] || 'card-default'}`}>
        <span className="art-horizon" aria-hidden="true">{iconos[paquete.pais] || '✈️'}</span>
        <span className="package-tag"><Sparkles size={12} /> Experiencia única</span>
        <button className={`favorite ${favorito ? 'active' : ''}`} type="button" onClick={() => setFavorito(v => !v)} aria-label={favorito ? 'Quitar favorito' : 'Marcar favorito'}>
          <Heart size={19} fill={favorito ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="package-content">
        <div className="package-destination"><MapPin size={14} /> {paquete.destino}, {paquete.pais}</div>
        <h3>{paquete.nombre}</h3>
        <p>{paquete.descripcion}</p>
        <div className="package-meta"><span><CalendarDays size={15} /> {paquete.duracionDias} días</span><span><Users size={15} /> Por persona</span></div>
        <div className="package-footer"><div><small>Desde</small><strong>{pesos(paquete.precioCop)}</strong></div><button type="button" className="btn-card" onClick={() => onReservar(paquete)}>Reservar <ArrowRight size={16} /></button></div>
      </div>
    </article>
  );
}

function FormReserva({ paquete, onCerrar }) {
  const [nombreCliente, setNombreCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [viajeros, setViajeros] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const onEscape = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onEscape); document.body.style.overflow = ''; };
  }, [onCerrar]);

  const confirmar = async (e) => {
    e.preventDefault();
    setError(''); setEnviando(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/reservas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paqueteId: paquete.id, nombreCliente, correoCliente, viajeros: Number(viajeros) })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'No fue posible completar la solicitud');
      setResultado(data);
    } catch (err) { setError(err.message || 'No hay conexión con el servidor'); }
    finally { setEnviando(false); }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-reserva">
        <button type="button" className="close-modal" onClick={onCerrar} aria-label="Cerrar"><X size={19} /></button>
        {resultado ? (
          <div className="success-reservation">
            <div className="success-icon"><CheckCircle2 size={35} /></div>
            <h2 id="titulo-reserva">¡Solicitud registrada!</h2>
            <p>Tu reserva de demostración fue guardada correctamente.</p>
            <div className="confirmation-code"><small>Código de confirmación</small><strong>{resultado.codigo}</strong></div>
            <p>Estado: <strong>{resultado.estado}</strong>. El valor es de <strong>{pesos(resultado.totalCop)}</strong>. No se ha efectuado ningún cobro.</p>
            <button className="btn-primary" type="button" onClick={onCerrar}>Volver a explorar</button>
          </div>
        ) : (
          <>
            <div className="modal-eyebrow"><Ticket size={17} /> Reserva de demostración</div>
            <h2 id="titulo-reserva">Tu próxima aventura comienza aquí.</h2>
            <div className="modal-package"><span>{iconos[paquete.pais]}</span><div><strong>{paquete.nombre}</strong><small>{paquete.duracionDias} días · {paquete.destino}</small></div></div>
            <form onSubmit={confirmar}>
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" required minLength={3} maxLength={100} value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} placeholder="Ej. Ana Rodríguez" autoComplete="name" />
              <label htmlFor="correo">Correo electrónico</label>
              <input id="correo" required type="email" maxLength={150} value={correoCliente} onChange={e => setCorreoCliente(e.target.value)} placeholder="ana@ejemplo.com" autoComplete="email" />
              <label htmlFor="viajeros">Número de viajeros</label>
              <select id="viajeros" value={viajeros} onChange={e => setViajeros(Number(e.target.value))}>{Array.from({length: 10}, (_,i) => <option key={i+1} value={i+1}>{i+1} {i===0 ? 'persona' : 'personas'}</option>)}</select>
              <div className="modal-total"><span>Total estimado</span><strong>{pesos(paquete.precioCop * viajeros)}</strong></div>
              {error && <p className="error-reserva" role="alert"><AlertTriangle size={16} />{error}</p>}
              <button className="btn-primary submit" type="submit" disabled={enviando}>{enviando ? <><LoaderCircle className="spin" size={18}/> Guardando...</> : <>Confirmar solicitud <ArrowRight size={17}/></>}</button>
              <div className="form-disclaimer"><ShieldCheck size={14} /> Proyecto educativo, sin pagos reales ni disponibilidad confirmada.</div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pais, setPais] = useState('Todos');
  const [reserva, setReserva] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cargar = async () => {
    setError(''); setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/v1/paquetes`);
      if (!r.ok) throw new Error('La API devolvió un error');
      setPaquetes(await r.json());
    } catch { setError('No fue posible conectar con la API. Verifique que Spring Boot esté iniciado y que VITE_API_URL sea correcta.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);
  const filtrados = useMemo(() => paquetes.filter(p =>
    (pais === 'Todos' || p.pais === pais) &&
    `${p.nombre} ${p.destino} ${p.pais}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  ), [paquetes, pais, busqueda]);

  return (
    <>
      <header className="topbar"><div className="container nav-row">
        <a href="#inicio" className="brand"><span className="brand-mark"><Plane size={22}/></span><span>NÓMADA<span className="brand-contrast">travel</span></span></a>
        <nav className={menuAbierto ? 'nav-links open' : 'nav-links'} aria-label="Navegación principal">
          <a href="#inicio" onClick={() => setMenuAbierto(false)}>Inicio</a>
          <a href="#destinos" onClick={() => setMenuAbierto(false)}>Destinos</a>
          <a href="#nosotros" onClick={() => setMenuAbierto(false)}>Por qué viajar</a>
        </nav>
        <a href="#destinos" className="nav-cta">Explorar destinos <ArrowRight size={16}/></a>
        <button type="button" className="mobile-menu" aria-label="Mostrar menú" onClick={() => setMenuAbierto(v=>!v)}>{menuAbierto ? <X/> : <Menu/>}</button>
      </div></header>
      <main>
        <section className="hero" id="inicio"><div className="hero-glow glow-a"/><div className="hero-glow glow-b"/>
          <div className="container hero-grid">
            <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> TU PRÓXIMA HISTORIA COMIENZA AQUÍ</div>
              <h1>El mundo te espera.<br/><em>Nosotros te llevamos.</em></h1>
              <p>Descubre lugares extraordinarios, encuentra tu próxima aventura y vive experiencias que recordarás para siempre.</p>
              <div className="hero-actions"><a className="btn-primary" href="#destinos">Descubrir experiencias <ArrowRight size={18}/></a><a className="btn-subtle" href="#nosotros"><Compass size={18}/> Conoce más</a></div>
              <div className="trust-row"><div className="trust-avatars"><span>👩🏽</span><span>👨🏻</span><span>👩🏼</span></div><div><strong>Tu viaje, tu manera</strong><small>Explora opciones para cada tipo de viajero</small></div></div>
            </div>
            <div className="hero-visual" aria-label="Ilustración de viaje internacional">
              <div className="circle-orbit orbit-1"/><div className="circle-orbit orbit-2"/>
              <div className="sun-disc"/><div className="island-shape"/><div className="mountain peak-left"/><div className="mountain peak-right"/>
              <span className="hero-plane">✈</span><span className="illustration-badge"><MapPin size={16}/> Explora sin límites</span>
              <div className="floating-stamp"><Globe2 size={20}/><span>+ 6 destinos<small>Para descubrir</small></span></div>
            </div>
          </div>
          <div className="container"><div className="search-panel"><div className="search-title"><Search size={21}/><div><strong>¿A dónde quieres ir?</strong><small>Encuentra el plan perfecto</small></div></div><div className="search-input"><MapPin size={19}/><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca una ciudad o país..." aria-label="Buscar destinos"/></div><a href="#destinos" className="btn-search">Buscar viajes <ArrowRight size={17}/></a></div></div>
        </section>
        <section className="destinations section" id="destinos"><div className="container"><div className="section-title-row"><div><span className="section-overline">DESCUBRE Y EXPLORA</span><h2>Destinos que inspiran</h2><p>Un lugar para cada sueño. Elige tu próxima aventura.</p></div><span className="section-decoration"><Sparkles size={24}/></span></div>
          <div className="country-tabs" role="group" aria-label="Filtrar destinos por país">{paises.map(p => <button key={p} type="button" onClick={() => setPais(p)} className={pais===p ? 'tab selected' : 'tab'}>{p === 'Todos' ? <Globe2 size={16}/> : null}{p}</button>)}</div>
          {loading ? <div className="notice"><LoaderCircle className="spin" size={23}/> Consultando paquetes en la API...</div> : error ? <div className="notice notice-error"><AlertTriangle size={23}/><div>{error}<br/><button type="button" className="retry" onClick={cargar}>Reintentar conexión</button></div></div> : filtrados.length === 0 ? <div className="notice">No encontramos destinos para esa búsqueda.</div> : <div className="packages-grid">{filtrados.map(p => <PaqueteCard key={p.id} paquete={p} onReservar={setReserva}/>)}</div>}
          <p className="sample-disclaimer">* Tarifas de ejemplo para fines académicos; no corresponden a ofertas comerciales ni incluyen compra de tiquetes.</p>
        </div></section>
        <section className="why-section" id="nosotros"><div className="container"><div className="why-heading"><span className="section-overline">¿POR QUÉ NÓMADA?</span><h2>Viajar debería ser extraordinario.</h2><p>Una experiencia de exploración simple, clara y diseñada pensando en ti.</p></div><div className="feature-grid">
          <div><div className="feature-icon"><Compass size={25}/></div><h3>Descubre a tu ritmo</h3><p>Explora destinos e itinerarios en un solo lugar.</p></div>
          <div><div className="feature-icon"><ShieldCheck size={25}/></div><h3>Proceso transparente</h3><p>Conoce el total estimado antes de confirmar tu solicitud.</p></div>
          <div><div className="feature-icon"><Headphones size={25}/></div><h3>Listos para ayudarte</h3><p>Arquitectura preparada para futuras funciones de atención al viajero.</p></div>
        </div></div></section>
        <section className="cta-section"><div className="container"><div className="cta-box"><div><span>EL SIGUIENTE CAPÍTULO ES TUYO</span><h2>¿Listo para descubrir tu próximo destino?</h2><p>Tu aventura está a un clic de distancia.</p></div><a href="#destinos" className="btn-cta">Ver destinos <ArrowRight size={18}/></a></div></div></section>
      </main>
      <footer className="footer"><div className="container footer-row"><div className="brand"><span className="brand-mark"><Plane size={20}/></span><span>NÓMADA<span className="brand-contrast">travel</span></span></div><span>Proyecto educativo full stack · React + Spring Boot + PostgreSQL · Azure</span><span>© 2026 Nómada Travel</span></div></footer>
      {reserva && <FormReserva paquete={reserva} onCerrar={() => setReserva(null)} />}
    </>
  );
}

export default App;
