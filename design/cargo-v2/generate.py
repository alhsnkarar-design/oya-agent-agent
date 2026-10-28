# Cargo puzzle — design v2: calm, premium, minimal
I = {
 'pause':'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
 'undo':'<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
 'eye':'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
 'anchor':'<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
 'box':'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
 'home':'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
 'map':'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
 'bag':'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
 'tool':'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
 'star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
 'cal':'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
 'award':'<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
 'gift':'<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
 'lock':'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
 'check':'<polyline points="20 6 9 17 4 12"/>',
 'back':'<polyline points="9 18 15 12 9 6"/>',
 'chev':'<polyline points="15 18 9 12 15 6"/>',
 'globe':'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
 'vol':'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
 'phone':'<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
 'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 'share':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
 'playc':'<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
 'zap':'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
 'clock':'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
 'search':'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
 'feather':'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
 'bars':'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
 'coin':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
 'flame':'<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-8z"/>',
 'alert':'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
 'sail':'<path d="M12 2v16"/><path d="M12 3l7 12h-7"/><path d="M12 6l-6 9h6"/><path d="M3 19c3 2 15 2 18 0"/>',
}
def ic(n, s=22, sw=2, c='currentColor', fill='none'):
    return f'<svg class="ico" width="{s}" height="{s}" viewBox="0 0 24 24" fill="{fill}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{I[n]}</svg>'
P = {1:('#ef6f5e','●'),2:('#4f7fd1','▲'),3:('#e7ad3c','■'),4:('#5fae8a','◆'),5:('#8d6cc8','⬢')}
def ct(p, w=None, cls='', style=''):
    c,sym=P[p]
    wt=f'<b class="wt">{w}t</b>' if w else ''
    return f'<div class="ct {cls}" style="--c:{c};{style}"><span class="sym">{sym}</span>{wt}</div>'
def col(stack,h,cls=''):
    return f'<div class="col {cls}">'+''.join(stack)+''.join('<div class="slot"></div>' for _ in range(h-len(stack)))+'</div>'
def ship(cols, top, scale=1, rot=0, bridge=True):
    br='<div class="bridge"><i></i><i></i><i></i><span class="mast"></span></div>' if bridge else ''
    return f'<div class="ship" style="top:{top}px;transform:translateX(-50%) scale({scale}) rotate({rot}deg)"><div class="deck"><div class="cols">{"".join(cols)}</div>{br}</div><div class="hull"></div><div class="refl"></div></div>'
def route(ports,cur=0):
    h='<div class="route">'
    for i,p in enumerate(ports):
        c,s=P[p]
        if i: h+='<i class="rl"></i>'
        h+=f'<span class="rp{" now" if i==cur else ""}" style="--c:{c}"><b>{s}</b><small>{i+1}</small></span>'
    return h+'</div>'
def level(offset, label='متوازنة'):
    return f'<div class="level"><div class="lv-tube"><i class="lv-mark"></i><i class="lv-mark r"></i><i class="lv-bub" style="left:calc(50% + {offset}px)"></i></div><span class="lv-t">{label}</span></div>'

