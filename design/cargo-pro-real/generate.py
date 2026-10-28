PORT={1:('#ea4e40','#f79586','#a82c21','●'),2:('#317ad6','#86b9f0','#1b4f96','▲'),3:('#f2b11f','#fbd985','#b07608','■'),4:('#31a865','#8ad8aa','#1c7142','◆')}
def defs():
    g=''
    for k,(c,l,d,_) in PORT.items():
        g+=f'<linearGradient id="ct{k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{l}"/><stop offset=".35" stop-color="{c}"/><stop offset="1" stop-color="{d}"/></linearGradient>'
        g+=f'<radialGradient id="em{k}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6edf5"/></radialGradient>'
    g+='''<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#ffc72c"/><stop offset="1" stop-color="#d98a00"/></linearGradient>
<linearGradient id="goldEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b86b00"/><stop offset="1" stop-color="#7a4300"/></linearGradient>
<linearGradient id="hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34506f"/><stop offset=".5" stop-color="#22384f"/><stop offset="1" stop-color="#142336"/></linearGradient>
<linearGradient id="hullRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4463a"/><stop offset="1" stop-color="#7f2219"/></linearGradient>
<linearGradient id="bridge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d7e1ec"/></linearGradient>
<linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58a52"/><stop offset="1" stop-color="#8f5a2c"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37c4f5"/><stop offset=".5" stop-color="#1590d6"/><stop offset="1" stop-color="#0b5fa8"/></linearGradient>
<linearGradient id="star" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7b0"/><stop offset=".5" stop-color="#ffd21f"/><stop offset="1" stop-color="#f29a00"/></linearGradient>
<radialGradient id="coin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6b5"/><stop offset=".6" stop-color="#ffc72c"/><stop offset="1" stop-color="#d98a00"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0b2a55" flood-opacity=".35"/></filter>
<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 -1.4 1.05"/><feComposite in2="SourceAlpha" operator="in"/></filter>
<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".18" stop-color="#ffffff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>'''
    return f'<svg width="0" height="0" style="position:absolute"><defs>{g}</defs></svg>'
def ct(x,y,p,w=52,h=38,label=None,err=False):
    c,l,d,sym=PORT[p]
    ribs=''.join(f'<line x1="{x+6+i*6.5:.1f}" y1="{y+6}" x2="{x+6+i*6.5:.1f}" y2="{y+h-6}" stroke="{d}" stroke-opacity=".45" stroke-width="1.4"/><line x1="{x+7.4+i*6.5:.1f}" y1="{y+6}" x2="{x+7.4+i*6.5:.1f}" y2="{y+h-6}" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>' for i in range(7))
    corners=''.join(f'<rect x="{cx}" y="{cy}" width="5" height="5" rx="1" fill="{d}"/>' for cx,cy in [(x+1,y+1),(x+w-6,y+1),(x+1,y+h-6),(x+w-6,y+h-6)])
    em=f'<circle cx="{x+w/2}" cy="{y+h/2}" r="10" fill="url(#em{p})" stroke="{d}" stroke-width="1.2"/><text x="{x+w/2}" y="{y+h/2+4.5}" text-anchor="middle" font-size="12" font-weight="900" fill="{d}">{sym}</text>'
    lab=f'<text x="{x+w-7}" y="{y+h-8}" text-anchor="end" font-size="9" font-weight="900" fill="#fff" stroke="{d}" stroke-width="2" paint-order="stroke" font-family="Inter">{label}</text>' if label else ''
    errr=f'<rect x="{x-3}" y="{y-3}" width="{w+6}" height="{h+6}" rx="7" fill="none" stroke="#ff2d55" stroke-width="3"/>' if err else ''
    return f'<g filter="url(#soft)">{errr}<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="url(#ct{p})" stroke="{d}" stroke-width="1.6"/>{ribs}<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="url(#metal)"/><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="#000" filter="url(#grain)" opacity=".28"/><rect x="{x+2}" y="{y+2}" width="{w-4}" height="3" rx="1.5" fill="#fff" fill-opacity=".28"/>{corners}{em}{lab}<rect x="{x+1}" y="{y+h-2}" width="{w-2}" height="3" fill="#000" opacity=".22"/></g>'
