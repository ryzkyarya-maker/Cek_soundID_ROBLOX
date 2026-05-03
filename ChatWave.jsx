import { useState, useEffect, useRef, useCallback } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CONTACTS = [
  { id: 1, name: "Arya Pratama", phone: "+62 812-3456-7890", avatar: "AP", color: "#00C896", online: true, lastSeen: "Online", unread: 2, lastMsg: "Bro besok jadi ngoding bareng?" },
  { id: 2, name: "Siti Rahayu", phone: "+62 878-9012-3456", avatar: "SR", color: "#FF6B6B", online: false, lastSeen: "1 jam lalu", unread: 0, lastMsg: "Makasih ya udah bantu 🙏" },
  { id: 3, name: "Dimas Aditya", phone: "+62 856-7890-1234", avatar: "DA", color: "#6C63FF", online: true, lastSeen: "Online", unread: 5, lastMsg: "Wkwk iya bener banget 😂" },
  { id: 4, name: "Reni Anggraini", phone: "+62 895-6789-0123", avatar: "RA", color: "#FFD93D", online: false, lastSeen: "3 hari lalu", unread: 0, lastMsg: "File-nya udah aku kirim" },
  { id: 5, name: "Bagas Nugroho", phone: "+62 821-0987-6543", avatar: "BN", color: "#FF9F43", online: true, lastSeen: "Online", unread: 1, lastMsg: "Siap bos! 🔥" },
];

const INIT_MESSAGES = {
  1: [
    { id: 1, from: "them", text: "Bro besok jadi ngoding bareng?", time: "09:12", status: "read", type: "text" },
    { id: 2, from: "me", text: "Jadi dong! Jam berapa?", time: "09:14", status: "read", type: "text" },
    { id: 3, from: "them", text: "Jam 2 siang aja, di warung kopi yang biasa", time: "09:15", status: "read", type: "text" },
    { id: 4, from: "me", text: "Oke siap! Bawa laptop kan?", time: "09:16", status: "read", type: "text" },
    { id: 5, from: "them", text: "Pastilaah 😄", time: "09:17", status: "read", type: "text" },
    { id: 6, from: "them", audio: true, duration: "0:12", time: "09:20", status: "read", type: "voice" },
  ],
  2: [
    { id: 1, from: "them", text: "Hei, bisa minta tolong gak?", time: "kemarin", status: "read", type: "text" },
    { id: 2, from: "me", text: "Bisa dong, ada apa?", time: "kemarin", status: "read", type: "text" },
    { id: 3, from: "them", text: "Makasih ya udah bantu 🙏", time: "kemarin", status: "read", type: "text" },
  ],
  3: [
    { id: 1, from: "them", text: "Eh lo tau gak, si bos tadi bilang project kita maju deadline-nya!", time: "10:00", status: "read", type: "text" },
    { id: 2, from: "me", text: "Seriusan?! Jadi kapan?", time: "10:01", status: "read", type: "text" },
    { id: 3, from: "them", text: "Minggu depan bro 😱", time: "10:02", status: "read", type: "text" },
    { id: 4, from: "me", text: "WHAT 💀", time: "10:02", status: "read", type: "text" },
    { id: 5, from: "them", text: "Wkwk iya bener banget 😂", time: "10:03", status: "read", type: "text" },
  ],
  4: [{ id: 1, from: "them", text: "File-nya udah aku kirim", time: "Sen", status: "read", type: "text" }],
  5: [
    { id: 1, from: "me", text: "Bro, update progress gimana?", time: "11:30", status: "read", type: "text" },
    { id: 2, from: "them", text: "Siap bos! 🔥", time: "11:31", status: "read", type: "text" },
  ],
};