css=r'''
@font-face { font-family: "Cairo"; src: url("../mockups/fonts/Cairo.ttf"); font-weight: 200 1000; }
@font-face { font-family: "Noto Sans Devanagari"; src: url("../mockups/fonts/NotoSansDevanagari.ttf"); font-weight: 100 900; }
@font-face { font-family: "Noto Sans Bengali"; src: url("../mockups/fonts/NotoSansBengali.ttf"); font-weight: 100 900; }
@font-face { font-family: "Noto Sans Telugu"; src: url("../mockups/fonts/NotoSansTelugu.ttf"); font-weight: 100 900; }
:root { --navy:#14324a; --navy2:#24506f; --sea1:#3f8fb3; --sea2:#1c5571; --sand:#f6efe4; --paper:#fffaf2; --line:#e8ddcb;
  --coral:#ef6f5e; --mustard:#e7ad3c; --sage:#5fae8a; --muted:#7b8794; --ink:#14324a; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Cairo", sans-serif; background: #e9e2d6; color: var(--ink); padding: 56px; }
.ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }
.ico { display: block; flex-shrink: 0; }
.page-head { text-align: center; margin-bottom: 44px; }
.page-head h1 { font-size: 46px; font-weight: 800; letter-spacing: -.5px; }
.page-head p { font-size: 19px; color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(4, 390px); gap: 52px 40px; justify-content: center; }
.cell figcaption { text-align: center; margin-top: 16px; font-size: 18px; font-weight: 800; }
.cell figcaption span { display: block; font-size: 14px; font-weight: 500; color: var(--muted); }
.phone { width: 390px; height: 844px; border-radius: 46px; overflow: hidden; position: relative; background: var(--sand);
  box-shadow: 0 0 0 9px #fff, 0 0 0 10px #d8cfc0, 0 30px 60px rgba(20,50,74,.22); }
/* scene */
.sky { position: absolute; inset: 0; background: linear-gradient(180deg, #f8f1e6 0%, #fbe9d6 46%, #f5d9bd 58%); }
.sea { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, #4b98b9 0%, var(--sea1) 20%, var(--sea2) 100%); }
.sea::before { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(180deg, rgba(255,255,255,.07) 0 2px, transparent 2px 14px); }
.far { position: absolute; left: 0; right: 0; height: 40px; opacity: .35; }
.far i { position: absolute; bottom: 0; background: #7c8ea0; }
.sun { position: absolute; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, #ffd9a8, rgba(255,217,168,0) 70%); }
/* top bar */
.top { position: absolute; top: 54px; left: 18px; right: 18px; display: flex; align-items: center; gap: 10px; z-index: 9; }
.rbtn { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.9); display: grid; place-items: center; color: var(--navy); box-shadow: 0 4px 14px rgba(20,50,74,.12); }
.chip { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.9); border-radius: 22px; height: 40px; padding: 0 14px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(20,50,74,.10); }
.chip .ico { color: var(--mustard); }
.sp { flex: 1; }
.lvinfo { text-align: center; line-height: 1.15; }
.lvinfo small { display: block; font-size: 12px; color: var(--muted); font-weight: 700; letter-spacing: .5px; }
.lvinfo b { font-size: 20px; }
/* route */
.route { position: absolute; top: 112px; left: 0; right: 0; display: flex; justify-content: center; align-items: center; z-index: 8; }
.rl { width: 34px; height: 2px; background: repeating-linear-gradient(90deg, #b9ad9a 0 4px, transparent 4px 8px); }
.rp { position: relative; width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 2.5px solid var(--c); color: var(--c); display: grid; place-items: center; }
.rp b { font-size: 13px; }
.rp small { position: absolute; bottom: -17px; font-size: 10px; color: var(--muted); font-weight: 800; }
.rp.now { background: var(--c); color: #fff; box-shadow: 0 0 0 5px color-mix(in srgb, var(--c) 22%, transparent); }
/* spirit level */
.level { position: absolute; top: 168px; left: 50%; transform: translateX(-50%); z-index: 8; text-align: center; }
.lv-tube { position: relative; width: 190px; height: 22px; border-radius: 11px; background: linear-gradient(180deg, #e9f4d6, #cfe6a9); box-shadow: inset 0 0 0 2px rgba(20,50,74,.25), inset 0 2px 4px rgba(0,0,0,.08); }
.lv-mark { position: absolute; top: 3px; bottom: 3px; left: calc(50% - 16px); width: 2px; background: rgba(20,50,74,.45); }
.lv-mark.r { left: calc(50% + 14px); }
.lv-bub { position: absolute; top: 4px; width: 26px; height: 14px; margin-left: -13px; border-radius: 7px; background: radial-gradient(ellipse at 40% 30%, #fff, #f3f8ea 60%, #dbe9c2); box-shadow: 0 0 0 1px rgba(20,50,74,.15); }
.lv-t { font-size: 11px; font-weight: 800; color: var(--muted); }
.level.warn .lv-tube { background: linear-gradient(180deg, #fde3cf, #f6c2a0); }
.level.warn .lv-t { color: var(--coral); }
/* ship */
.ship { position: absolute; left: 50%; z-index: 4; display: flex; flex-direction: column; align-items: center; transform-origin: center bottom; }
.deck { display: flex; align-items: flex-end; gap: 6px; padding: 0 10px; }
.cols { display: flex; gap: 3px; align-items: flex-end; }
.col { display: flex; flex-direction: column-reverse; gap: 2px; }
.slot { width: 46px; height: 32px; border-radius: 5px; border: 1.5px dashed rgba(20,50,74,.22); }
.col.target .slot:first-child, .col.target > .slot:nth-last-child(1) { }
.bridge { position: relative; width: 42px; height: 58px; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, #fff, #ece4d6); box-shadow: inset 0 -6px 0 #ddd2bf; display: flex; flex-direction: column; gap: 6px; padding: 9px 6px; }
.bridge i { height: 5px; border-radius: 2px; background: #9fc3d6; }
.mast { position: absolute; top: -26px; left: 19px; width: 3px; height: 26px; background: var(--navy2); }
.hull { width: calc(100% + 26px); height: 50px; background: linear-gradient(180deg, var(--navy) 0 62%, #c95b4c 62%); clip-path: polygon(0 0, 100% 0, 95% 100%, 4% 100%); border-top: 4px solid #fff; }
.refl { width: 92%; height: 30px; margin-top: 2px; background: linear-gradient(180deg, rgba(20,50,74,.35), transparent); filter: blur(3px); border-radius: 50%; }
/* containers */
.ct { position: relative; width: 46px; height: 32px; border-radius: 5px; background:
  repeating-linear-gradient(90deg, rgba(255,255,255,.14) 0 2px, transparent 2px 8px), linear-gradient(180deg, color-mix(in srgb, var(--c) 82%, #fff), var(--c) 60%, color-mix(in srgb, var(--c) 85%, #000));
  box-shadow: 0 2px 0 rgba(0,0,0,.12); display: grid; place-items: center; }
.ct .sym { color: rgba(255,255,255,.95); font-size: 13px; font-weight: 900; line-height: 1; }
.ct .wt { position: absolute; top: 1px; right: 4px; font-size: 9px; color: rgba(255,255,255,.95); font-weight: 900; direction: ltr; }
.ct.err { box-shadow: 0 0 0 2.5px #fff, 0 0 0 5px var(--coral); }
.ct.held { box-shadow: 0 14px 18px rgba(20,50,74,.28); transform: rotate(-3deg); }
.ct.reefer::after { content: ""; position: absolute; left: 4px; bottom: 4px; width: 6px; height: 6px; border-radius: 50%; background: #bfe9ff; box-shadow: 0 0 0 2px rgba(255,255,255,.6); }
.ghost { width: 46px; height: 32px; border-radius: 5px; border: 2px solid var(--c); background: color-mix(in srgb, var(--c) 18%, transparent); }
.cable { position: absolute; width: 1.5px; background: var(--navy); z-index: 6; }
/* dock sheet */
.sheet { position: absolute; left: 0; right: 0; bottom: 0; background: var(--paper); border-radius: 28px 28px 0 0; box-shadow: 0 -10px 30px rgba(20,50,74,.14); z-index: 9; padding: 14px 18px 0; }
.sheet .grab { width: 40px; height: 4px; border-radius: 2px; background: var(--line); margin: 0 auto 10px; }
.sh-row { display: flex; align-items: center; justify-content: space-between; }
.sh-lbl { font-size: 12px; font-weight: 800; color: var(--muted); letter-spacing: .3px; }
.dockrow { display: flex; gap: 8px; justify-content: center; align-items: center; padding: 12px 0 14px; border-bottom: 1px solid var(--line); }
.tmp { width: 46px; height: 32px; border-radius: 5px; border: 1.5px dashed #c9bda9; display: grid; place-items: center; color: #b4a690; }
.tools { display: flex; align-items: center; gap: 10px; padding: 14px 0 26px; }
.tool { position: relative; width: 50px; height: 50px; border-radius: 16px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; color: var(--navy); }
.tool .n { position: absolute; top: -6px; left: -6px; min-width: 20px; height: 20px; border-radius: 10px; background: var(--navy); color: #fff; font-size: 11px; font-weight: 800; display: grid; place-items: center; padding: 0 5px; }
.go { flex: 1; height: 54px; border-radius: 18px; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 18px; }
.go.off { background: #d9d1c3; color: #8f8573; }
.go small { font-size: 12px; font-weight: 700; opacity: .85; }
/* toast */
.toast { position: absolute; left: 24px; right: 24px; z-index: 10; background: #fff; border-radius: 16px; padding: 10px 14px; display: flex; gap: 10px; align-items: center; box-shadow: 0 10px 30px rgba(20,50,74,.18); font-size: 13.5px; font-weight: 700; }
.toast .ico { color: var(--coral); }
/* generic */
.h1 { position: absolute; top: 112px; right: 24px; left: 24px; font-size: 30px; font-weight: 800; letter-spacing: -.3px; }
.h1 small { display: block; font-size: 14px; font-weight: 600; color: var(--muted); letter-spacing: 0; margin-top: 2px; }
.card { background: #fff; border-radius: 22px; box-shadow: 0 8px 24px rgba(20,50,74,.08); }
.btn { height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 17px; }
.b-navy { background: var(--navy); color: #fff; }
.b-coral { background: var(--coral); color: #fff; }
.b-ghost { background: transparent; color: var(--navy); border: 1.5px solid var(--line); }
.b-ad { background: #fff; color: var(--navy); border: 1.5px solid var(--line); }
.b-ad .tag { font-size: 11px; font-weight: 800; color: #fff; background: var(--sage); border-radius: 8px; padding: 1px 7px; }
.modal { position: absolute; left: 0; right: 0; bottom: 0; z-index: 20; background: var(--paper); border-radius: 30px 30px 0 0; padding: 26px 24px 34px; box-shadow: 0 -20px 50px rgba(20,50,74,.25); text-align: center; }
.shade { position: absolute; inset: 0; background: rgba(20,50,74,.32); z-index: 19; }
.modal h2 { font-size: 26px; font-weight: 800; }
.modal p { color: var(--muted); font-weight: 600; font-size: 15px; margin-top: 4px; }
.modal .btn { margin-top: 10px; }
.stars3 { display: flex; justify-content: center; gap: 10px; margin-bottom: 12px; }
.stars3 .ico { color: var(--mustard); }
.stats { display: flex; justify-content: center; gap: 10px; margin: 16px 0 8px; }
.stat2 { flex: 1; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 10px 0; }
.stat2 b { display: block; font-size: 20px; } .stat2 span { font-size: 12px; color: var(--muted); font-weight: 700; }
.nav { position: absolute; left: 18px; right: 18px; bottom: 26px; height: 66px; border-radius: 22px; background: rgba(255,255,255,.95); box-shadow: 0 10px 30px rgba(20,50,74,.14); display: flex; align-items: center; justify-content: space-around; z-index: 9; }
.nav a { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; font-weight: 700; color: var(--muted); }
.nav a.on { color: var(--navy); }
.nav a.on .ico { color: var(--coral); }
.listrow { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f1e9db; }
.listrow:last-child { border-bottom: 0; }
.listrow b { flex: 1; font-size: 15px; }
.listrow .v { font-size: 13px; color: var(--muted); font-weight: 700; }
.ibox { width: 38px; height: 38px; border-radius: 12px; background: var(--sand); display: grid; place-items: center; color: var(--navy); }
.tgl { width: 46px; height: 28px; border-radius: 14px; background: var(--sage); position: relative; }
.tgl::after { content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; }
.price { background: var(--navy); color: #fff; font-weight: 800; border-radius: 12px; padding: 7px 12px; font-size: 14px; direction: ltr; white-space: nowrap; }
'''
S=[]
def add(sid,t,sub,body,bg=''):
    S.append((t,sub,f'<div class="phone" id="s{sid}" {bg}>\n{body}\n</div>'))