def ship(stacks, H=4, labels=None, err=None, ghost=None, held=None, W=360):
    n=len(stacks); cw=52; gap=5
    total=n*cw+(n-1)*gap
    x0=(W-(total+126))/2+78; deck=262
    s=[]
    # shadow/reflection
    s.append(f'<ellipse cx="{W/2}" cy="{deck+64}" rx="160" ry="10" fill="#063f74" opacity=".35" filter="url(#blur8)"/>')
    # bridge
    bx=x0-72
    s.append(f'<rect x="{bx+14}" y="{deck-128}" width="10" height="34" rx="2" fill="#ff5b4e" stroke="#9e1d16" stroke-width="1.5"/><rect x="{bx+12}" y="{deck-132}" width="14" height="8" rx="2" fill="#14264a"/>')
    s.append(f'<rect x="{bx}" y="{deck-96}" width="62" height="96" rx="6" fill="url(#bridge)" stroke="#8ea3b8" stroke-width="1.6"/>')
    for r in range(3):
        s.append(f'<rect x="{bx+7}" y="{deck-86+r*24}" width="48" height="12" rx="3" fill="#2b5d8f"/><rect x="{bx+9}" y="{deck-84+r*24}" width="16" height="4" rx="2" fill="#9ed2ff" opacity=".8"/>')
    s.append(f'<line x1="{bx+46}" y1="{deck-96}" x2="{bx+46}" y2="{deck-128}" stroke="#2f4d78" stroke-width="3"/><circle cx="{bx+46}" cy="{deck-130}" r="3" fill="#ff5b4e"/>')
    # stacks
    for i,st in enumerate(stacks):
        cx=x0+i*(cw+gap)
        for j,p in enumerate(st):
            lab=labels[i][j] if labels else None
            s.append(ct(cx,deck-40-j*40,p,label=lab,err=(err==(i,j))))
        for j in range(len(st),H):
            if ghost==(i,j):
                c=PORT[held][0]
                s.append(f'<rect x="{cx}" y="{deck-40-j*40}" width="{cw}" height="38" rx="6" fill="{c}" fill-opacity=".22" stroke="{c}" stroke-width="2.5" stroke-dasharray="6 4"/>')
            else:
                s.append(f'<rect x="{cx+1}" y="{deck-39-j*40}" width="{cw-2}" height="36" rx="6" fill="#ffffff" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.3" stroke-dasharray="5 4"/>')
    # hull
    L=bx-6; R=x0+total+18
    hull=f'M{L} {deck} L{R} {deck} Q{R+24} {deck+4} {R+30} {deck+18} L{R+12} {deck+60} L{L+14} {deck+60} Z'
    mir=f'M{L} {deck+120} L{R} {deck+120} Q{R+24} {deck+116} {R+30} {deck+102} L{R+12} {deck+60} L{L+14} {deck+60} Z'
    s.append(f'<path d="{mir}" fill="#0b2c52" opacity=".35" filter="url(#blur3)"/>')
    s.append(f'<path d="{hull}" fill="url(#hull)" stroke="#0c1a33" stroke-width="2"/>')
    s.append(f'<path d="{hull}" fill="url(#metal)"/><path d="{hull}" fill="#000" filter="url(#grain)" opacity=".32"/>')
    s.append(f'<path d="M{L+12} {deck+44} L{R+18} {deck+44} L{R+12} {deck+60} L{L+14} {deck+60} Z" fill="url(#hullRed)"/>')
    s.append(f'<rect x="{L-2}" y="{deck-6}" width="{R-L+22}" height="9" rx="3" fill="#f5f7fa" stroke="#8ea3b8" stroke-width="1.2"/>')
    for k in range(6):
        s.append(f'<circle cx="{L+34+k*42}" cy="{deck+24}" r="4.5" fill="#9ed2ff" stroke="#0c1a33" stroke-width="1.5"/>')
    if held:
        gi=ghost[0]; hx=x0+gi*(cw+gap); hy=deck-40-H*40-26
        s.append(f'<line x1="{hx+cw/2}" y1="0" x2="{hx+cw/2}" y2="{hy}" stroke="#3b4a5a" stroke-width="2.5"/><path d="M{hx+cw/2-8} {hy} h16 l-4 6 h-8 z" fill="#3b4a5a"/>')
        s.append(ct(hx,hy+6,held))
    return f'<svg width="{W}" height="340" viewBox="0 0 {W} 340" style="overflow:visible">{"".join(s)}</svg>'