const STATUSES = [
  { id: 1, name: "Arya Pratama", avatar: "AP", color: "#00C896", seen: false, time: "5 mnt lalu", bg: "#0d2b22" },
  { id: 2, name: "Dimas Aditya", avatar: "DA", color: "#6C63FF", seen: false, time: "1 jam lalu", bg: "#1a1630" },
  { id: 3, name: "Bagas Nugroho", avatar: "BN", color: "#FF9F43", seen: true, time: "3 jam lalu", bg: "#2b1a08" },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a3942; border-radius: 4px; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes wave { 0%,100% { height: 4px; } 50% { height: 16px; } }
  @keyframes dotBounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
  @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(0,200,150,0.5); } 70% { box-shadow: 0 0 0 20px rgba(0,200,150,0); } 100% { box-shadow: 0 0 0 0 rgba(0,200,150,0); } }
  @keyframes statusRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes otpShake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-6px); } 40%,80% { transform: translateX(6px); } }
  @keyframes greenPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes recordPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = 40, online = false, style = {} }) => (
  <div style={{ position: "relative", flexShrink: 0, ...style }}>
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff",
      fontFamily: "'Sora', sans-serif",
    }}>{initials}</div>
    {online && <div style={{
      position: "absolute", bottom: 1, right: 1,
      width: size * 0.28, height: size * 0.28, borderRadius: "50%",
      background: "#00C896", border: "2px solid #111b21",
    }} />}
  </div>
);

const Tick = ({ status }) => {
  if (status === "sent") return <span style={{ color: "#8696a0", fontSize: 12 }}>✓</span>;
  if (status === "delivered") return <span style={{ color: "#8696a0", fontSize: 12 }}>✓✓</span>;
  if (status === "read") return <span style={{ color: "#53bdeb", fontSize: 12 }}>✓✓</span>;
  return null;
};