def scene(horizon=430, sun=True):
    return f'''<div class="sky"></div>{'<div class="sun" style="top:'+str(horizon-110)+'px;left:40px"></div>' if sun else ''}
  <div class="far" style="top:{horizon-40}px"><i style="right:30px;width:4px;height:36px"></i><i style="right:30px;width:46px;height:3px;bottom:33px"></i><i style="right:70px;width:30px;height:14px"></i><i style="right:110px;width:40px;height:10px"></i><i style="right:160px;width:4px;height:28px"></i><i style="right:160px;width:34px;height:3px;bottom:25px"></i></div>
  <div class="sea" style="top:{horizon}px"></div>'''

# 1 splash
add(1,'البداية','هادئة وواضحة',f'''{scene(470)}
  <div style="position:absolute;top:150px;left:0;right:0;text-align:center;z-index:5">
    <div style="font-size:15px;font-weight:800;letter-spacing:6px;color:var(--muted)">CARGO PUZZLE</div>
    <div style="font-size:40px;font-weight:800;margin-top:6px;letter-spacing:-.5px">حمّل · وازن · أبحر</div>
  </div>
  {ship([col([ct(3),ct(1)],2),col([ct(2),ct(1)],2),col([ct(3),ct(2)],2)],372,1.15)}
  <div style="position:absolute;bottom:90px;left:110px;right:110px;height:4px;border-radius:2px;background:rgba(255,255,255,.3);z-index:5"><i style="display:block;width:62%;height:100%;border-radius:2px;background:#fff"></i></div>''')