def coin(sz=26): return f'<svg width="{sz}" height="{sz}" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5" fill="url(#coin)" stroke="#b86b00" stroke-width="2"/><circle cx="13" cy="13" r="6.5" fill="none" stroke="#e39b00" stroke-width="2"/></svg>'
def starsvg(sz=26, fill='url(#star)'): return f'<svg width="{sz}" height="{sz}" viewBox="0 0 24 24"><polygon points="12 1.5 15.2 8.3 22.5 9.2 17.1 14.2 18.6 21.6 12 17.9 5.4 21.6 6.9 14.2 1.5 9.2 8.8 8.3" fill="{fill}" stroke="#b86b00" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8.6 L12 3.8 L13.6 7.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/></svg>'
SVGI={'undo':'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>','box':'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>','anchor':'<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>','eye':'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>','pause':'<rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/>','gear':'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>','cal':'<rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>','gift':'<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>','trophy':'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>','bag':'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>','home':'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>','map':'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>','ship':'<path d="M3 17l2 4h14l2-4z"/><path d="M5 17V9h6v8M11 11h8v6"/><path d="M8 9V5"/>','tool':'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>','play':'<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/>','sail':'<path d="M12 2v16"/><path d="M12 3l7 12h-7z" fill="currentColor"/><path d="M12 6l-6 9h6z" fill="currentColor"/><path d="M3 19c3 2 15 2 18 0"/>','film':'<rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor"/>'}
def ico(n,sz=26,sw=2.4): return f'<svg width="{sz}" height="{sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{SVGI[n]}</svg>'