const WaveForm = ({ playing }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2, height: 24 }}>
    {[...Array(18)].map((_, i) => {
      const h = [4, 8, 14, 10, 6, 16, 8, 12, 6, 10, 14, 8, 6, 12, 16, 8, 10, 4][i];
      return (
        <div key={i} style={{
          width: 2.5, height: playing ? h : Math.max(h * 0.6, 3),
          borderRadius: 2,
          background: playing ? "#00C896" : "#8696a0",
          animation: playing ? `wave 0.8s ease-in-out ${i * 0.05}s infinite` : "none",
          transition: "height 0.2s",
        }} />
      );
    })}
  </div>
);

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// LOGIN
function LoginScreen({ onLogin }) {
  const [step, setStep] = useState("phone"); // phone | otp | success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fakeOtp] = useState("123456");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOtp = () => {
    if (phone.length < 9) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); setCountdown(60); }, 1200);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d) && next.join("") === fakeOtp) {
      setLoading(true);
      setTimeout(() => { setStep("success"); setTimeout(onLogin, 1000); }, 800);
    } else if (next.every(d => d) && next.join("") !== fakeOtp) {
      setShake(true);
      setTimeout(() => { setShake(false); setOtp(["", "", "", "", "", ""]); otpRefs.current[0]?.focus(); }, 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#111b21",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{
        width: 380, padding: "48px 40px",
        background: "#1f2c34",
        borderRadius: 20,
        border: "1px solid #2a3942",
        animation: "fadeIn 0.5s ease",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #00C896, #00a87a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 30,
            boxShadow: "0 8px 24px rgba(0,200,150,0.3)",
          }}>🌊</div>
          <h1 style={{ color: "#e9edef", fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>ChatWave</h1>
          <p style={{ color: "#8696a0", fontSize: 13, marginTop: 4 }}>Komunikasi modern, lebih nyaman</p>
        </div>

        {step === "phone" && (
          <div style={{ animation: "slideInRight 0.3s ease" }}>
            <p style={{ color: "#e9edef", fontSize: 14, marginBottom: 20, textAlign: "center" }}>
              Masukkan nomor HP kamu untuk mulai
            </p>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#8696a0", fontSize: 14,
              }}>🇮🇩 +62</div>
              <input
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="812-3456-7890"
                style={{
                  width: "100%", padding: "14px 14px 14px 80px",
                  background: "#2a3942", border: "1px solid #3b4a54",
                  borderRadius: 12, color: "#e9edef", fontSize: 15,
                  fontFamily: "'JetBrains Mono', monospace", outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#00C896"}
                onBlur={e => e.target.style.borderColor = "#3b4a54"}
                onKeyDown={e => e.key === "Enter" && sendOtp()}
              />
            </div>
            <button onClick={sendOtp} disabled={loading || phone.length < 9} style={{
              width: "100%", padding: "14px",
              background: phone.length >= 9 ? "linear-gradient(135deg, #00C896, #00a87a)" : "#2a3942",
              border: "none", borderRadius: 12,
              color: phone.length >= 9 ? "#fff" : "#8696a0",
              fontSize: 15, fontWeight: 600, cursor: phone.length >= 9 ? "pointer" : "default",
              transition: "all 0.2s", fontFamily: "'Sora', sans-serif",
            }}>
              {loading ? "Mengirim OTP..." : "Kirim Kode OTP →"}
            </button>
            <p style={{ color: "#8696a0", fontSize: 11, textAlign: "center", marginTop: 16 }}>
              Demo: kode OTP adalah <span style={{ color: "#00C896", fontFamily: "monospace", fontWeight: 700 }}>123456</span>
            </p>
          </div>
        )}

        {step === "otp" && (
          <div style={{ animation: "slideInRight 0.3s ease" }}>
            <p style={{ color: "#e9edef", fontSize: 14, marginBottom: 6, textAlign: "center" }}>
              Kode dikirim ke <span style={{ color: "#00C896" }}>+62 {phone}</span>
            </p>
            <p style={{ color: "#8696a0", fontSize: 12, textAlign: "center", marginBottom: 28 }}>
              Demo: gunakan kode <span style={{ color: "#00C896", fontFamily: "monospace", fontWeight: 700 }}>123456</span>
            </p>
            <div style={{
              display: "flex", gap: 8, justifyContent: "center", marginBottom: 24,
              animation: shake ? "otpShake 0.4s ease" : "none",
            }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  value={d} onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i - 1]?.focus(); }}
                  maxLength={1} style={{
                    width: 44, height: 52, textAlign: "center",
                    background: "#2a3942", border: `1.5px solid ${d ? "#00C896" : "#3b4a54"}`,
                    borderRadius: 10, color: "#e9edef", fontSize: 22,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    outline: "none", transition: "border-color 0.15s",
                  }}
                />
              ))}
            </div>
            {loading && <p style={{ color: "#00C896", textAlign: "center", fontSize: 13 }}>Memverifikasi...</p>}
            <div style={{ textAlign: "center", marginTop: 8 }}>
              {countdown > 0
                ? <span style={{ color: "#8696a0", fontSize: 13 }}>Kirim ulang dalam {countdown}s</span>
                : <button onClick={() => { setCountdown(60); }} style={{ background: "none", border: "none", color: "#00C896", cursor: "pointer", fontSize: 13, fontFamily: "'Sora', sans-serif" }}>Kirim ulang kode</button>
              }
            </div>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign: "center", animation: "greenPop 0.5s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#00C896", fontWeight: 600, fontSize: 16 }}>Berhasil masuk!</p>
            <p style={{ color: "#8696a0", fontSize: 13, marginTop: 4 }}>Membuka ChatWave...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// CALL UI