# 2 home
add(2,'الرئيسية','مشهد واحد وزر واحد',f'''{scene(470)}
  <div class="top"><div class="chip">{ic('coin',18)}<span class="ltr">1,250</span></div><div class="chip">{ic('star',18)}86</div><div class="sp"></div><div class="rbtn">{ic('cal',20)}</div><div class="rbtn">{ic('gift',20)}</div></div>
  <div style="position:absolute;top:128px;left:24px;right:24px;z-index:5">
    <div style="font-size:13px;font-weight:800;color:var(--muted)">المستوى 2 · الأوزان</div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:6px"><div style="flex:1;height:6px;border-radius:3px;background:rgba(20,50,74,.12)"><i style="display:block;width:35%;height:100%;border-radius:3px;background:var(--navy)"></i></div><b style="font-size:13px" class="ltr">7 / 20</b></div>
  </div>
  {ship([col([ct(1,2),ct(1,1)],3),col([ct(3,4),ct(2,2),ct(1,3)],3),col([ct(2,1),ct(2,3)],3),col([ct(3,2)],3)],300,1.15)}
  <div style="position:absolute;bottom:118px;left:24px;right:24px;z-index:9"><div class="btn b-navy" style="height:64px;font-size:20px">{ic('playc',22)} العب المرحلة 27</div></div>
  <div class="nav"><a>{ic('bag',22)}المتجر</a><a>{ic('anchor',22)}الأسطول</a><a class="on">{ic('home',22)}الرئيسية</a><a>{ic('map',22)}المستويات</a><a>{ic('tool',22)}الميناء</a></div>''')

# 3 worlds
W=[('الميناء الهادئ','#f2c48d',20,60),('الأوزان','#e7ad3c',7,18),('الحاويات الكبيرة','#ef6f5e',0,0),('المبرّدات','#7fb5d9',0,0),('القابل للكسر','#9ad0c2',0,0),('البحر الهائج','#4f7fd1',0,0),('محطات التحميل','#5fae8a',0,0),('الأسطول','#8d6cc8',0,0),('الحمولة السائلة','#3f8fb3',0,0),('الرحلة الكبرى','#14324a',0,0)]
cards=''
for i,(n,c,d,s) in enumerate(W):
    lock=d==0
    pct=d*5
    cards+=f'''<div class="wc{' lk' if lock else ''}"><div class="wsw" style="background:linear-gradient(160deg,{c},color-mix(in srgb,{c} 70%,#14324a))"><span>{i+1:02d}</span>{ic('lock',16,2,'#fff') if lock else ''}</div><b>{n}</b><small>{'مقفل' if lock else f'{d}/20 · ★ {s}'}</small>{'' if lock else f'<i class="wp"><i style="width:{pct}%"></i></i>'}</div>'''
add(3,'المستويات','10 عوالم في شبكة نظيفة',f'''
  <style>.wg{{position:absolute;top:200px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px}}
  .wc{{background:#fff;border-radius:18px;padding:7px;height:114px;box-shadow:0 6px 18px rgba(20,50,74,.07)}} .wc.lk{{opacity:.55}}
  .wsw{{height:40px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;color:#fff;font-weight:800;font-size:20px}}
  .wc b{{display:block;font-size:14px;margin:5px 4px 0}} .wc small{{display:block;font-size:11.5px;color:var(--muted);font-weight:700;margin:0 4px}}
  .wp{{display:block;height:4px;border-radius:2px;background:#efe6d6;margin:6px 4px 2px}} .wp i{{display:block;height:100%;border-radius:2px;background:var(--navy)}}</style>
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip">{ic('star',18)}86</div></div>
  <div class="h1">المستويات<small>10 عوالم · 200 مرحلة</small></div>
  <div class="wg">{cards}</div>''')

# 4 stages
cells=''
for k in range(1,21):
    n=20+k
    if k<7: cells+=f'<div class="st d"><b>{n}</b><i>{"★★★" if k%3 else "★★☆"}</i></div>'
    elif k==7: cells+=f'<div class="st c"><b>{n}</b><i>التالية</i></div>'
    elif k==20: cells+=f'<div class="st big">{ic("award",20)}<b>40 · المرحلة الكبرى</b></div>'
    else: cells+=f'<div class="st l"><b>{n}</b></div>'