css='''
@font-face { font-family: "Cairo"; src: url("../mockups/fonts/Cairo.ttf"); font-weight: 200 1000; }
@font-face { font-family: "Lalezar"; src: url("../mockups/fonts/Lalezar-Regular.ttf"); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Cairo", sans-serif; background: #10243f; padding: 56px; color: #fff; }
.ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }
h1 { text-align: center; font-family: Lalezar; font-weight: 400; font-size: 54px; color: #ffd21f; text-shadow: 0 4px 0 #7a4300; }
.lead { text-align: center; opacity: .8; font-size: 18px; margin-bottom: 40px; }
.grid { display: grid; grid-template-columns: repeat(4, 390px); gap: 44px; justify-content: center; }
figcaption { text-align: center; margin-top: 16px; font-size: 20px; font-weight: 800; }
figcaption span { display: block; font-size: 14px; opacity: .7; font-weight: 500; }
.phone { width: 390px; height: 844px; border-radius: 46px; overflow: hidden; position: relative; box-shadow: 0 0 0 9px #050c18, 0 30px 70px rgba(0,0,0,.55);
  background: linear-gradient(180deg, #5fb8ea 0%, #8fcdf0 30%, #cfe8f3 50%, #efeee6 58%); }
.clouds i { position: absolute; background: radial-gradient(ellipse at 50% 30%, #fff, #eef5fa 70%); border-radius: 50px; opacity: .85; filter: blur(1.5px); box-shadow: 0 8px 16px rgba(90,140,180,.18); }
.sea { position: absolute; left: 0; right: 0; bottom: 0; }
.wave { position: absolute; left: -20px; right: -20px; height: 22px; background: radial-gradient(ellipse 26px 12px at 26px 0, transparent 11px, rgba(255,255,255,.75) 12px 14px, transparent 15px) 0 0/52px 22px repeat-x; }
/* glossy chunky UI */
.bar { position: absolute; top: 52px; left: 14px; right: 14px; display: flex; align-items: center; gap: 8px; z-index: 9; }
.res { position: relative; height: 38px; display: flex; align-items: center; gap: 6px; padding: 0 8px 0 34px; border-radius: 20px; background: linear-gradient(180deg, #1c4f8f, #0f3368); border: 2.5px solid #0a2550; box-shadow: inset 0 2px 0 rgba(255,255,255,.25), 0 3px 0 rgba(0,0,0,.25); font-weight: 900; font-size: 16px; }
.res > svg:first-child { position: absolute; left: -8px; top: 3px; width: 34px; height: 34px; filter: drop-shadow(0 2px 0 rgba(0,0,0,.3)); }
.plus { width: 26px; height: 26px; border-radius: 9px; background: linear-gradient(180deg, #7dff9f, #22c25a); border: 2px solid #0d7a35; display: grid; place-items: center; font-weight: 900; font-size: 18px; line-height: 1; box-shadow: inset 0 2px 0 rgba(255,255,255,.5); }
.sp { flex: 1; }
.round { width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center; color: #fff; background: linear-gradient(180deg, #4fb7ff, #1f7fe0); border: 2.5px solid #0e4fa3; box-shadow: inset 0 3px 0 rgba(255,255,255,.4), 0 4px 0 #0b3f82; }
.round.or { background: linear-gradient(180deg, #ffb54a, #ff7a1a); border-color: #b04a00; box-shadow: inset 0 3px 0 rgba(255,255,255,.45), 0 4px 0 #9a3e00; }
.big { display: flex; align-items: center; justify-content: center; gap: 10px; height: 74px; border-radius: 24px; font-family: Lalezar; font-weight: 400; font-size: 34px; color: #fff; text-shadow: 0 3px 0 rgba(0,0,0,.25);
  background: linear-gradient(180deg, #8dff8a 0%, #35d14f 45%, #1aa83a 100%); border: 3px solid #0b7a2a; box-shadow: inset 0 4px 0 rgba(255,255,255,.55), inset 0 -6px 0 rgba(0,0,0,.12), 0 6px 0 #0a5f20, 0 14px 24px rgba(0,60,20,.35); position: relative; overflow: hidden; }
.big::after { content: ""; position: absolute; top: 4px; left: 12px; right: 12px; height: 26px; border-radius: 18px; background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0)); }
.big small { font-family: Cairo; font-size: 15px; font-weight: 800; opacity: .95; }
.blue { background: linear-gradient(180deg, #7cc8ff 0%, #3c97ff 45%, #1f6fe0 100%); border-color: #0e4fa3; box-shadow: inset 0 4px 0 rgba(255,255,255,.5), inset 0 -6px 0 rgba(0,0,0,.12), 0 6px 0 #0b3f82, 0 14px 24px rgba(0,30,80,.35); }
.purple { background: linear-gradient(180deg, #c7a6ff 0%, #8c5cff 45%, #6a3be6 100%); border-color: #4a1fb0; box-shadow: inset 0 4px 0 rgba(255,255,255,.5), inset 0 -6px 0 rgba(0,0,0,.12), 0 6px 0 #3a1690, 0 14px 24px rgba(40,10,100,.35); }
.adtag { font-family: Cairo; font-size: 13px; font-weight: 800; background: rgba(255,255,255,.25); border-radius: 10px; padding: 1px 8px; }
/* gameplay HUD */
.hud { position: absolute; top: 48px; left: 0; right: 0; height: 130px; z-index: 8; }
.moves { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); width: 120px; height: 104px; border-radius: 26px; text-align: center; padding-top: 8px;
  background: linear-gradient(180deg, #4fb7ff, #1f6fe0); border: 3px solid #0e4fa3; box-shadow: inset 0 4px 0 rgba(255,255,255,.4), 0 6px 0 #0b3f82, 0 12px 20px rgba(0,30,80,.3); }
.moves small { display: block; font-weight: 900; font-size: 13px; color: #d6ecff; }
.moves b { display: block; font-family: Lalezar; font-weight: 400; font-size: 52px; line-height: 1; text-shadow: 0 3px 0 rgba(0,0,0,.25); }
.goalbox { position: absolute; top: 24px; width: 108px; height: 66px; border-radius: 20px; background: linear-gradient(180deg, #fffdf5, #ffeec4); border: 3px solid #d99a3a; box-shadow: inset 0 3px 0 #fff, 0 5px 0 #a8701e; color: #6a3d00; text-align: center; padding-top: 6px; }
.goalbox small { display: block; font-size: 12px; font-weight: 900; }
.ports { display: flex; justify-content: center; gap: 4px; margin-top: 4px; direction: rtl; }
.pt { width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; font-size: 12px; font-weight: 900; color: #fff; border: 2px solid rgba(0,0,0,.25); box-shadow: inset 0 2px 0 rgba(255,255,255,.4); position: relative; }
.pt.now { transform: scale(1.18); box-shadow: inset 0 2px 0 rgba(255,255,255,.4), 0 0 0 2px #fff, 0 0 10px #fff; }
.tilt { position: absolute; top: 190px; left: 50%; transform: translateX(-50%); width: 250px; height: 46px; z-index: 8; border-radius: 23px; padding: 7px 14px;
  background: linear-gradient(180deg, #fffdf5, #ffeec4); border: 3px solid #d99a3a; box-shadow: inset 0 3px 0 #fff, 0 5px 0 #a8701e; }
.tube { position: relative; height: 26px; border-radius: 13px; background: linear-gradient(180deg, #d8ffb0, #8fe05a); border: 2px solid #4e9a1f; box-shadow: inset 0 3px 4px rgba(0,0,0,.18); }
.tube::before { content: ""; position: absolute; inset: 0; border-radius: 13px; background: linear-gradient(90deg, #ff6b5a 0 14%, transparent 14% 86%, #ff6b5a 86%); opacity: .85; }
.tube i.m { position: absolute; top: 3px; bottom: 3px; width: 2.5px; background: rgba(40,80,10,.6); }
.tube i.b { position: absolute; top: 3px; width: 34px; height: 16px; margin-left: -17px; border-radius: 9px; background: radial-gradient(ellipse at 35% 30%, #fff, #f2ffe0 60%, #c8f09a); box-shadow: 0 1px 2px rgba(0,0,0,.25); }
/* bottom tray */
.tray { position: absolute; left: 0; right: 0; bottom: 0; height: 250px; z-index: 8; }
.pier { position: absolute; left: -10px; right: -10px; top: 0; height: 104px; border-radius: 0 0 0 0; background: repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 46px, rgba(70,40,15,.35) 46px 48px), repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 5px), linear-gradient(180deg, #b98552, #a06d3e); border-top: 6px solid #e8b783; box-shadow: inset 0 -12px 0 #8f5a2c, 0 -4px 10px rgba(0,0,0,.2); }
.pier::after { content: ""; position: absolute; left: 0; right: 0; top: 10px; height: 7px; background: repeating-linear-gradient(90deg, #ffd21f 0 22px, #2b2b2b 22px 44px); opacity: .9; }
.pierItems { position: absolute; top: 30px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px; align-items: center; }
.slotT { width: 54px; height: 40px; border-radius: 8px; border: 2.5px dashed rgba(255,255,255,.75); display: grid; place-items: center; font-size: 11px; font-weight: 900; color: #fff; text-shadow: 0 1px 0 rgba(0,0,0,.4); }
.boosters { position: absolute; bottom: 22px; left: 14px; right: 14px; display: flex; align-items: flex-end; gap: 8px; }
.bst { position: relative; width: 62px; height: 62px; border-radius: 20px; display: grid; place-items: center; color: #1f5fb8; background: linear-gradient(180deg, #ffffff, #dbeeff); border: 3px solid #7fb3e8; box-shadow: inset 0 3px 0 #fff, 0 5px 0 #4f86c4, 0 10px 14px rgba(0,40,90,.25); }
.bst .n { position: absolute; top: -8px; right: -8px; min-width: 26px; height: 26px; border-radius: 13px; background: linear-gradient(180deg, #ff7a6b, #ff3b2f); border: 2.5px solid #fff; color: #fff; font-weight: 900; font-size: 13px; display: grid; place-items: center; box-shadow: 0 2px 0 rgba(0,0,0,.2); }
.bst b { position: absolute; bottom: -20px; left: -8px; right: -8px; text-align: center; font-size: 11px; font-weight: 900; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
.sailb { flex: 1; height: 66px; font-size: 26px; border-radius: 22px; }
.sailb.off { filter: grayscale(.85) brightness(1.05); opacity: .85; }
/* modal */
.shade { position: absolute; inset: 0; background: rgba(5,20,45,.55); z-index: 20; }
.panel { position: absolute; left: 22px; right: 22px; z-index: 21; border-radius: 30px; padding: 74px 18px 22px; text-align: center; color: #6a3d00;
  background: linear-gradient(180deg, #fffaf0, #ffeec4); border: 4px solid #e2a443; box-shadow: inset 0 4px 0 #fff, 0 8px 0 #a8701e, 0 30px 60px rgba(0,0,0,.4); }
.ribbon { position: absolute; top: -30px; left: -30px; right: -30px; height: 70px; display: grid; place-items: center; font-family: Lalezar; font-size: 40px; color: #fff; text-shadow: 0 3px 0 rgba(0,0,0,.25);
  background: linear-gradient(180deg, #ff8a5c, #ff4b2e); border: 3px solid #b02a12; border-radius: 16px; box-shadow: inset 0 4px 0 rgba(255,255,255,.4), 0 6px 0 #8a1f0c; }
.ribbon::before, .ribbon::after { content: ""; position: absolute; top: 18px; width: 30px; height: 50px; background: #c7351a; z-index: -1; }
.ribbon::before { left: -14px; clip-path: polygon(0 0,100% 0,100% 100%,0 70%,40% 35%); } .ribbon::after { right: -14px; clip-path: polygon(0 0,100% 0,60% 35%,100% 70%,0 100%); }
.bigstars { position: absolute; top: -150px; left: 0; right: 0; display: flex; justify-content: center; align-items: flex-end; gap: 0; }
.bigstars svg { filter: drop-shadow(0 6px 0 #a35c00) drop-shadow(0 0 18px rgba(255,220,80,.8)); }
.rays { position: absolute; top: 90px; left: 50%; width: 700px; height: 700px; margin-left: -350px; border-radius: 50%; background: repeating-conic-gradient(rgba(255,240,170,.22) 0 9deg, transparent 9deg 18deg); z-index: 19; -webkit-mask: radial-gradient(circle, #000 20%, transparent 65%); }
.rew { display: flex; gap: 10px; justify-content: center; margin: 14px 0 6px; }
.rw { width: 92px; border-radius: 18px; padding: 8px 0 6px; background: #fff; border: 3px solid #f0cf8f; box-shadow: 0 4px 0 #d9a85a; }
.rw b { display: block; font-size: 22px; font-weight: 900; color: #6a3d00; direction: ltr; }
.panel .big { margin-top: 12px; height: 64px; font-size: 28px; }
/* nav */
.nav { position: absolute; left: 0; right: 0; bottom: 0; height: 96px; z-index: 9; display: flex; align-items: flex-end; justify-content: space-around; padding: 0 8px 16px;
  background: linear-gradient(180deg, #2b6fc4, #164a95); border-top: 4px solid #6fb3ff; box-shadow: 0 -6px 16px rgba(0,30,80,.3); }
.nv { display: flex; flex-direction: column; align-items: center; gap: 2px; color: #cfe6ff; font-size: 12px; font-weight: 900; width: 66px; }
.nv.on { transform: translateY(-14px); color: #fff; }
.nv.on .ni { width: 64px; height: 58px; border-radius: 20px; background: linear-gradient(180deg, #ffd65a, #ff9f1a); border: 3px solid #b86b00; box-shadow: inset 0 3px 0 rgba(255,255,255,.5), 0 5px 0 #8a4f00; color: #fff; }
.ni { width: 46px; height: 40px; display: grid; place-items: center; }
'''
D=defs()
def sky(top_cloud=True):
    return f'''<div class="clouds"><i style="top:150px;left:-20px;width:120px;height:34px"></i><i style="top:130px;left:40px;width:70px;height:40px;border-radius:40px"></i><i style="top:210px;right:-30px;width:140px;height:36px"></i><i style="top:192px;right:40px;width:70px;height:40px;border-radius:40px"></i></div>'''