function CallScreen({ contact, type, onEnd }) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [camOff, setCamOff] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: type === "video" ? "#0a0a0a" : `linear-gradient(160deg, #0d1f1a 0%, #111b21 50%, #0a1520 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Sora', sans-serif",
      animation: "fadeIn 0.3s ease",
    }}>
      {type === "video" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #0d2b22 0%, #1a1630 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 80, opacity: 0.3,
        }}>📹</div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
        <div style={{ animation: "ringPulse 2s infinite", borderRadius: "50%" }}>
          <Avatar initials={contact.avatar} color={contact.color} size={100} />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#e9edef", fontSize: 26, fontWeight: 700 }}>{contact.name}</h2>
          <p style={{ color: "#00C896", fontSize: 14, marginTop: 6 }}>
            {type === "video" ? "📹 Video Call" : "📞 Voice Call"} · {fmt(duration)}
          </p>
        </div>

        {type === "video" && (
          <div style={{
            position: "absolute", top: 24, right: 24,
            width: 100, height: 140, borderRadius: 14,
            background: "#2a3942", border: "2px solid #3b4a54",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, overflow: "hidden",
          }}>
            {camOff ? "🚫" : "🤳"}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", gap: 20, padding: "40px 60px",
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)",
        width: "100%", justifyContent: "center", flexWrap: "wrap",
      }}>
        {[
          { icon: muted ? "🔇" : "🎙️", label: muted ? "Unmute" : "Mute", action: () => setMuted(m => !m), active: muted },
          { icon: speaker ? "🔊" : "🔈", label: "Speaker", action: () => setSpeaker(s => !s), active: !speaker },
          ...(type === "video" ? [{ icon: camOff ? "📷" : "📹", label: "Kamera", action: () => setCamOff(c => !c), active: camOff }] : []),
          { icon: "📵", label: "Tutup", action: onEnd, bg: "#ff4444", noToggle: true },
        ].map(({ icon, label, action, active, bg, noToggle }) => (
          <div key={label} onClick={action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: bg || (active ? "#2a3942" : "rgba(255,255,255,0.1)"),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, transition: "all 0.2s",
              border: active && !noToggle ? "2px solid #8696a0" : "2px solid transparent",
            }}>{icon}</div>
            <span style={{ color: "#8696a0", fontSize: 11 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// STATUS VIEWER
function StatusViewer({ status, onClose }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => { if (p >= 100) { onClose(); return 0; } return p + 1; });
    }, 50);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: status.bg,
      display: "flex", flexDirection: "column",
      fontFamily: "'Sora', sans-serif",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{ padding: "16px 16px 8px", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ height: 3, background: "#ffffff33", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#fff", transition: "width 0.05s linear" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
          <Avatar initials={status.avatar} color={status.color} size={36} />
          <div>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{status.name}</p>
            <p style={{ color: "#ffffff99", fontSize: 11 }}>{status.time}</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🌊</div>
          <p style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>ChatWave Story</p>
          <p style={{ color: "#ffffff99", fontSize: 13, marginTop: 4 }}>Ini contoh status/story demo</p>
        </div>
      </div>
    </div>
  );
}

// MAIN APP
export default function ChatWave() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState({});
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [callType, setCallType] = useState(null);
  const [viewStatus, setViewStatus] = useState(null);
  const [tab, setTab] = useState("chats"); // chats | status | calls
  const [searchQ, setSearchQ] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeContact]);

  // Fake typing indicator
  useEffect(() => {
    if (!activeContact) return;
    const t = setTimeout(() => {
      setTyping(tp => ({ ...tp, [activeContact]: true }));
      setTimeout(() => setTyping(tp => ({ ...tp, [activeContact]: false })), 2500);
    }, Math.random() * 8000 + 4000);
    return () => clearTimeout(t);
  }, [activeContact, messages]);

  // Recording timer
  useEffect(() => {
    if (recording) {
      const t = setInterval(() => setRecTime(r => r + 1), 1000);
      return () => clearInterval(t);
    } else setRecTime(0);
  }, [recording]);

  const sendMessage = () => {
    if (!input.trim() || !activeContact) return;
    const msg = { id: Date.now(), from: "me", text: input.trim(), time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), status: "sent", type: "text" };
    setMessages(m => ({ ...m, [activeContact]: [...(m[activeContact] || []), msg] }));
    setInput("");
    setTimeout(() => {
      setMessages(m => ({
        ...m,
        [activeContact]: m[activeContact].map(x => x.id === msg.id ? { ...x, status: "delivered" } : x),
      }));
    }, 1000);
    setTimeout(() => {
      setMessages(m => ({
        ...m,
        [activeContact]: m[activeContact].map(x => x.id === msg.id ? { ...x, status: "read" } : x),
      }));
    }, 2500);
  };

  const sendVoice = () => {
    if (!activeContact) return;
    const dur = `0:${String(recTime).padStart(2, "0")}`;
    const msg = { id: Date.now(), from: "me", audio: true, duration: dur, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), status: "sent", type: "voice" };
    setMessages(m => ({ ...m, [activeContact]: [...(m[activeContact] || []), msg] }));
    setRecording(false);
  };

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.phone.includes(searchQ)
  );

  if (!loggedIn) return (
    <>
      <style>{css}</style>
      <LoginScreen onLogin={() => setLoggedIn(true)} />
    </>
  );

  if (callType && activeContact) {
    const contact = CONTACTS.find(c => c.id === activeContact);
    return (
      <>
        <style>{css}</style>
        <CallScreen contact={contact} type={callType} onEnd={() => setCallType(null)} />
      </>
    );
  }

  if (viewStatus) {
    return (
      <>
        <style>{css}</style>
        <StatusViewer status={viewStatus} onClose={() => setViewStatus(null)} />
      </>
    );
  }

  const activeContactData = CONTACTS.find(c => c.id === activeContact);
  const chatMessages = activeContact ? messages[activeContact] || [] : [];

  return (
    <>
      <style>{css}</style>
      <div style={{
        display: "flex", height: "100vh", background: "#111b21",
        fontFamily: "'Sora', sans-serif", overflow: "hidden",
      }}>
        {/* ── SIDEBAR ── */}
        <div style={{
          width: 360, flexShrink: 0, borderRight: "1px solid #2a3942",
          display: "flex", flexDirection: "column", background: "#111b21",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", background: "#1f2c34" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>🌊</div>
                <span style={{ color: "#e9edef", fontSize: 18, fontWeight: 700 }}>ChatWave</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["🔔", "⚙️"].map(ico => (
                  <button key={ico} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4 }}>{ico}</button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Cari chat atau kontak..."
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  background: "#2a3942", border: "none", borderRadius: 10,
                  color: "#e9edef", fontSize: 13, outline: "none",
                  fontFamily: "'Sora', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #2a3942" }}>
            {[["chats", "💬 Chat"], ["status", "⭕ Status"], ["calls", "📞 Panggilan"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: "12px 8px",
                background: "none", border: "none",
                borderBottom: tab === key ? "2px solid #00C896" : "2px solid transparent",
                color: tab === key ? "#00C896" : "#8696a0",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
              }}>{label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tab === "chats" && filteredContacts.map(c => (
              <div key={c.id} onClick={() => setActiveContact(c.id)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", cursor: "pointer",
                background: activeContact === c.id ? "#2a3942" : "transparent",
                transition: "background 0.15s",
                borderBottom: "1px solid #1f2c3420",
              }}
                onMouseEnter={e => { if (activeContact !== c.id) e.currentTarget.style.background = "#1f2c34"; }}
                onMouseLeave={e => { if (activeContact !== c.id) e.currentTarget.style.background = "transparent"; }}
              >
                <Avatar initials={c.avatar} color={c.color} size={48} online={c.online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: "#e9edef", fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                    <span style={{ color: "#8696a0", fontSize: 11, flexShrink: 0 }}>
                      {(messages[c.id] || []).at(-1)?.time || ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <span style={{ color: "#8696a0", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {typing[c.id] ? <span style={{ color: "#00C896" }}>Mengetik...</span> : c.lastMsg}
                    </span>
                    {c.unread > 0 && (
                      <span style={{
                        background: "#00C896", color: "#111", borderRadius: 10,
                        padding: "1px 6px", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                      }}>{c.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {tab === "status" && (
              <div style={{ padding: 16 }}>
                {/* My status */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: "#8696a0", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Status Saya</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#1f2c34", borderRadius: 12, cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <Avatar initials="YO" color="#00C896" size={48} />
                      <div style={{
                        position: "absolute", bottom: -2, right: -2,
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#00C896", border: "2px solid #111b21",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#fff", fontWeight: 700,
                      }}>+</div>
                    </div>
                    <div>
                      <p style={{ color: "#e9edef", fontSize: 14, fontWeight: 600 }}>Status Saya</p>
                      <p style={{ color: "#8696a0", fontSize: 12 }}>Tambah status baru</p>
                    </div>
                  </div>
                </div>

                <p style={{ color: "#8696a0", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Update Terbaru</p>
                {STATUSES.map(s => (
                  <div key={s.id} onClick={() => setViewStatus(s)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", background: "#1f2c34", borderRadius: 12,
                    marginBottom: 8, cursor: "pointer",
                  }}>
                    <div style={{
                      padding: 2,
                      borderRadius: "50%",
                      background: s.seen ? "transparent" : `conic-gradient(${s.color} 0deg, ${s.color} 360deg)`,
                      border: s.seen ? "2px solid #3b4a54" : "none",
                    }}>
                      <Avatar initials={s.avatar} color={s.color} size={44} />
                    </div>
                    <div>
                      <p style={{ color: "#e9edef", fontSize: 14, fontWeight: 600 }}>{s.name}</p>
                      <p style={{ color: "#8696a0", fontSize: 12 }}>{s.time}</p>
                    </div>
                    {!s.seen && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C896", marginLeft: "auto" }} />}
                  </div>
                ))}
              </div>
            )}

            {tab === "calls" && (
              <div style={{ padding: 16 }}>
                {CONTACTS.slice(0, 4).map((c, i) => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", background: "#1f2c34", borderRadius: 12, marginBottom: 8,
                  }}>
                    <Avatar initials={c.avatar} color={c.color} size={44} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#e9edef", fontSize: 14, fontWeight: 600 }}>{c.name}</p>
                      <p style={{ color: i % 2 === 0 ? "#00C896" : "#ff6b6b", fontSize: 12 }}>
                        {i % 2 === 0 ? "📞 Panggilan masuk" : "📞 Panggilan keluar"} · {["kemarin", "Senin", "2 jam lalu", "Minggu"][i]}
                      </p>
                    </div>
                    <button onClick={() => { setActiveContact(c.id); setCallType("voice"); }} style={{
                      background: "#2a3942", border: "none", borderRadius: "50%",
                      width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 16,
                    }}>📞</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CHAT PANEL ── */}
        {activeContact ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0b141a" }}>
            {/* Chat header */}
            <div style={{
              padding: "12px 20px", background: "#1f2c34",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid #2a3942",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setActiveContact(null)} style={{ background: "none", border: "none", color: "#8696a0", cursor: "pointer", fontSize: 18, padding: "0 4px 0 0" }}>←</button>
                <Avatar initials={activeContactData.avatar} color={activeContactData.color} size={42} online={activeContactData.online} />
                <div>
                  <p style={{ color: "#e9edef", fontWeight: 600, fontSize: 15 }}>{activeContactData.name}</p>
                  <p style={{ color: typing[activeContact] ? "#00C896" : "#8696a0", fontSize: 12, animation: typing[activeContact] ? "pulse 1s infinite" : "none" }}>
                    {typing[activeContact] ? "Mengetik..." : activeContactData.online ? "Online" : activeContactData.lastSeen}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { icon: "📹", action: () => setCallType("video") },
                  { icon: "📞", action: () => setCallType("voice") },
                  { icon: "⋮", action: () => {} },
                ].map(({ icon, action }) => (
                  <button key={icon} onClick={action} style={{
                    background: "none", border: "none", fontSize: 20,
                    cursor: "pointer", padding: "4px 8px",
                    borderRadius: 8, transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2a3942"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >{icon}</button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 60px",
              background: "#0b141a",
              backgroundImage: "radial-gradient(circle at 20% 80%, rgba(0,200,150,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,100,200,0.03) 0%, transparent 60%)",
            }}>
              {chatMessages.map((msg, idx) => {
                const isMe = msg.from === "me";
                return (
                  <div key={msg.id} style={{
                    display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: 4, animation: idx === chatMessages.length - 1 ? (isMe ? "slideInRight 0.2s ease" : "slideInLeft 0.2s ease") : "none",
                  }}>
                    <div style={{
                      maxWidth: "65%", padding: msg.type === "voice" ? "10px 14px" : "8px 12px",
                      background: isMe ? "#005c4b" : "#1f2c34",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}>
                      {msg.type === "voice" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: isMe ? "#00C896" : "#8696a0",
                            border: "none", cursor: "pointer", fontSize: 14,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>▶</button>
                          <WaveForm playing={false} />
                          <span style={{ color: "#8696a0", fontSize: 11, flexShrink: 0 }}>{msg.duration}</span>
                        </div>
                      ) : (
                        <p style={{ color: "#e9edef", fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>{msg.text}</p>
                      )}
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <span style={{ color: "#8696a0", fontSize: 10 }}>{msg.time}</span>
                        {isMe && <Tick status={msg.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing[activeContact] && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 4, animation: "fadeIn 0.2s ease" }}>
                  <div style={{ background: "#1f2c34", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map(delay => (
                      <div key={delay} style={{ width: 8, height: 8, borderRadius: "50%", background: "#8696a0", animation: `dotBounce 1.4s ease-in-out ${delay}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{
              padding: "12px 20px", background: "#1f2c34",
              display: "flex", alignItems: "center", gap: 10,
              borderTop: "1px solid #2a3942",
            }}>
              <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", flexShrink: 0 }}>😊</button>
              <button style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", flexShrink: 0 }}>📎</button>

              {recording ? (
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 10,
                  background: "#2a3942", borderRadius: 24, padding: "10px 16px",
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff4444", animation: "recordPulse 1s infinite", flexShrink: 0 }} />
                  <WaveForm playing={true} />
                  <span style={{ color: "#ff6b6b", fontFamily: "monospace", fontSize: 13 }}>
                    0:{String(recTime).padStart(2, "0")}
                  </span>
                </div>
              ) : (
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ketik pesan..."
                  style={{
                    flex: 1, padding: "12px 16px",
                    background: "#2a3942", border: "none", borderRadius: 24,
                    color: "#e9edef", fontSize: 14, outline: "none",
                    fontFamily: "'Sora', sans-serif",
                  }}
                />
              )}

              {input.trim() ? (
                <button onClick={sendMessage} style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #00C896, #00a87a)",
                  border: "none", cursor: "pointer", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,200,150,0.3)",
                  transition: "transform 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >➤</button>
              ) : (
                <button
                  onMouseDown={() => setRecording(true)}
                  onMouseUp={() => recording && sendVoice()}
                  onTouchStart={() => setRecording(true)}
                  onTouchEnd={() => recording && sendVoice()}
                  onClick={() => !recording && setRecording(true)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: recording ? "linear-gradient(135deg, #ff4444, #cc0000)" : "linear-gradient(135deg, #00C896, #00a87a)",
                    border: "none", cursor: "pointer", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: recording ? "0 4px 12px rgba(255,68,68,0.3)" : "0 4px 12px rgba(0,200,150,0.3)",
                    animation: recording ? "recordPulse 1s infinite" : "none",
                  }}
                >{recording ? "⏹" : "🎤"}</button>
              )}
              {recording && (
                <button onClick={() => setRecording(false)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#ff6b6b",
                }}>✕</button>
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "#0b141a", gap: 16,
          }}>
            <div style={{ fontSize: 80, opacity: 0.3 }}>🌊</div>
            <h2 style={{ color: "#e9edef", fontSize: 24, fontWeight: 700, opacity: 0.5 }}>ChatWave</h2>
            <p style={{ color: "#8696a0", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
              Pilih chat di kiri untuk mulai bercakap-cakap.<br />
              Pesan kamu terenkripsi & aman. 🔒
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {["💬 Chat", "🎤 Voice Note", "📞 Call", "⭕ Status"].map(f => (
                <span key={f} style={{
                  padding: "6px 12px", borderRadius: 20,
                  background: "#1f2c34", border: "1px solid #2a3942",
                  color: "#8696a0", fontSize: 12,
                }}>{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