add(4,'مراحل المستوى','أرقام هادئة وتمييز واضح للمرحلة التالية',f'''
  <style>.sg{{position:absolute;top:210px;left:20px;right:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}}
  .st{{height:72px;border-radius:18px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(20,50,74,.06)}}
  .st b{{font-size:20px}} .st i{{font-style:normal;font-size:11px;color:var(--mustard);letter-spacing:1px}}
  .st.c{{background:var(--navy);color:#fff}} .st.c i{{color:#cfe1ee}} .st.l{{background:transparent;box-shadow:none;border:1.5px dashed #d7ccb9;color:#b3a891}}
  .st.big{{grid-column:span 4;flex-direction:row;gap:8px;height:60px;background:transparent;border:1.5px dashed #d7ccb9;color:#a3977f;box-shadow:none}} .st.big b{{font-size:15px}}</style>
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip">{ic('star',18)}18 / 60</div></div>
  <div class="h1">الأوزان<small>المستوى 2 · حاويات من 1 إلى 5 طن</small></div>
  <div class="sg">{cells}</div>''')

# 5 gameplay
def gtop(lv,mv): return f'<div class="top"><div class="rbtn">{ic("pause",18)}</div><div class="sp"></div><div class="lvinfo"><small>المرحلة {lv}</small><b class="ltr">{mv}</b></div><div class="sp"></div><div class="rbtn" style="color:var(--mustard)">{ic("star",20)}</div></div>'
def sheet(items, left, ready=False):
    return f'''<div class="sheet"><div class="grab"></div><div class="sh-row"><span class="sh-lbl">الرصيف</span><span class="sh-lbl">بقي {left}</span></div>
    <div class="dockrow">{items}<div class="tmp">{ic('box',16)}</div></div>
    <div class="tools"><div class="tool">{ic('undo',20)}<span class="n">2</span></div><div class="tool">{ic('box',20)}<span class="n">1</span></div><div class="tool">{ic('anchor',20)}<span class="n">1</span></div><div class="tool">{ic('eye',20)}<span class="n">3</span></div>
    <div class="go{'' if ready else ' off'}">{ic('sail',20)} أبحر</div></div></div>'''
add(5,'اللعب','شاشة نظيفة: السفينة في المركز وكل شيء آخر هادئ',f'''{scene(470)}
  {gtop(9,'6 / 12')}
  {route([1,2,3])}
  {level(9,'تميل قليلاً لليمين')}
  <div class="cable" style="top:206px;height:56px;left:256px"></div>
  <div style="position:absolute;top:262px;left:234px;z-index:6">{ct(3,cls='held')}</div>
  {ship([col([ct(3),ct(2)],4),col([ct(3),ct(2),ct(1)],4),col([ct(2),ct(1)],4),col([ct(3),ct(1),ct(1)],4)],300,1.15)}
  {sheet(ct(1)+ct(2),3)}''')

# 6 error
add(6,'اللعب: تنبيه قبل الإبحار','الخطأ يظهر بهدوء، دون ألوان صاخبة',f'''{scene(470)}
  {gtop(27,'9 / 14')}
  {route([1,2,3])}
  <div class="level warn" style="top:168px"><div class="lv-tube"><i class="lv-mark"></i><i class="lv-mark r"></i><i class="lv-bub" style="left:calc(50% + 62px)"></i></div><span class="lv-t">تميل لليمين أكثر من المسموح</span></div>
  <div class="toast" style="top:222px">{ic('alert',20)}<span>حاوية الميناء 3 فوق حاوية الميناء 1</span></div>
  {ship([col([ct(2,4),ct(1,2)],4),col([ct(3,5),ct(2,1),ct(1,3)],4),col([ct(1,2),ct(3,1,cls='err')],4),col([ct(2,3)],4),col([ct(3,2),ct(1,4)],4)],300,1.05)}
  {sheet(ct(2,2)+ct(1,5),2)}''')

# 7 success
add(7,'الإبحار الناجح','نتيجة واضحة وخيار إعلان اختياري',f'''{scene(360)}
  {ship([col([ct(3),ct(2),ct(1)],3),col([ct(3),ct(2),ct(1)],3),col([ct(3),ct(2),ct(1)],3)],150,.95)}
  <div class="shade" style="background:rgba(20,50,74,.12)"></div>
  <div class="modal"><div class="stars3">{ic('star',40,1.5,'var(--mustard)','var(--mustard)')}{ic('star',48,1.5,'var(--mustard)','var(--mustard)')}{ic('star',40,1.5,'var(--mustard)','var(--mustard)')}</div>
    <h2>رحلة موفقة</h2><p>المرحلة 27 · الحل الأمثل</p>
    <div class="stats"><div class="stat2"><b class="ltr">12</b><span>حركة</span></div><div class="stat2"><b class="ltr">+25</b><span>عملة</span></div><div class="stat2"><b class="ltr">+3</b><span>نجوم</span></div></div>
    <div class="btn b-ad">{ic('playc',20)} ضاعف العملات <span class="tag">إعلان اختياري</span></div>
    <div class="btn b-navy">المرحلة التالية</div></div>''')

# 8 fail
add(8,'السفينة مالت','شرح السبب ونصيحة، دون إحراج اللاعب',f'''{scene(360)}
  {ship([col([ct(2,4),ct(1,5)],4),col([ct(3,2)],4),col([ct(1,3),ct(2,5),ct(3,4)],4)],150,.9,8)}
  <div class="shade" style="background:rgba(20,50,74,.12)"></div>
  <div class="modal"><div style="width:56px;height:56px;border-radius:50%;background:#fde5df;color:var(--coral);display:grid;place-items:center;margin:0 auto 12px">{ic('alert',28)}</div>
    <h2>السفينة مالت</h2><p>الجانب الأيمن أثقل بـ<span class="ltr">7</span> أطنان.<br>جرّب نقل الحاويات الثقيلة إلى الوسط.</p>
    <div class="btn b-navy" style="margin-top:18px">{ic('undo',20)} أعد المحاولة</div>
    <div class="btn b-ad">{ic('playc',20)} تلميح مجاني <span class="tag">إعلان اختياري</span></div></div>''')