def sea(top):
    gl=''.join(f'<i style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:2px;border-radius:2px;background:rgba(255,255,255,{a});filter:blur(.5px)"></i>' for x,y,w,a in [(30,30,22,.7),(90,52,14,.5),(260,24,30,.65),(320,70,18,.5),(150,90,26,.45),(60,130,20,.4),(220,140,24,.4),(300,180,16,.35),(120,200,22,.3)])
    return f'''<div class="sea" style="top:{top}px;background:linear-gradient(180deg,#5aa9cf 0%,#2f86ba 25%,#1a6599 60%,#0d4473 100%)"><div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(255,255,255,.05) 0 2px,transparent 2px 9px)"></div>{gl}<div class="wave" style="top:-10px;opacity:.55"></div><div class="wave" style="top:60px;opacity:.25;left:6px"></div></div>'''
def ports_html(order,cur=0):
    return ''.join(f'<span class="pt{" now" if i==cur else ""}" style="background:linear-gradient(180deg,{PORT[p][1]},{PORT[p][0]})">{PORT[p][3]}</span>' for i,p in enumerate(order))

screens=[]
# HOME
home=f'''<div class="phone" id="s1">{sky()}
<div class="bar"><div class="res">{coin(30)}<span class="ltr">1,250</span><span class="plus">+</span></div><div class="res">{starsvg(30)}<span>86</span></div><div class="sp"></div><div class="round">{ico('gear',24)}</div></div>
<div style="position:absolute;top:112px;left:14px;display:flex;flex-direction:column;gap:14px;z-index:9">
  <div class="round or" style="width:58px;height:58px;border-radius:18px">{ico('gift',28)}</div>
  <div class="round" style="width:58px;height:58px;border-radius:18px">{ico('cal',28)}</div></div>
<div style="position:absolute;top:112px;right:14px;z-index:9"><div class="round" style="width:58px;height:58px;border-radius:18px;background:linear-gradient(180deg,#c7a6ff,#6a3be6);border-color:#4a1fb0;box-shadow:inset 0 3px 0 rgba(255,255,255,.45),0 4px 0 #3a1690">{ico('trophy',28)}</div></div>
<div style="position:absolute;top:150px;left:0;right:0;text-align:center;z-index:5"><div style="display:inline-block;font-family:Lalezar;font-size:30px;color:#fff;text-shadow:0 3px 0 #0b3f82,0 0 12px rgba(0,60,140,.4);padding:0 18px">المستوى 2 · الأوزان</div>
 <div style="width:220px;height:20px;margin:6px auto 0;border-radius:10px;background:#0f3368;border:2.5px solid #0a2550;padding:2px"><i style="display:block;width:35%;height:100%;border-radius:8px;background:linear-gradient(180deg,#ffe36a,#ffb21a)"></i></div></div>
{sea(500)}
<div style="position:absolute;top:186px;left:15px;z-index:6">{ship([[3,2,1],[3,1,1],[2,2],[3]],H=3)}</div>
<div style="position:absolute;bottom:126px;left:30px;right:30px;z-index:9"><div class="big">العب <small>المرحلة 27</small></div></div>
<div class="nav"><div class="nv"><span class="ni">{ico('bag',26)}</span>المتجر</div><div class="nv"><span class="ni">{ico('ship',26)}</span>الأسطول</div><div class="nv on"><span class="ni">{ico('home',30)}</span>الرئيسية</div><div class="nv"><span class="ni">{ico('map',26)}</span>المستويات</div><div class="nv"><span class="ni">{ico('tool',26)}</span>الميناء</div></div>
</div>'''
screens.append(('الرئيسية','الميناء وسفينتك وزر اللعب',home))
# GAMEPLAY
game=f'''<div class="phone" id="s2">{sky()}
<div class="hud">
  <div class="goalbox" style="right:16px"><small>الموانئ</small><div class="ports">{ports_html([1,2,3])}</div></div>
  <div class="moves"><small>الحركات</small><b class="ltr">5</b></div>
  <div style="position:absolute;top:24px;left:16px;display:flex;gap:8px"><div class="round">{ico('pause',22)}</div></div>
</div>
<div class="tilt"><div class="tube"><i class="m" style="left:calc(50% - 20px)"></i><i class="m" style="left:calc(50% + 18px)"></i><i class="b" style="left:calc(50% + 16px)"></i></div></div>
{sea(470)}
<div style="position:absolute;top:236px;left:15px;z-index:6">{ship([[3,2],[3,2,1],[2,1],[3,1,1]],H=4,labels=[['2t','4t'],['5t','1t','3t'],['2t','1t'],['4t','2t','3t']],ghost=(2,2),held=1)}</div>
<div class="tray"><div class="pier"><div class="pierItems"><svg width="54" height="40" viewBox="0 0 54 40" style="overflow:visible">{ct(1,1,2,label='2t')}</svg><svg width="54" height="40" viewBox="0 0 54 40" style="overflow:visible">{ct(1,1,3,label='5t')}</svg><div class="slotT">مؤقت</div></div></div>
<div class="boosters"><div class="bst">{ico('undo',28)}<span class="n">2</span><b>تراجع</b></div><div class="bst">{ico('box',28)}<span class="n">1</span><b>مكان مؤقت</b></div><div class="bst">{ico('anchor',28)}<span class="n">1</span><b>ثقل موازن</b></div><div class="big sailb off">{ico('sail',28)}أبحر</div></div></div>
</div>'''
screens.append(('اللعب','الحاويات بتفاصيل حقيقية، والرافعة تُنزل الحاوية',game))
# WIN
win=f'''<div class="phone" id="s3">{sky()}{sea(420)}
<div style="position:absolute;top:120px;left:15px;z-index:6">{ship([[3,2,1],[3,2,1],[3,2,1],[3,2,1]],H=3)}</div>
<div class="shade"></div><div class="rays"></div>
<div class="panel" style="top:400px">
  <div class="bigstars">{starsvg(96)}<span style="margin-bottom:22px">{starsvg(122)}</span>{starsvg(96)}</div>
  <div class="ribbon">رحلة موفقة!</div>
  <div style="font-weight:900;font-size:20px">المرحلة 27 مكتملة</div><div style="font-weight:700;color:#a36a1e">الحل الأمثل · 12 حركة</div>
  <div class="rew"><div class="rw">{coin(34)}<b>+25</b></div><div class="rw">{starsvg(34)}<b>+3</b></div></div>
  <div class="big purple">{ico('film',26)} ضاعف <span class="adtag">إعلان</span></div>
  <div class="big">التالي</div>
</div></div>'''
screens.append(('الفوز','نجوم ذهبية وأشعة احتفال',win))
# LEVEL MAP
nodes=''
pos=[(195,720),(110,640),(190,565),(285,495),(205,420),(110,350),(190,280),(290,210)]
for k,(x,y) in enumerate(pos):
    n=24+k
    if n<27: cls='done'
    elif n==27: cls='cur'
    else: cls='lock'
    sz=78 if cls=='cur' else 62
    bg={'done':'linear-gradient(180deg,#ffe36a,#ffb21a)','cur':'linear-gradient(180deg,#8dff8a,#1aa83a)','lock':'linear-gradient(180deg,#d7e4f0,#a6b9cc)'}[cls]
    bd={'done':'#b86b00','cur':'#0b7a2a','lock':'#7d8fa3'}[cls]
    sh={'done':'#8a4f00','cur':'#0a5f20','lock':'#5d6f82'}[cls]
    stars=f'<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);display:flex">{starsvg(18)}{starsvg(22)}{starsvg(18)}</div>' if cls=='done' else ''
    nodes+=f'<div style="position:absolute;left:{x-sz/2}px;top:{y-sz/2}px;width:{sz}px;height:{sz}px;border-radius:50%;background:{bg};border:4px solid {bd};box-shadow:inset 0 4px 0 rgba(255,255,255,.5),0 6px 0 {sh};display:grid;place-items:center;font-family:Lalezar;font-size:{30 if cls=="cur" else 26}px;color:{"#7d8fa3" if cls=="lock" else "#fff"};text-shadow:0 2px 0 rgba(0,0,0,.2);z-index:5">{n}{stars}</div>'
