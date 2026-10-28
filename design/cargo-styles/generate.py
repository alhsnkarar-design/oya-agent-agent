stacks=[[3,2],[3,2,1],[2,1],[3,1,1]]
sym={1:'●',2:'▲',3:'■'}
def ship_html(cls, colors, H=4):
    cols=''
    for st in stacks:
        cells=''.join(f'<div class="c" style="--c:{colors[p]}"><span>{sym[p]}</span></div>' for p in st)+''.join('<div class="e"></div>' for _ in range(H-len(st)))
        cols+=f'<div class="col">{cells}</div>'
    return f'<div class="ship {cls}"><div class="cols">{cols}</div><div class="hull"></div></div>'
def dock(colors, items=(1,2)):
    return ''.join(f'<div class="c" style="--c:{colors[p]}"><span>{sym[p]}</span></div>' for p in items)
base='''
@font-face { font-family: "Cairo"; src: url("../mockups/fonts/Cairo.ttf"); font-weight: 200 1000; }
@font-face { font-family: "Lalezar"; src: url("../mockups/fonts/Lalezar-Regular.ttf"); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Cairo", sans-serif; background: #ddd6ca; padding: 56px; }
.ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }
h1 { text-align: center; font-size: 40px; font-weight: 800; color: #1d2633; }
.lead { text-align: center; color: #6b6458; font-size: 18px; margin-bottom: 40px; }
.grid { display: grid; grid-template-columns: repeat(4, 390px); gap: 40px; justify-content: center; }
figcaption { text-align: center; margin-top: 16px; font-size: 20px; font-weight: 800; color: #1d2633; }
figcaption span { display: block; font-size: 14px; font-weight: 500; color: #6b6458; }
.phone { width: 390px; height: 844px; border-radius: 46px; overflow: hidden; position: relative; box-shadow: 0 0 0 9px #111, 0 30px 60px rgba(0,0,0,.3); }
.ship { position: absolute; left: 50%; top: 300px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; }
.cols { display: flex; gap: 4px; align-items: flex-end; position: relative; z-index: 2; }
.col { display: flex; flex-direction: column-reverse; gap: 3px; }
.c, .e { width: 52px; height: 36px; }
.c { display: grid; place-items: center; }
.top { position: absolute; top: 56px; left: 20px; right: 20px; display: flex; align-items: center; justify-content: space-between; z-index: 5; }
.ports { position: absolute; top: 116px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px; z-index: 5; }
.dockrow { position: absolute; bottom: 150px; left: 0; right: 0; display: flex; justify-content: center; gap: 10px; z-index: 5; }
.tools { position: absolute; bottom: 40px; left: 20px; right: 20px; display: flex; gap: 10px; align-items: center; z-index: 5; }
.sail { flex: 1; height: 58px; display: grid; place-items: center; font-weight: 900; font-size: 19px; }
'''
# ---------- A: Neon night ----------
A=dict(colors={1:'#ff4fd8',2:'#3ef0ff',3:'#ffd23f'})
cssA='''
#a { background: radial-gradient(ellipse at 50% 10%, #1b1d4a, #090b1e 60%); color: #e8ecff; }
#a::before { content:""; position:absolute; left:0; right:0; top:520px; bottom:0; background: linear-gradient(180deg, #0c1640, #050816); }
#a .refl { position:absolute; top:528px; left:0; right:0; height:200px; background: repeating-linear-gradient(180deg, rgba(62,240,255,.12) 0 2px, transparent 2px 12px); -webkit-mask: linear-gradient(180deg,#000,transparent); }
#a .city { position:absolute; top:430px; left:0; right:0; height:90px; background: linear-gradient(90deg, transparent 0 8%, #141a3d 8% 14%, transparent 14% 18%, #11163a 18% 22%, transparent 22% 70%, #141a3d 70% 76%, transparent 76% 80%, #11163a 80% 90%, transparent 90%); opacity:.9; }
#a .c { border-radius: 6px; background: rgba(10,12,30,.85); border: 2px solid var(--c); box-shadow: 0 0 10px var(--c), inset 0 0 12px color-mix(in srgb, var(--c) 40%, transparent); color: var(--c); font-weight: 900; text-shadow: 0 0 8px var(--c); }
#a .e { border-radius: 6px; border: 1px dashed rgba(232,236,255,.25); }
#a .hull { width: 270px; height: 56px; margin-top: -2px; border: 2px solid #3ef0ff; border-top-width: 3px; clip-path: polygon(0 0,100% 0,92% 100%,8% 100%); background: linear-gradient(180deg, rgba(62,240,255,.25), rgba(62,240,255,.05)); box-shadow: 0 0 20px #3ef0ff; }
#a .hull { border: 0; background: linear-gradient(180deg, #3ef0ff 0 3px, #0d1238 3px); filter: drop-shadow(0 0 8px #3ef0ff); }
#a .glass { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); border-radius: 16px; backdrop-filter: blur(6px); padding: 6px 14px; font-weight: 800; }
#a .p { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--c); color: var(--c); display: grid; place-items: center; box-shadow: 0 0 10px var(--c); font-weight: 900; }
#a .p.now { background: var(--c); color: #090b1e; }
#a .gauge { position:absolute; top:172px; left:50%; transform:translateX(-50%); width:220px; height:110px; z-index:5; }
#a .tl { width: 54px; height: 54px; border-radius: 16px; border: 1px solid rgba(255,255,255,.18); display:grid; place-items:center; font-size:20px; color:#cfd6ff; }
#a .sail { border-radius: 16px; background: linear-gradient(90deg,#ff4fd8,#7a5cff); box-shadow: 0 0 22px rgba(255,79,216,.6); color:#fff; }
#a .dk { position:absolute; bottom:120px; left:20px; right:20px; height:96px; border-radius:20px; border:1px solid rgba(62,240,255,.3); background: rgba(62,240,255,.05); }
'''
gaugeA='''<svg class="gauge" viewBox="0 0 220 110"><defs><filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="M20 100 A90 90 0 0 1 200 100" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10" stroke-linecap="round"/>
<path d="M62 30 A90 90 0 0 1 158 30" fill="none" stroke="#3ef0ff" stroke-width="10" stroke-linecap="round" filter="url(#gl)"/>
<path d="M20 100 A90 90 0 0 1 40 46" fill="none" stroke="#ff4f6d" stroke-width="10" stroke-linecap="round" filter="url(#gl)"/><path d="M180 46 A90 90 0 0 1 200 100" fill="none" stroke="#ff4f6d" stroke-width="10" stroke-linecap="round" filter="url(#gl)"/>
<line x1="110" y1="100" x2="132" y2="22" stroke="#fff" stroke-width="3" stroke-linecap="round" filter="url(#gl)"/><circle cx="110" cy="100" r="6" fill="#fff"/>
<text x="110" y="82" text-anchor="middle" font-size="18" font-weight="900" fill="#ffd23f" font-family="Inter">+3°</text></svg>'''
phA=f'''<div class="phone" id="a"><div class="city"></div><div class="refl"></div>
<div class="top"><div class="glass">❚❚</div><div class="glass">المرحلة 9 · <span class="ltr">6/12</span></div><div class="glass">★</div></div>
<div class="ports"><span class="p now" style="--c:#ff4fd8">●</span><span class="p" style="--c:#3ef0ff">▲</span><span class="p" style="--c:#ffd23f">■</span></div>
{gaugeA}
{ship_html('',A['colors'])}
<div class="dk"></div><div class="dockrow" style="bottom:146px">{dock(A['colors'])}</div>
<div class="tools"><div class="tl">↶</div><div class="tl">▣</div><div class="tl">⚓</div><div class="sail">أبحر</div></div></div>'''
# ---------- B: Clay 3D ----------
B=dict(colors={1:'#ff8fa3',2:'#7cc6ff',3:'#ffd166'})
cssB='''
#b { background: linear-gradient(180deg, #fde7f0 0%, #e8e3ff 45%, #cdeffd 46%, #a9dcf5 100%); }
#b .c { border-radius: 12px; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--c) 40%, #fff), var(--c) 55%, color-mix(in srgb, var(--c) 80%, #000)); box-shadow: 0 5px 0 color-mix(in srgb, var(--c) 70%, #000), 0 10px 14px rgba(80,60,120,.25), inset 0 -4px 6px rgba(0,0,0,.12), inset 0 3px 4px rgba(255,255,255,.6); color: #fff; font-weight: 900; font-size: 15px; text-shadow: 0 1px 2px rgba(0,0,0,.25); }
#b .e { border-radius: 12px; background: rgba(255,255,255,.35); box-shadow: inset 0 2px 6px rgba(80,60,120,.15); }
#b .hull { width: 280px; height: 66px; margin-top: 4px; border-radius: 20px 20px 46px 46px; background: radial-gradient(circle at 40% 20%, #8fa8ff, #5a6fe0 60%, #3f4fb8); box-shadow: 0 8px 0 #3443a0, 0 18px 24px rgba(60,50,140,.3), inset 0 4px 6px rgba(255,255,255,.4); }
#b .pill { background: #fff; border-radius: 20px; padding: 8px 16px; font-weight: 900; color: #5a4fa0; box-shadow: 0 5px 0 #d8d0f5, 0 10px 18px rgba(90,70,160,.15); }
#b .p { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; color: #fff; font-weight: 900; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--c) 40%, #fff), var(--c)); box-shadow: 0 4px 0 color-mix(in srgb, var(--c) 70%, #000); }
#b .p.now { transform: scale(1.15); }
#b .bub { position:absolute; top:180px; left:50%; transform:translateX(-50%); width:230px; height:44px; border-radius:22px; background:#fff; box-shadow: inset 0 3px 8px rgba(90,70,160,.2), 0 5px 0 #d8d0f5; z-index:5; }
#b .bub i { position:absolute; top:8px; left:126px; width:46px; height:28px; border-radius:14px; background: radial-gradient(circle at 35% 30%, #fff, #b8f0c9 60%, #6fd393); box-shadow: 0 3px 0 #4cb877; }
#b .bub::before, #b .bub::after { content:""; position:absolute; top:10px; width:3px; height:24px; border-radius:2px; background:#c9c0ef; left:96px; } #b .bub::after { left:131px; }
#b .tl { width: 58px; height: 58px; border-radius: 20px; background: #fff; display:grid; place-items:center; font-size:22px; color:#5a4fa0; box-shadow: 0 6px 0 #d8d0f5, 0 10px 16px rgba(90,70,160,.15); }
#b .sail { border-radius: 22px; background: radial-gradient(circle at 30% 20%, #9ef0b8, #4cd17d); box-shadow: 0 6px 0 #2f9e5a, 0 12px 18px rgba(47,158,90,.3); color:#fff; text-shadow: 0 2px 0 rgba(0,0,0,.15); }
#b .dk { position:absolute; bottom:120px; left:20px; right:20px; height:100px; border-radius:30px; background: #fff7fb; box-shadow: inset 0 4px 10px rgba(90,70,160,.12), 0 6px 0 #ead9f0; }
'''
phB=f'''<div class="phone" id="b">
<div class="top"><div class="pill">❚❚</div><div class="pill">المرحلة 9 · <span class="ltr">6/12</span></div><div class="pill">★</div></div>
<div class="ports"><span class="p now" style="--c:#ff8fa3">●</span><span class="p" style="--c:#7cc6ff">▲</span><span class="p" style="--c:#ffd166">■</span></div>
<div class="bub"><i></i></div>
{ship_html('',B['colors'])}
<div class="dk"></div><div class="dockrow" style="bottom:150px">{dock(B['colors'])}</div>
<div class="tools"><div class="tl">↶</div><div class="tl">▣</div><div class="tl">⚓</div><div class="sail">أبحر</div></div></div>'''
# ---------- C: Paper cut ----------
C=dict(colors={1:'#e85d4a',2:'#2e7d9a',3:'#e9b23f'})
paper='repeating-radial-gradient(circle at 20% 30%, rgba(0,0,0,.025) 0 1px, transparent 1px 3px)'
cssC=f'''
#c {{ background: {paper}, linear-gradient(180deg,#f6ead3,#efdcbc); }}
#c .w {{ position:absolute; left:-20px; right:-20px; border-radius: 50% 50% 0 0 / 30px 30px 0 0; box-shadow: 0 -6px 12px rgba(60,40,10,.18); }}
#c .c {{ border-radius: 3px; background: {paper}, var(--c); box-shadow: 2px 4px 0 rgba(60,40,10,.22), 0 6px 10px rgba(60,40,10,.15); color: rgba(255,255,255,.95); font-weight: 900; }}
#c .col:nth-child(odd) .c:nth-child(2) {{ transform: rotate(-1.5deg); }} #c .col:nth-child(even) .c:nth-child(1) {{ transform: rotate(1deg); }}
#c .e {{ border: 1.5px dashed rgba(90,70,40,.3); border-radius: 3px; }}
#c .hull {{ width: 280px; height: 60px; margin-top: 0; background: {paper}, #2b3a4f; clip-path: polygon(0 0,100% 0,93% 100%,7% 100%); filter: drop-shadow(3px 5px 0 rgba(60,40,10,.25)); }}
#c .tag {{ background: {paper}, #fffaf0; padding: 6px 14px; font-weight: 800; color:#3b2f22; box-shadow: 2px 3px 0 rgba(60,40,10,.2); border-radius: 4px; transform: rotate(-1deg); }}
#c .p {{ width: 38px; height: 38px; border-radius: 50%; background: {paper}, var(--c); display:grid; place-items:center; color:#fff; font-weight:900; box-shadow: 2px 3px 0 rgba(60,40,10,.25); }}
#c .p.now {{ outline: 3px dashed var(--c); outline-offset: 4px; }}
#c .lvl {{ position:absolute; top:182px; left:50%; transform:translateX(-50%) rotate(-1deg); width:220px; height:40px; background:{paper},#fffaf0; box-shadow: 2px 3px 0 rgba(60,40,10,.2); z-index:5; border-radius:4px; }}
#c .lvl::before {{ content:""; position:absolute; top:12px; left:20px; right:20px; height:16px; border-radius:8px; background:#cfe3b0; box-shadow: inset 0 2px 3px rgba(0,0,0,.15); }}
#c .lvl i {{ position:absolute; top:14px; left:122px; width:30px; height:12px; border-radius:6px; background:#fff; }}
#c .tl {{ width:56px; height:56px; background:{paper},#fffaf0; display:grid; place-items:center; font-size:22px; color:#3b2f22; box-shadow: 2px 4px 0 rgba(60,40,10,.22); border-radius:6px; }}
#c .sail {{ background:{paper},#e85d4a; color:#fff; box-shadow: 3px 5px 0 rgba(60,40,10,.25); border-radius:6px; transform: rotate(.6deg); }}
#c .dk {{ position:absolute; bottom:118px; left:16px; right:16px; height:104px; background:{paper},#d9c39b; box-shadow: 0 -4px 10px rgba(60,40,10,.2); border-radius:6px; z-index:4; }}
'''
phC=f'''<div class="phone" id="c">
<div class="w" style="top:470px;bottom:0;background:{paper},#7fb7c7"></div><div class="w" style="top:500px;bottom:0;background:{paper},#5a9db3;left:-60px"></div><div class="w" style="top:540px;bottom:0;background:{paper},#3d7f98"></div>
<div class="top"><div class="tag">❚❚</div><div class="tag">المرحلة 9 · <span class="ltr">6/12</span></div><div class="tag">★</div></div>
<div class="ports"><span class="p now" style="--c:#e85d4a">●</span><span class="p" style="--c:#2e7d9a">▲</span><span class="p" style="--c:#e9b23f">■</span></div>
<div class="lvl"><i></i></div>
{ship_html('',C['colors'])}
<div class="dk"></div><div class="dockrow" style="bottom:150px">{dock(C['colors'])}</div>
<div class="tools"><div class="tl">↶</div><div class="tl">▣</div><div class="tl">⚓</div><div class="sail">أبحر</div></div></div>'''
# ---------- D: Vintage poster ----------
D=dict(colors={1:'#c8483a',2:'#3c7a77',3:'#d9a441'})
grain='radial-gradient(rgba(30,42,58,.08) 1px, transparent 1.2px) 0 0/4px 4px'
cssD=f'''
#d {{ background: {grain}, #f1e4c8; color:#1e2a3a; }}
#d .sun {{ position:absolute; top:260px; left:50%; width:520px; height:520px; margin-left:-260px; border-radius:50%; background: repeating-conic-gradient(#ead3a6 0 6deg, #f1e4c8 6deg 12deg); }}
#d .sun::after {{ content:""; position:absolute; inset:180px; border-radius:50%; background:#e8a24a; }}
#d .sea {{ position:absolute; top:520px; left:0; right:0; bottom:0; background: repeating-linear-gradient(180deg, #1e2a3a 0 10px, #26384d 10px 20px); }}
#d .c {{ background: {grain}, var(--c); border: 2.5px solid #1e2a3a; color:#f1e4c8; font-weight:900; }}
#d .e {{ border: 2px dashed rgba(30,42,58,.35); }}
#d .hull {{ width: 280px; height: 60px; margin-top: -2px; background: linear-gradient(180deg, #f1e4c8 0 8px, #1e2a3a 8px 40px, #c8483a 40px); border: 2.5px solid #1e2a3a; clip-path: polygon(0 0,100% 0,93% 100%,7% 100%); }}
#d .badge {{ border: 2.5px solid #1e2a3a; padding: 4px 12px; font-weight: 900; background:#f1e4c8; }}
#d .title {{ position:absolute; top:112px; left:0; right:0; text-align:center; font-family: Lalezar; font-size: 30px; letter-spacing: 1px; }}
#d .ports {{ top: 160px; }}
#d .p {{ width:36px; height:36px; border:2.5px solid #1e2a3a; background:var(--c); color:#f1e4c8; display:grid; place-items:center; font-weight:900; }}
#d .p.now {{ box-shadow: 4px 4px 0 #1e2a3a; }}
#d .ind {{ position:absolute; top:212px; left:50%; transform:translateX(-50%); width:220px; height:28px; border:2.5px solid #1e2a3a; background: {grain}, #f1e4c8; z-index:5; }}
#d .ind::before {{ content:"◀  يسار        يمين  ▶"; position:absolute; top:-1px; left:0; right:0; text-align:center; font-size:12px; font-weight:900; direction:ltr; }}
#d .ind i {{ position:absolute; top:-8px; left:128px; width:4px; height:40px; background:#c8483a; }}
#d .tl {{ width:54px; height:54px; border:2.5px solid #1e2a3a; background:#f1e4c8; display:grid; place-items:center; font-size:22px; box-shadow: 3px 3px 0 #1e2a3a; }}
#d .sail {{ background:#c8483a; color:#f1e4c8; border:2.5px solid #1e2a3a; box-shadow: 4px 4px 0 #1e2a3a; font-family: Lalezar; font-size: 24px; font-weight:400; letter-spacing:1px; }}
#d .dk {{ position:absolute; bottom:120px; left:20px; right:20px; height:98px; border:2.5px solid #1e2a3a; background: {grain}, #e9d6ae; z-index:4; }}
'''
phD=f'''<div class="phone" id="d"><div class="sun"></div><div class="sea"></div>
<div class="top"><div class="badge">❚❚</div><div class="badge">6 / 12</div><div class="badge">★★★</div></div>
<div class="title">المرحلة التاسعة</div>
<div class="ports"><span class="p now" style="--c:#c8483a">●</span><span class="p" style="--c:#3c7a77">▲</span><span class="p" style="--c:#d9a441">■</span></div>
<div class="ind"><i></i></div>
{ship_html('',D['colors'])}
<div class="dk"></div><div class="dockrow" style="bottom:150px">{dock(D['colors'])}</div>
<div class="tools"><div class="tl">↶</div><div class="tl">▣</div><div class="tl">⚓</div><div class="sail">أبحِر</div></div></div>'''
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>اتجاهات بصرية</title><style>{base}{cssA}{cssB}{cssC}{cssD}</style></head><body>
<h1>4 اتجاهات بصرية مختلفة لشاشة اللعب</h1><p class="lead">اختر الأسلوب، وأبني عليه كل الشاشات</p>
<main class="grid">
<figure>{phA.replace('id="a"','id="a" ')}<figcaption>1. الميناء الليلي المضيء<span>نيون وتوهج وانعكاسات</span></figcaption></figure>
<figure>{phB}<figcaption>2. مجسمات ناعمة<span>كأنها ألعاب من الصلصال</span></figcaption></figure>
<figure>{phC}<figcaption>3. الورق المقصوص<span>طبقات ورق بظلال وملمس</span></figcaption></figure>
<figure>{phD}<figcaption>4. ملصق السفر القديم<span>ألوان محدودة وخطوط عريضة وملمس طباعة</span></figcaption></figure>
</main></body></html>'''
open('/home/user/oya-agent-agent/design/cargo-styles/styles.html','w').write(html)