# 9 new element
add(9,'عنصر جديد','شرح عنصر المستوى في بطاقة واحدة',f'''{scene(470)}
  {gtop(61,'0 / 10')}
  {route([1,2])}
  {ship([col([],3),col([],3),col([],3)],320,1.15)}
  <div class="shade"></div>
  <div class="modal"><div style="font-size:12px;font-weight:800;letter-spacing:2px;color:var(--sage)">عنصر جديد</div>
    <div style="display:flex;justify-content:center;align-items:center;gap:14px;margin:18px 0">{ct(4,cls='reefer',style='transform:scale(1.5)')}<span style="font-size:22px;color:var(--muted);margin:0 10px">+</span><div style="width:48px;height:48px;border-radius:14px;background:#fff3d6;color:var(--mustard);display:grid;place-items:center">{ic('zap',24)}</div></div>
    <h2>الحاوية المبرّدة</h2><p>ضعها ملاصقة لمقبس الكهرباء طوال الرحلة.</p>
    <div class="btn b-navy" style="margin-top:18px">فهمت</div></div>''')

# 10 fleet
add(10,'الأسطول','سفينة واحدة كبيرة في كل بطاقة',f'''
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div></div>
  <div class="h1">الأسطول<small>سفن أكبر تُفتح مع تقدّمك</small></div>
  <div class="card" style="position:absolute;top:210px;left:20px;right:20px;height:330px;overflow:hidden">
    <div style="position:absolute;inset:0 0 40% 0;background:linear-gradient(180deg,#f8f1e6,#fbe9d6)"></div><div style="position:absolute;inset:60% 0 0 0;background:linear-gradient(180deg,var(--sea1),var(--sea2))"></div>
    {ship([col([ct(1)],2),col([ct(2),ct(3)],2),col([ct(3)],2),col([ct(1),ct(2)],2),col([ct(2)],2)],60,1)}
    <div style="position:absolute;bottom:18px;right:20px;color:#fff"><b style="font-size:20px">سفينة متوسطة</b><div style="font-size:13px;opacity:.85">حتى 5 أعمدة</div></div>
    <div style="position:absolute;bottom:20px;left:18px;background:#fff;color:var(--sage);font-weight:800;border-radius:12px;padding:4px 12px;display:flex;gap:4px;align-items:center">{ic('check',16)}مملوكة</div>
  </div>
  <div style="position:absolute;top:560px;left:0;right:0;display:flex;justify-content:center;gap:8px"><i style="width:8px;height:8px;border-radius:50%;background:#d7ccb9"></i><i style="width:22px;height:8px;border-radius:4px;background:var(--navy)"></i><i style="width:8px;height:8px;border-radius:50%;background:#d7ccb9"></i><i style="width:8px;height:8px;border-radius:50%;background:#d7ccb9"></i></div>
  <div class="card" style="position:absolute;top:596px;left:20px;right:20px;overflow:hidden">
    {''.join(f'<div class="listrow"><div class="ibox">{ic("anchor" if o else "lock",18)}</div><b>{n}</b><span class="v">{v}</span></div>' for n,v,o in [('قارب صغير','3 أعمدة · مملوك',1),('سفينة كبيرة','المرحلة 101',0),('سفينة عملاقة','المرحلة 161',0)])}
  </div>''')

# 11 port
add(11,'تطوير الميناء','قائمة واضحة بالنجوم',f'''{scene(330,False)}
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip">{ic('star',18)}18</div></div>
  <div style="position:absolute;top:130px;left:24px;z-index:5"><div style="font-size:30px;font-weight:800">الميناء</div><div style="color:var(--muted);font-weight:700">المستوى 3 من 10</div></div>
  <div style="position:absolute;top:200px;right:70px;width:6px;height:110px;background:var(--mustard);z-index:3"></div><div style="position:absolute;top:200px;right:70px;width:150px;height:6px;background:var(--mustard);z-index:3"></div>
  <div style="position:absolute;top:262px;left:60px;display:flex;gap:3px;z-index:3">{ct(1)}{ct(2)}{ct(3)}</div><div style="position:absolute;top:296px;left:60px;display:flex;gap:3px;z-index:3">{ct(2)}{ct(3)}{ct(1)}</div>
  <div class="card" style="position:absolute;top:400px;left:20px;right:20px;overflow:hidden">
    {''.join(f'<div class="listrow"><div class="ibox">{ic(i,18)}</div><b>{n}</b>{s}</div>' for i,n,s in [('tool','رافعة أسرع',f'<span style="color:var(--sage)">{ic("check",20)}</span>'),('box','رصيف أوسع',f'<span style="color:var(--sage)">{ic("check",20)}</span>'),('zap','إضاءة الميناء','<span class="price" style="background:var(--coral)">★ 15 طوّر</span>'),('home','مكتب الميناء','<span class="v">★ 25</span>'),('anchor','منارة','<span class="v">★ 40</span>')])}
  </div>''')

