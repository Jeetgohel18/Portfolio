import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Copy, MessageCircle } from 'lucide-react';
import { personal } from '../data/personal';
import { useDocTitle } from '../hooks/useDocTitle';

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'error';
const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim();
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Contact() {
  useDocTitle('Contact');
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: '', email: '', message: '' });
  const [err, setErr] = useState<Partial<typeof v>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);

  const validate = (x = v) => {
    const e: Partial<typeof v> = {};
    if (x.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!emailRe.test(x.email.trim())) e.email = 'Please enter a valid email address.';
    if (x.message.trim().length < 10) e.message = 'Write at least a short sentence (10+ characters).';
    return e;
  };
  const set = (k: keyof typeof v) => (ev: { target: { value: string } }) => {
    const nv = { ...v, [k]: ev.target.value };
    setV(nv);
    if (err[k]) setErr((p) => ({ ...p, [k]: validate(nv)[k] }));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) { (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return; }
    if (ENDPOINT) {
      setStatus('sending');
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(v) });
        if (!r.ok) throw new Error(String(r.status));
        setStatus('sent'); setV({ name: '', email: '', message: '' });
      } catch { setStatus('error'); }
    } else {
      const body = `${v.message.trim()}\n\n— ${v.name.trim()} (${v.email.trim()})`;
      window.location.href = `mailto:${personal.email}?subject=${encodeURIComponent(`Portfolio enquiry from ${v.name.trim()}`)}&body=${encodeURIComponent(body)}`;
      setStatus('mailto');
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(personal.email); setCopied('ok'); }
    catch {
      try { const t = document.createElement('textarea'); t.value = personal.email; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); setCopied(ok ? 'ok' : 'fail'); }
      catch { setCopied('fail'); }
    }
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <main id="main" className="page contact">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">Contact</p>
          <h1>Write me a <em>letter</em>.</h1>
          <p className="page-sub">Project, collaboration or just hello — open the envelope.</p>
        </header>

        <div className="contact-grid">
          <div className={`letter ${open ? 'open' : ''}`}>
            <div className="env">
              <div className="env-back" />
              <div className="env-flap" />
              <div className="paper" aria-hidden={!open}>
                <form onSubmit={submit} noValidate aria-label="Contact form">
                  <p className="paper-date">Dear Jeet,</p>
                  <label className={err.name ? 'bad' : ''}>Your name
                    <input value={v.name} onChange={set('name')} autoComplete="name" disabled={!open} aria-invalid={!!err.name} aria-describedby="e-name" />
                    <small id="e-name" role="alert">{err.name}</small></label>
                  <label className={err.email ? 'bad' : ''}>Your email
                    <input type="email" value={v.email} onChange={set('email')} autoComplete="email" disabled={!open} aria-invalid={!!err.email} aria-describedby="e-email" />
                    <small id="e-email" role="alert">{err.email}</small></label>
                  <label className={err.message ? 'bad' : ''}>Message
                    <textarea rows={5} value={v.message} onChange={set('message')} disabled={!open} aria-invalid={!!err.message} aria-describedby="e-msg" />
                    <small id="e-msg" role="alert">{err.message}</small></label>
                  <div className="paper-foot">
                    <button className="btn-solid" type="submit" disabled={!open || status === 'sending'}>{status === 'sending' ? 'Sending…' : ENDPOINT ? 'Send letter' : 'Open in email app'}</button>
                    <span className="paper-sign">— {v.name.trim() || 'You'}</span>
                  </div>
                  <div className={`form-status ${status}`} role="status" aria-live="polite">
                    {status === 'sent' && <><Check size={16} /> Thanks — your message was sent. I'll reply by email.</>}
                    {status === 'mailto' && <>Your email app should have opened with the message prefilled. It is <strong>not sent</strong> until you press send there. Nothing opened? Email <a href={`mailto:${personal.email}`}>{personal.email}</a>.</>}
                    {status === 'error' && <>Something went wrong and the message was not sent. Please email <a href={`mailto:${personal.email}`}>{personal.email}</a> directly.</>}
                  </div>
                </form>
              </div>
              <div className="env-front" />
            </div>
            <button className="btn-solid env-open" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Close envelope' : 'Open the envelope'}</button>
            {!ENDPOINT && <p className="form-note">No email service is configured, so this form opens your email app (mailto). See README to connect one.</p>}
          </div>

          <aside className="contact-side">
            <p className="eyebrow">Or directly</p>
            <p className="big-mail">{personal.email}</p>
            <button className="btn-line" onClick={copy}>{copied === 'ok' ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy email</>}</button>
            <span className="sr-only" role="status">{copied === 'ok' ? 'Email copied' : copied === 'fail' ? 'Copy failed' : ''}</span>
            {copied === 'fail' && <p className="form-note">Couldn't copy automatically — please select the address above.</p>}
            <ul className="contact-links">
              <li><a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={16} /></a></li>
              <li><a href={personal.behance} target="_blank" rel="noreferrer">Behance <ArrowUpRight size={16} /></a></li>
              <li>{personal.whatsapp
                ? <a href={personal.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp <ArrowUpRight size={16} /></a>
                : <span className="disabled" aria-disabled="true"><MessageCircle size={16} /> WhatsApp — coming soon</span>}</li>
            </ul>
            <p className="form-note">{personal.location}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