path=' '.join(f'{x},{y}' for x,y in pos)
mp=f'''<div class="phone" id="s4" style="background:linear-gradient(180deg,#37c4f5,#1590d6 60%,#0b5fa8)">
<div class="wave" style="top:180px;opacity:.5"></div><div class="wave" style="top:380px;opacity:.4"></div><div class="wave" style="top:600px;opacity:.4"></div>
<div style="position:absolute;left:-40px;top:300px;width:170px;height:120px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#ffe6a8,#f4c76a 70%,#d9a441);box-shadow:0 0 0 10px rgba(255,255,255,.35)"></div>
<div style="position:absolute;right:-50px;top:560px;width:180px;height:130px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#ffe6a8,#f4c76a 70%,#d9a441);box-shadow:0 0 0 10px rgba(255,255,255,.35)"></div>
<svg width="390" height="844" style="position:absolute;inset:0;z-index:4"><polyline points="{path}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="2 16" stroke-linecap="round" opacity=".9"/></svg>
{nodes}
<div style="position:absolute;left:{pos[3][0]+28}px;top:{pos[3][1]-60}px;z-index:6;transform:scale(.32);transform-origin:left top">{ship([[1],[2],[3]],H=1)}</div>
<div class="bar"><div class="round">{ico('map',24)}</div><div class="sp"></div><div style="font-family:Lalezar;font-size:28px;text-shadow:0 3px 0 #0b3f82">الأوزان</div><div class="sp"></div><div class="res">{starsvg(30)}<span>18/60</span></div></div>
</div>'''
screens.append(('خريطة المراحل','مسار بحري بين الجزر',mp))
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>لعبة شحن السفينة — تصميم احترافي</title><style>{css}</style></head><body>{D}
<h1>لغز شحن السفينة</h1><p class="lead">تصميم بأسلوب ألعاب الألغاز المشهورة — عينة من 4 شاشات أساسية</p>
<main class="grid">{''.join(f'<figure>{h}<figcaption>{i+1}. {t}<span>{s}</span></figcaption></figure>' for i,(t,s,h) in enumerate(screens))}</main></body></html>'''
open('/home/user/oya-agent-agent/design/cargo-pro-real/cargo-pro.html','w').write(html)
print(len(screens))
