"use client";

export const AuthGlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

    :root {
      --primary: #E8572A;
      --primary-light: #FF7A4D;
      --primary-dark: #C43E18;
      --gold: #F5A623;
      --gold-light: #FFD27A;
      --green: #2D9E6B;
      --bg: #FEFCF9;
      --bg-warm: #FDF6EF;
      --bg-card: #FFFFFF;
      --border: rgba(0,0,0,0.07);
      --border-focus: rgba(232,87,42,0.4);
      --text-primary: #1A1208;
      --text-secondary: #5C4A38;
      --text-muted: #9C8B78;
      --font-display: 'Cormorant Garamond', serif;
      --font-body: 'DM Sans', sans-serif;
      --shadow-sm: 0 2px 8px rgba(26,18,8,0.06);
      --shadow-md: 0 8px 24px rgba(26,18,8,0.08);
      --shadow-lg: 0 24px 60px rgba(26,18,8,0.13);
      --shadow-orange: 0 8px 30px rgba(232,87,42,0.22);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body, #root {
      font-family: var(--font-body);
      background: var(--bg-warm);
      color: var(--text-primary);
      overflow-x: hidden;
      min-height: 100vh;
    }

    .gradient-text {
      background: linear-gradient(135deg, var(--primary) 0%, var(--gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    @keyframes pageIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes panelSlideLeft { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes panelSlideRight { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes floatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes floatYAlt { 0%,100% { transform: translateY(-8px); } 50% { transform: translateY(6px); } }
    @keyframes orb1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.06); } 66% { transform: translate(-20px,15px) scale(0.97); } }
    @keyframes orb2 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-25px,18px) scale(1.04); } 66% { transform: translate(20px,-12px) scale(0.98); } }
    @keyframes orb3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(15px,15px); } }
    @keyframes dashCard { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes notifPop { 0% { opacity: 0; transform: translateX(20px) scale(0.9); } 70% { transform: translateX(-3px) scale(1.02); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
    @keyframes progressBar { from { width: 0%; } to { width: var(--bar-w); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
    @keyframes ripple { from { transform: scale(0.8); opacity: 0.7; } to { transform: scale(2.4); opacity: 0; } }
    @keyframes stepIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes checkmark { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
    @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .tt-input {
      width: 100%; padding: 14px 16px; border-radius: 14px;
      border: 1.5px solid var(--border); background: var(--bg-warm);
      font-family: var(--font-body); font-size: 14px; color: var(--text-primary);
      outline: none; transition: border-color 0.25s, box-shadow 0.25s, background 0.2s;
    }
    .tt-input::placeholder { color: var(--text-muted); }
    .tt-input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(232,87,42,0.08); }
    .tt-input.has-icon { padding-left: 44px; }

    .tt-btn-primary {
      width: 100%; padding: 15px; border-radius: 14px; border: none;
      background: linear-gradient(135deg, var(--primary) 0%, #F06A35 60%, var(--gold) 100%);
      background-size: 200% auto; color: white; font-family: var(--font-body);
      font-size: 15px; font-weight: 600; cursor: pointer; position: relative;
      overflow: hidden; transition: background-position 0.4s ease, transform 0.2s, box-shadow 0.2s;
      box-shadow: var(--shadow-orange);
    }
    .tt-btn-primary:hover { background-position: right center; transform: translateY(-1px); box-shadow: 0 12px 36px rgba(232,87,42,0.32); }
    .tt-btn-primary:active { transform: scale(0.98); }
    .tt-btn-primary .ripple-el { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.35); animation: ripple 0.55s ease-out forwards; pointer-events: none; }

    .tt-social-btn {
      flex: 1; padding: 11px 10px; border-radius: 12px; border: 1.5px solid var(--border);
      background: white; font-family: var(--font-body); font-size: 13px; font-weight: 500;
      color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 8px; transition: all 0.2s;
    }
    .tt-social-btn:hover { border-color: rgba(232,87,42,0.3); color: var(--primary); transform: translateY(-1px); box-shadow: var(--shadow-sm); }

    .tt-link { color: var(--primary); font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
    .tt-link:hover { opacity: 0.75; text-decoration: underline; }

    .strength-bar { height: 3px; border-radius: 2px; flex: 1; background: var(--border); overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease, background 0.3s; }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(232,87,42,0.25); border-radius: 3px; }
    .page-wrap { animation: pageIn 0.5s ease; }
  `}</style>
);