# 12 shop
add(12,'المتجر','عروض قليلة وواضحة',f'''
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip">{ic('coin',18)}<span class="ltr">1,250</span></div></div>
  <div class="h1">المتجر<small>لا صناديق حظ · ترى ما تشتريه</small></div>
  <div style="position:absolute;top:206px;left:20px;right:20px;border-radius:22px;padding:18px;background:var(--navy);color:#fff;display:flex;align-items:center;gap:14px">
    <div style="flex:1"><div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:#f6c9a8">مرة واحدة</div><b style="font-size:19px">حزمة البداية</b><div style="font-size:13px;opacity:.8">1000 عملة · 3 تراجع · 3 مكان مؤقت · 2 ثقل</div></div><span class="price" style="background:#fff;color:var(--navy)">$0.99</span></div>
  <div class="card" style="position:absolute;top:330px;left:20px;right:20px;padding:16px 18px;display:flex;align-items:center;gap:14px">
    <div class="ibox">{ic('map',18)}</div><div style="flex:1"><b style="font-size:16px">افتح الحملة كاملة</b><div style="font-size:12.5px;color:var(--muted)">المستويات العشرة + 500 عملة</div></div><span class="price">$2.99</span></div>
  <div style="position:absolute;top:426px;left:24px;font-size:12px;font-weight:800;color:var(--muted)">العملات</div>
  <div class="card" style="position:absolute;top:450px;left:20px;right:20px;overflow:hidden">
    {''.join(f'<div class="listrow"><div class="ibox" style="color:var(--mustard)">{ic("coin",18)}</div><b class="ltr" style="text-align:right">{n}</b>{t}<span class="price">{p}</span></div>' for n,p,t in [('500','$0.49',''),('1,200','$0.99','<span style="font-size:11px;font-weight:800;color:var(--coral)">الأكثر شراءً</span>'),('3,500','$2.99','<span style="font-size:11px;font-weight:800;color:var(--sage)">+15%</span>'),('10,000','$5.99','<span style="font-size:11px;font-weight:800;color:var(--sage)">+40%</span>')])}
  </div>
  <div style="position:absolute;bottom:34px;left:20px;right:20px"><div class="btn b-ad">{ic('playc',20)} 50 عملة مجاناً <span class="tag">إعلان اختياري</span></div></div>''')

# 13 daily
add(13,'لغز اليوم','نتيجة بسيطة قابلة للمشاركة',f'''
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip" style="color:var(--coral)">{ic('flame',18,2,'var(--coral)')}5 أيام</div></div>
  <div class="h1">لغز اليوم<small>نفس الشحنة لكل اللاعبين</small></div>
  <div class="card" style="position:absolute;top:220px;left:20px;right:20px;padding:26px 20px;text-align:center">
    <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:var(--sage)">أبحرت بنجاح</div>
    <div style="font-size:56px;font-weight:800;line-height:1.1;margin-top:6px"><span class="ltr">11</span></div><div style="color:var(--muted);font-weight:700">حركة</div>
    <div style="display:grid;grid-template-columns:repeat(6,30px);gap:5px;justify-content:center;margin:22px 0">{''.join(f'<i style="width:30px;height:30px;border-radius:7px;background:{c}"></i>' for c in ['#5fae8a']*4+['#e7ad3c']+['#5fae8a']*7+['#e7ad3c']+['#5fae8a']*5)}</div>
    <div style="font-weight:700;color:var(--muted)">حركات أقل من <b class="ltr" style="color:var(--navy)">76%</b> من اللاعبين</div>
    <div class="btn b-navy" style="margin-top:18px">{ic('share',20)} شارك النتيجة</div></div>
  <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;color:var(--muted);font-weight:700;display:flex;justify-content:center;gap:6px;align-items:center">{ic('clock',16)} شحنة جديدة بعد <b class="ltr" style="color:var(--navy)">08:12:45</b></div>''')

# 14 weekly
add(14,'تحدي الأسبوع','تقدّم واضح وترتيب بسيط',f'''
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div><div class="chip">{ic('clock',18)}3 أيام</div></div>
  <div class="h1">تحدي الأسبوع<small>5 شحنات · أقل حركات يفوز</small></div>
  <div style="position:absolute;top:210px;left:24px;right:24px;display:flex;gap:6px">{''.join(f'<i style="flex:1;height:8px;border-radius:4px;background:{c}"></i>' for c in ['var(--navy)','var(--navy)','var(--coral)','#e3d9c7','#e3d9c7'])}</div>
  <div style="position:absolute;top:226px;left:24px;right:24px;display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--muted)"><span>الشحنة 3 من 5</span><span>41 حركة حتى الآن</span></div>
  <div class="card" style="position:absolute;top:270px;left:20px;right:20px;overflow:hidden">
    {''.join(f'<div class="listrow" style="{"background:#f3f8f5" if m else ""}"><b style="flex:0;width:22px;color:var(--muted)">{p}</b><div class="ibox" style="background:{"#fff3d6" if p=="1" else "var(--sand)"};font-weight:800">{a}</div><b>{n}</b><span class="v"><span class="ltr">{t}</span> حركة</span></div>' for p,a,n,t,m in [('1','S','Ship_Master','38',0),('2','أ','أنت','41',1),('3','B','Blue_Harbor','45',0),('4','ن','نجم_الموانئ','52',0)])}
  </div>
  <div class="card" style="position:absolute;top:560px;left:20px;right:20px;padding:14px 16px;display:flex;align-items:center;gap:12px"><div class="ibox" style="color:var(--mustard)">{ic('award',20)}</div><div><b>جائزة المركز الأول</b><div style="font-size:13px;color:var(--muted)">500 عملة · 3 تراجع · 3 مكان مؤقت</div></div></div>
  <div style="position:absolute;bottom:40px;left:20px;right:20px"><div class="btn b-navy">العب الشحنة 3</div></div>''')

# 15 zen
add(15,'وضع الهدوء','دون حد حركات ودون خسارة',f'''<div class="sky" style="background:linear-gradient(180deg,#eef4ec,#e2eee4)"></div><div class="sea" style="top:470px;background:linear-gradient(180deg,#8ec5c6,#5f9ea6)"></div>
  <div class="top"><div class="rbtn">{ic('pause',18)}</div><div class="sp"></div><div class="chip" style="color:var(--sage)">{ic('feather',18,2,'var(--sage)')}وضع الهدوء</div><div class="sp"></div><div class="rbtn" style="opacity:0"></div></div>
  {route([1,2])}
  {level(-3,'متوازنة')}
  {ship([col([ct(2),ct(1)],3),col([ct(2)],3),col([ct(2),ct(1)],3)],320,1.15)}
  <div class="sheet"><div class="grab"></div><div class="sh-row"><span class="sh-lbl">الرصيف</span><span class="sh-lbl">بلا حد حركات</span></div><div class="dockrow">{ct(1)}{ct(2)}</div>
  <div class="tools"><div class="tool">{ic('undo',20)}</div><div class="go off">{ic('sail',20)} أبحر</div></div></div>''')

# 16 settings
add(16,'الإعدادات','أربعة خيارات فقط',f'''
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div></div>
  <div class="h1">الإعدادات</div>
  <div class="card" style="position:absolute;top:186px;left:20px;right:20px;overflow:hidden">
    <div class="listrow"><div class="ibox">{ic('globe',18)}</div><b>اللغة</b><span class="v">العربية · تلقائي</span><span style="color:#c9bda9">{ic('chev',18)}</span></div>
    <div class="listrow"><div class="ibox">{ic('vol',18)}</div><b>المؤثرات الصوتية</b><span class="tgl"></span></div>
    <div class="listrow"><div class="ibox">{ic('phone',18)}</div><b>الاهتزاز</b><span class="tgl"></span></div>
    <div class="listrow"><div class="ibox">{ic('shield',18)}</div><b>سياسة الخصوصية</b><span style="color:#c9bda9">{ic('chev',18)}</span></div>
  </div>''')

# 17 language
L=[('العربية','Arabic',1,1),('English','الإنجليزية',0,0),('中文 (简体)','الصينية',0,0),('हिन्दी','الهندية',0,0),('Español','الإسبانية',0,0),('Français','الفرنسية',0,0),('বাংলা','البنغالية',0,0),('Português','البرتغالية',0,0),('Русский','الروسية',0,0),('Bahasa Indonesia','الإندونيسية',0,0),('اردو','الأردية',0,1),('Deutsch','الألمانية',0,0),('日本語','اليابانية',0,0),('Naijá','البيجين النيجيرية',0,0),('मराठी','المراثية',0,0),('Tiếng Việt','الفيتنامية',0,0),('తెలుగు','التيلوغو',0,0),('Hausa','الهوسا',0,0),('Türkçe','التركية',0,0)]
lg=''.join(f'<div class="lg{" sel" if s else ""}"><b dir="{"rtl" if r else "ltr"}">{n}</b><span>{a}</span></div>' for n,a,s,r in L)
add(17,'اختيار اللغة','19 لغة + تلقائي',f'''
  <style>.lgg{{position:absolute;top:300px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr;gap:6px}}
  .lg{{background:#fff;border-radius:12px;padding:3px 12px;height:40px;display:flex;flex-direction:column;justify-content:center;border:1.5px solid transparent}}
  .lg b{{font-size:13.5px;line-height:18px;white-space:nowrap;overflow:hidden;font-family:"Cairo","Noto Sans Devanagari","Noto Sans Bengali","Noto Sans Telugu","WenQuanYi Zen Hei","IPAGothic","Inter",sans-serif}}
  .lg span{{font-size:10.5px;color:var(--muted);line-height:13px}} .lg.sel{{border-color:var(--navy)}}</style>
  <div class="top"><div class="rbtn">{ic('back',22)}</div><div class="sp"></div></div>
  <div class="h1">اللغة<small>Language</small></div>
  <div class="card" style="position:absolute;top:196px;left:20px;right:20px;height:44px;display:flex;align-items:center;gap:8px;padding:0 14px;color:var(--muted);font-weight:700;font-size:14px;border-radius:14px">{ic('search',18)}ابحث عن لغتك… Search</div>
  <div class="card" style="position:absolute;top:248px;left:20px;right:20px;height:42px;display:flex;align-items:center;gap:10px;padding:0 14px;border-radius:14px;border:1.5px solid var(--sage)"><span style="color:var(--sage)">{ic('phone',18)}</span><b style="flex:1;font-size:14px">تلقائي — لغة الجهاز</b><span style="font-size:12px;color:var(--muted)">العربية</span></div>
  <div class="lgg">{lg}</div>''')

html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>لغز شحن السفينة — التصميم الثاني</title><style>{css}</style></head><body>
<header class="page-head"><h1>لغز شحن السفينة</h1><p>التصميم الثاني: هادئ، ونظيف، واحترافي</p></header>
<main class="grid">{''.join(f'<figure class="cell">{h}<figcaption>{i+1}. {t}<span>{s}</span></figcaption></figure>' for i,(t,s,h) in enumerate(S))}</main></body></html>'''
open('/home/user/oya-agent-agent/design/cargo-v2/cargo-v2.html','w').write(html)
print(len(S))
