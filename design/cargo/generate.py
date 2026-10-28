P = {1:('#ff5a5f','●'),2:('#3d7cff','▲'),3:('#f5b81c','■'),4:('#2fbf71','◆'),5:('#9b6bff','⬢')}
def ct(p, w=None, extra='', cls=''):
    c,sym = P[p]
    wt = f'<b class="wt">{w}t</b>' if w else ''
    return f'<div class="ct {cls}" style="--c:{c};{extra}"><span class="sym">{sym}</span>{wt}</div>'
def col(stack, h, extra_cls=''):
    cells = ''.join(stack) + ''.join('<div class="slot"></div>' for _ in range(h-len(stack)))
    return f'<div class="col {extra_cls}">{cells}</div>'
def ship(cols, hull_w=None, extra=''):
    return f'<div class="ship" {extra}><div class="cols">{"".join(cols)}</div><div class="hull"><span class="porth"></span><span class="porth"></span><span class="porth"></span></div></div>'
def route(ports, cur=0):
    out=['<div class="route"><span class="r-ship">⛴️</span>']
    for i,p in enumerate(ports):
        c,s=P[p]
        out.append(f'<span class="r-arrow">‹</span><span class="r-port{" now" if i==cur else ""}" style="--c:{c}"><b>{i+1}</b>{s}</span>')
    out.append('</div>'); return ''.join(out)
def tilt(pos, limit=8, val='+3°'):
    return f'''<div class="tilt"><div class="t-lbl"><span>الميل</span><b class="ltr">{val}</b><span>الحد ±{limit}°</span></div>
    <div class="t-bar"><i class="t-safe"></i><i class="t-mid"></i><i class="t-needle" style="left:{pos}%"></i></div>
    <div class="t-ends"><span>يسار</span><span>يمين</span></div></div>'''
E = lambda e,s='': f'<i class="e" style="{s}">{e}</i>'

css = r'''
@font-face { font-family: "Cairo"; src: url("../mockups/fonts/Cairo.ttf"); font-weight: 200 1000; }
@font-face { font-family: "Lalezar"; src: url("../mockups/fonts/Lalezar-Regular.ttf"); }
@font-face { font-family: "Noto Sans Devanagari"; src: url("../mockups/fonts/NotoSansDevanagari.ttf"); font-weight: 100 900; }
@font-face { font-family: "Noto Sans Bengali"; src: url("../mockups/fonts/NotoSansBengali.ttf"); font-weight: 100 900; }
@font-face { font-family: "Noto Sans Telugu"; src: url("../mockups/fonts/NotoSansTelugu.ttf"); font-weight: 100 900; }
:root { --navy:#0f2f55; --navy2:#1b4a80; --sea1:#38a3e8; --sea2:#14609f; --sky:#bfe9ff; --orange:#ff8a3d; --orange-d:#e0631b;
  --yellow:#ffd23f; --green:#3cc46b; --green-d:#22924a; --red:#ff4d5e; --cream:#fff6e5; --cream-d:#f0e0c0; --ink:#13223a; --steel:#8c9bb0; --purple:#7b5cff; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Cairo", sans-serif; background: #0b1626; color: var(--ink); padding: 48px; }
.e { font-family: "Noto Color Emoji"; font-style: normal; line-height: 1; }
.ltr { direction: ltr; unicode-bidi: isolate; display: inline-block; }
.page-head { text-align: center; color: #fff; margin-bottom: 40px; }
.page-head h1 { font-family: "Lalezar"; font-weight: 400; font-size: 60px; color: var(--yellow); }
.page-head p { font-size: 20px; opacity: .8; }
.grid { display: grid; grid-template-columns: repeat(4, 390px); gap: 48px 40px; justify-content: center; }
.cell figcaption { color: #fff; text-align: center; margin-top: 14px; font-size: 20px; font-weight: 700; }
.cell figcaption span { display: block; font-size: 15px; font-weight: 400; opacity: .7; }
.phone { width: 390px; height: 844px; border-radius: 44px; overflow: hidden; position: relative; box-shadow: 0 0 0 10px #050b14, 0 30px 60px rgba(0,0,0,.5); }
.harbor { background: linear-gradient(180deg, #9fdcff 0%, #d9f2ff 38%, var(--sea1) 38.2%, var(--sea2) 100%); }
.harbor::before { content: ""; position: absolute; left: 0; right: 0; top: 38%; height: 70%; background: repeating-radial-gradient(ellipse 40px 6px at 50% 0, rgba(255,255,255,.18) 0 2px, transparent 3px 22px); opacity: .7; }
.night { background: linear-gradient(180deg, #0e2140 0%, #1d3b66 38%, #10406e 38.2%, #082a4d 100%); }
.deep { background: linear-gradient(180deg, var(--navy2), var(--navy)); }
/* hud */
.hud { position: absolute; top: 48px; left: 14px; right: 14px; display: flex; gap: 8px; align-items: center; z-index: 9; }
.pill { display: flex; align-items: center; gap: 6px; background: rgba(15,47,85,.7); color: #fff; border-radius: 30px; padding: 3px 4px 3px 12px; font-weight: 800; font-size: 16px; border: 2px solid rgba(255,255,255,.25); }
.pill .e { font-size: 19px; }
.pill .plus { width: 24px; height: 24px; border-radius: 50%; background: var(--green); display: grid; place-items: center; font-weight: 900; font-size: 18px; box-shadow: inset 0 -3px 0 rgba(0,0,0,.2); }
.spacer { flex: 1; }
.icon-btn { width: 44px; height: 44px; border-radius: 14px; background: #fff; display: grid; place-items: center; box-shadow: 0 4px 0 #b9c6d6; font-size: 22px; }
.stat { background: #fff; border-radius: 14px; padding: 2px 10px; text-align: center; box-shadow: 0 4px 0 #b9c6d6; }
.stat small { display: block; font-size: 11px; color: #5d6f86; font-weight: 700; }
.stat strong { font-size: 19px; line-height: 1.15; }
.btn { display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 20px; font-weight: 900; color: #fff; font-size: 22px; height: 62px; text-shadow: 0 2px 0 rgba(0,0,0,.18); }
.btn-green { background: linear-gradient(180deg, #5be08a, var(--green)); box-shadow: 0 6px 0 var(--green-d), 0 12px 20px rgba(0,0,0,.25); }
.btn-orange { background: linear-gradient(180deg, #ffad6b, var(--orange)); box-shadow: 0 6px 0 var(--orange-d), 0 12px 20px rgba(0,0,0,.25); }
.btn-blue { background: linear-gradient(180deg, #6fb6ff, #2f7fe0); box-shadow: 0 6px 0 #1d58a6, 0 12px 20px rgba(0,0,0,.25); }
.btn-purple { background: linear-gradient(180deg, #9c86ff, var(--purple)); box-shadow: 0 6px 0 #5134d4, 0 12px 20px rgba(0,0,0,.25); }
.adtag { background: rgba(255,255,255,.25); border-radius: 8px; padding: 0 8px; font-size: 13px; }
.btn-gray { background: linear-gradient(180deg, #c7d0dc, #9aa8ba); box-shadow: 0 6px 0 #77869a; }
.btn small { font-size: 14px; font-weight: 700; }
.title { position: absolute; top: 104px; left: 0; right: 0; text-align: center; color: #fff; font-family: "Lalezar"; font-weight: 400; font-size: 36px; text-shadow: 0 3px 0 rgba(0,0,0,.25); z-index: 5; }
.sub { position: absolute; top: 150px; left: 0; right: 0; text-align: center; color: rgba(255,255,255,.85); font-weight: 700; font-size: 14px; z-index: 5; }
/* containers & ship */
.ct { position: relative; width: 50px; height: 36px; border-radius: 4px; background:
  repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 2px, transparent 2px 7px), linear-gradient(180deg, color-mix(in srgb, var(--c) 85%, #fff), var(--c));
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.18), inset 0 3px 0 rgba(255,255,255,.35); display: grid; place-items: center; }
.ct .sym { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,.92); color: var(--c); display: grid; place-items: center; font-size: 14px; font-weight: 900; line-height: 1; }
.ct .wt { position: absolute; bottom: -2px; left: 2px; font-size: 10px; color: #fff; font-weight: 900; text-shadow: 0 1px 0 rgba(0,0,0,.5); }
.ct.bad { box-shadow: inset 0 0 0 2px rgba(0,0,0,.18), 0 0 0 3px var(--red), 0 0 12px 3px rgba(255,77,94,.8); }
.ct.ghost { opacity: .35; }
.ct.big2 { width: 104px; }
.ct.reefer::after { content: "❄"; position: absolute; top: -2px; right: 3px; font-size: 11px; color: #fff; }
.ct.glass { background: linear-gradient(160deg, rgba(220,245,255,.95), rgba(150,210,245,.85)); }
.ct.glass .sym { background: #fff; }
.ship { position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; }
.cols { display: flex; gap: 4px; align-items: flex-end; padding: 0 14px; position: relative; z-index: 2; }
.col { display: flex; flex-direction: column-reverse; gap: 2px; }
.slot { width: 50px; height: 36px; border-radius: 4px; border: 2px dashed rgba(255,255,255,.55); }
.col.locked .slot { border: 0; background: repeating-linear-gradient(45deg, rgba(0,0,0,.25) 0 6px, rgba(255,255,255,.12) 6px 12px); }
.col.drop .slot:first-of-type { border-color: var(--yellow); background: rgba(255,210,63,.25); }
.hull { width: 108%; height: 56px; margin-top: -2px; background: linear-gradient(180deg, #e9eef5 0 18%, #233f66 18% 70%, #b8343c 70%); clip-path: polygon(0 0, 100% 0, 93% 100%, 7% 100%);
  display: flex; justify-content: center; gap: 22px; align-items: center; padding-bottom: 6px; }
.porth { width: 9px; height: 9px; border-radius: 50%; background: #9fd6ff; }
.wave { position: absolute; left: 0; right: 0; height: 26px; background: radial-gradient(ellipse 22px 9px at 22px 0, transparent 9px, rgba(255,255,255,.5) 10px 11px, transparent 12px) 0 0/44px 26px repeat-x; z-index: 3; }
/* route & tilt */
.route { position: absolute; top: 106px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(255,255,255,.92); border-radius: 16px; padding: 6px 8px; z-index: 8; box-shadow: 0 4px 0 rgba(0,0,0,.12); }
.r-ship { font-family: "Noto Color Emoji"; font-size: 20px; }
.r-arrow { color: #9aa8ba; font-weight: 900; }
.r-port { display: flex; align-items: center; gap: 4px; background: var(--c); color: #fff; border-radius: 10px; padding: 1px 8px; font-weight: 900; font-size: 14px; }
.r-port b { font-size: 11px; background: rgba(0,0,0,.2); border-radius: 50%; width: 17px; height: 17px; display: grid; place-items: center; }
.r-port.now { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--c); }
.tilt { position: absolute; top: 158px; left: 26px; right: 26px; background: rgba(15,47,85,.75); border-radius: 16px; padding: 6px 12px 4px; color: #fff; z-index: 8; }
.t-lbl { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; } .t-lbl b { font-size: 15px; color: var(--yellow); }
.t-bar { position: relative; height: 12px; border-radius: 8px; margin: 4px 0 2px; background: linear-gradient(90deg, var(--red) 0 18%, #ffb23f 18% 26%, transparent 26% 74%, #ffb23f 74% 82%, var(--red) 82%); }
.t-safe { position: absolute; left: 26%; right: 26%; top: 0; bottom: 0; background: var(--green); }
.t-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; background: #fff; }
.t-needle { position: absolute; top: -6px; width: 6px; height: 24px; margin-left: -3px; border-radius: 3px; background: #fff; box-shadow: 0 0 0 2px var(--navy), 0 0 8px #fff; }
.t-ends { display: flex; justify-content: space-between; font-size: 10px; opacity: .7; direction: ltr; }
/* dock */
.dock { position: absolute; left: 0; right: 0; bottom: 118px; height: 112px; background: linear-gradient(180deg, #b9c2cd 0 10%, #8d98a6 10%); border-top: 4px solid #d8dee6; z-index: 4; }
.dock::before { content: ""; position: absolute; top: 10px; left: 0; right: 0; height: 6px; background: repeating-linear-gradient(90deg, var(--yellow) 0 18px, #222 18px 36px); opacity: .8; }
.dock-items { position: absolute; top: 30px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; }
.dock-lbl { position: absolute; top: 20px; right: 14px; font-size: 11px; font-weight: 800; color: #fff; background: rgba(0,0,0,.35); border-radius: 8px; padding: 0 8px; }
.temp { width: 58px; height: 44px; border: 2px dashed #fff; border-radius: 8px; display: grid; place-items: center; color: #fff; font-size: 10px; font-weight: 800; }
/* crane */
.crane { position: absolute; z-index: 7; }
.crane .arm { position: absolute; height: 12px; background: repeating-linear-gradient(90deg, var(--yellow) 0 10px, #e0a800 10px 12px); border-radius: 3px; box-shadow: 0 2px 0 #b98700; }
.crane .cable { position: absolute; width: 2px; background: #333; }
.crane .hook { position: absolute; }
/* bottom bar */
.bbar { position: absolute; bottom: 20px; left: 12px; right: 12px; display: flex; justify-content: space-around; align-items: flex-end; z-index: 9; }
.booster { text-align: center; position: relative; }
.booster .ic { width: 62px; height: 62px; border-radius: 20px; background: linear-gradient(180deg, #fff, #e7eef7); display: grid; place-items: center; box-shadow: 0 5px 0 #a9b8cb; }
.booster .ic .e { font-size: 30px; }
.booster b { display: block; margin-top: 4px; font-size: 11.5px; color: #fff; }
.booster .cnt { position: absolute; top: -6px; left: -4px; min-width: 26px; height: 26px; border-radius: 13px; background: var(--purple); color: #fff; font-weight: 900; font-size: 13px; display: grid; place-items: center; border: 3px solid #fff; }
.sail { width: 92px; height: 70px; border-radius: 20px; flex-direction: column; gap: 0; font-size: 18px; }
.sail .e { font-size: 24px; }
/* cards */
.dim { position: absolute; inset: 0; background: rgba(6,16,30,.6); z-index: 20; }
.card { position: absolute; left: 24px; right: 24px; z-index: 21; background: var(--cream); border-radius: 28px; padding: 62px 20px 22px; text-align: center; border: 5px solid #fff; box-shadow: 0 10px 0 var(--cream-d), 0 30px 60px rgba(0,0,0,.4); }
.ribbon { position: absolute; top: -32px; left: -16px; right: -16px; height: 66px; border-radius: 18px; display: grid; place-items: center; color: #fff; font-family: "Lalezar"; font-size: 36px; text-shadow: 0 3px 0 rgba(0,0,0,.2); }
.rb-green { background: linear-gradient(180deg, #5be08a, var(--green)); box-shadow: 0 6px 0 var(--green-d); }
.rb-red { background: linear-gradient(180deg, #ff8fa0, var(--red)); box-shadow: 0 6px 0 #b8202f; }
.rb-blue { background: linear-gradient(180deg, #8fd8ff, #3aa8e8); box-shadow: 0 6px 0 #1d6aa6; }
.card h3 { font-size: 20px; } .card p { color: #6a5d48; font-weight: 600; font-size: 15px; }
.card .btn { margin-top: 12px; }
.stars { position: absolute; top: -116px; left: 0; right: 0; display: flex; justify-content: center; align-items: flex-end; gap: 4px; }
.stars span { font-size: 68px; color: var(--yellow); -webkit-text-stroke: 4px #c99700; paint-order: stroke fill; text-shadow: 0 6px 0 #c99700; line-height: 1; }
.stars span:nth-child(2) { font-size: 90px; } .stars span.off { color: #d8cfbd; -webkit-text-stroke-color: #a99f8b; text-shadow: none; }
.rewards { display: flex; gap: 10px; justify-content: center; margin: 12px 0 4px; }
.reward { background: #fff; border-radius: 16px; width: 86px; padding: 8px 0; box-shadow: 0 4px 0 var(--cream-d); }
.reward .e { font-size: 30px; } .reward b { display: block; font-size: 18px; direction: ltr; }
.link { margin-top: 14px; color: #8a7a5c; font-weight: 700; font-size: 15px; text-decoration: underline; }
.demo { display: flex; align-items: center; justify-content: center; gap: 14px; margin: -4px 0 10px; }
.demo .arrow { font-size: 28px; font-weight: 900; color: var(--navy2); }
'''
screens=[]
def add(sid, title, sub, body, cls='harbor'):
    screens.append((sid,title,sub,f'<div class="phone {cls}" id="s{sid}">\n{body}\n</div>'))

# 1 splash
add(1,'شاشة البداية','الشعار والتحميل', f'''
  <style>.sp-sun{{position:absolute;inset:-60%;background:repeating-conic-gradient(rgba(255,255,255,.07) 0 10deg,transparent 10deg 20deg)}}</style>
  <div class="sp-sun"></div>
  <div style="position:absolute;top:150px;left:0;right:0;text-align:center">
    <div style="display:inline-grid;place-items:center;width:150px;height:150px;border-radius:40px;background:linear-gradient(180deg,#5cc1ff,#1f6fc0);box-shadow:0 0 0 6px rgba(255,255,255,.35),0 16px 30px rgba(0,0,0,.35)">
      <div style="transform:scale(.62);margin-top:30px">{ship([col([ct(1)],2),col([ct(2),ct(1)],2),col([ct(3)],2)])}</div></div>
    <div style="margin-top:34px;font-family:Lalezar;font-size:44px;color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.25)">حمّل · وازن · أبحر</div>
    <div style="display:inline-block;margin-top:14px;background:var(--orange);color:#fff;font-weight:900;letter-spacing:3px;padding:4px 20px;border-radius:30px;box-shadow:0 5px 0 var(--orange-d);direction:ltr">CARGO PUZZLE</div>
  </div>
  <div style="position:absolute;bottom:120px;left:70px;right:70px;height:20px;border-radius:20px;background:rgba(0,0,0,.25);padding:4px"><i style="display:block;width:64%;height:100%;border-radius:20px;background:linear-gradient(90deg,var(--yellow),var(--orange))"></i></div>
''','deep')

# 2 home
add(2,'الرئيسية','الميناء وسفينتك وزر اللعب', f'''
  <div class="hud"><div class="pill">{E('🪙')}1,250<span class="plus">+</span></div><div class="pill">{E('⭐')}86</div><div class="spacer"></div><div class="icon-btn">{E('⚙️')}</div></div>
  <div style="position:absolute;top:110px;right:14px;display:flex;flex-direction:column;gap:12px;z-index:6">
    <div style="text-align:center"><div class="icon-btn" style="width:58px;height:58px;border-radius:18px">{E('📅','font-size:28px')}</div><b style="font-size:11px;background:rgba(255,255,255,.85);border-radius:8px;padding:0 4px">لغز اليوم</b></div>
    <div style="text-align:center"><div class="icon-btn" style="width:58px;height:58px;border-radius:18px">{E('🏅','font-size:28px')}</div><b style="font-size:11px;background:rgba(255,255,255,.85);border-radius:8px;padding:0 4px">تحدي الأسبوع</b></div>
  </div>
  <div style="position:absolute;top:110px;left:14px;z-index:6;text-align:center"><div class="icon-btn" style="width:58px;height:58px;border-radius:18px">{E('🎁','font-size:28px')}</div><b style="font-size:11px;background:rgba(255,255,255,.85);border-radius:8px;padding:0 4px">هدية اليوم</b></div>
  <div style="position:absolute;top:190px;left:40px;width:16px;height:150px;background:repeating-linear-gradient(0deg,var(--yellow) 0 12px,#e0a800 12px 14px);z-index:3"></div>
  <div style="position:absolute;top:190px;left:40px;width:150px;height:12px;background:repeating-linear-gradient(90deg,var(--yellow) 0 12px,#e0a800 12px 14px);z-index:3"></div>
  <div style="position:absolute;top:202px;left:170px;width:2px;height:40px;background:#333;z-index:3"></div>
  <div style="position:absolute;top:242px;left:146px;z-index:3">{ct(4)}</div>
  {ship([col([ct(1),ct(1)],3),col([ct(3),ct(2),ct(1)],3),col([ct(2),ct(2)],3),col([ct(3)],3)],extra='style="top:250px"')}
  <div class="wave" style="top:440px"></div>
  <div style="position:absolute;top:470px;left:30px;right:30px;background:#fff;border-radius:18px;padding:10px 14px;box-shadow:0 6px 0 #b9c6d6;z-index:5">
    <div style="display:flex;justify-content:space-between;font-weight:800"><span>⚓ المستوى 2: الأوزان</span><span>7 / 20</span></div>
    <div style="height:12px;border-radius:8px;background:#e3eaf2;margin-top:6px;overflow:hidden"><i style="display:block;width:35%;height:100%;background:linear-gradient(90deg,var(--yellow),var(--orange))"></i></div>
  </div>
  <div style="position:absolute;bottom:118px;left:36px;right:36px;z-index:6"><div class="btn btn-green" style="height:80px;font-size:30px">العب<small style="display:block">المرحلة 27</small></div></div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:92px;background:var(--navy);display:flex;padding:8px 10px 16px;border-top:4px solid var(--navy2);z-index:6">
    {''.join(f'<div style="flex:1;text-align:center;color:{"#fff" if on else "rgba(255,255,255,.7)"};font-size:12px;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;{"background:#2f7fe0;transform:translateY(-12px);box-shadow:0 6px 0 #1d58a6" if on else ""}">{E(i,"font-size:26px")}{t}</div>' for i,t,on in [('🛒','المتجر',0),('🚢','الأسطول',0),('🏠','الرئيسية',1),('🗺️','المستويات',0),('🏗️','الميناء',0)])}
  </div>
''')

# 3 worlds
worlds=[('الميناء الهادئ','☀️',20,60,'#7fd0ff'),('الأوزان','⚖️',7,18,'#ffc56b'),('الحاويات الكبيرة','📦',0,0,'#ff9f7a'),('المبرّدات','❄️',0,0,'#b08cff'),('القابل للكسر','🧊',0,0,'#7ad9c9'),('البحر الهائج','🌊',0,0,'#6c8cff'),('محطات التحميل','🏗️',0,0,'#9ad16b'),('الأسطول','🚢',0,0,'#ff8fb0'),('الحمولة السائلة','🛢️',0,0,'#5cc7e8'),('الرحلة الكبرى','🏆',0,0,'#ffd23f')]
rows=''
for i,(n,e,done,st,c) in enumerate(worlds):
    lock = done==0
    rows+=f'''<div class="w-row{' lock' if lock else ''}" style="--c:{c}"><div class="w-ic">{E(e,'font-size:22px')}</div><div class="w-t"><b>{i+1}. {n}</b><span>{'🔒 يُفتح بإكمال المستوى السابق' if lock else f'{done} / 20 مرحلة · ⭐ {st}'}</span></div>{'' if lock else ('<span class="w-ok">✓</span>' if done==20 else '<span class="w-go">العب</span>')}</div>'''
add(3,'المستويات','10 مستويات، في كل مستوى 20 مرحلة', f'''
  <style>.w-list{{position:absolute;top:160px;left:18px;right:18px;display:flex;flex-direction:column;gap:6px}}
  .w-row{{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:3px 10px;height:56px;box-shadow:0 4px 0 rgba(0,0,0,.18);border-right:6px solid var(--c)}}
  .w-row.lock{{opacity:.6;filter:grayscale(.6)}}
  .w-ic{{width:38px;height:38px;border-radius:12px;background:color-mix(in srgb,var(--c) 30%,#fff);display:grid;place-items:center}}
  .w-t{{flex:1}} .w-t b{{display:block;font-size:15px}} .w-t span{{font-size:11.5px;color:#5d6f86}}
  .w-ok{{color:var(--green);font-weight:900;font-size:22px}} .w-go{{background:var(--green);color:#fff;font-weight:900;border-radius:12px;padding:4px 12px;box-shadow:0 3px 0 var(--green-d)}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('⭐')}86</div></div>
  <h2 class="title">المستويات</h2>
  <div class="w-list">{rows}</div>
''','deep')

# 4 stages grid
cells=''
for k in range(1,21):
    n=20+k
    if k<7: st,cls='★★★' if k%3 else '★★☆','done'
    elif k==7: st,cls='','cur'
    else: st,cls='','lock'
    if k==20: cls+=' boss'
    cells+=f'<div class="sg {cls}"><b>{n}</b><span>{st}</span></div>'
add(4,'مراحل المستوى','20 مرحلة، والأخيرة هي المرحلة الكبرى', f'''
  <style>.sgrid{{position:absolute;top:200px;left:22px;right:22px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}}
  .sg{{height:74px;border-radius:18px;background:#c9d2de;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 5px 0 #9aa8ba;color:#6b7a8f}}
  .sg b{{font-size:24px}} .sg span{{font-size:13px;color:var(--yellow);-webkit-text-stroke:.6px #b98700;letter-spacing:1px}}
  .sg.done{{background:linear-gradient(180deg,#ffd96b,#f2b200);box-shadow:0 5px 0 #b98700;color:#fff}} .sg.done span{{color:#fff;-webkit-text-stroke:.6px #b98700}}
  .sg.cur{{background:linear-gradient(180deg,#5be08a,var(--green));box-shadow:0 5px 0 var(--green-d),0 0 0 4px #fff;color:#fff}}
  .sg.boss{{grid-column:span 4;height:70px;flex-direction:row;gap:10px}} .sg.boss::before{{content:"🏆 المرحلة الكبرى";font-weight:900;font-size:15px}}
  .sg.lock b::after{{content:" 🔒";font-size:14px}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('⭐')}18 / 60</div></div>
  <h2 class="title">المستوى 2: الأوزان</h2>
  <div class="sub">حاويات بأوزان من 1 إلى 5 طن</div>
  <div class="sgrid">{cells}</div>
''','deep')

# 5 gameplay core
crane_html=f'''<div class="crane" style="top:244px;left:0;right:0;height:60px">
   <div class="arm" style="top:0;left:0;width:320px"></div>
   <div class="cable" style="top:12px;left:290px;height:10px"></div>
   <div class="hook" style="top:20px;left:265px">{ct(3)}</div></div>'''
game_hud=lambda lvl,mv: f'''<div class="hud"><div class="icon-btn">{E('⏸️')}</div><div class="stat"><small>الحركات</small><strong class="ltr">{mv}</strong></div><div class="spacer"></div><div class="stat"><small>المرحلة</small><strong>{lvl}</strong></div></div>'''
bbar=lambda ready=False,left='4': f'''<div class="bbar">
  <div class="booster"><div class="ic">{E('↩️')}</div><span class="cnt">2</span><b>تراجع</b></div>
  <div class="booster"><div class="ic">{E('🏗️')}</div><span class="cnt">1</span><b>مكان مؤقت</b></div>
  <div class="booster"><div class="ic">{E('⚓')}</div><span class="cnt">1</span><b>ثقل موازن</b></div>
  <div class="booster"><div class="ic">{E('🔍')}</div><span class="cnt">3</span><b>معاينة</b></div>
  <div class="btn {'btn-green' if ready else 'btn-gray'} sail">{E('⛵')}أبحر{'' if ready else f'<small>بقي {left}</small>'}</div></div>'''
s5_ship=ship([col([ct(3),ct(2)],4),col([ct(3),ct(2),ct(1)],4),col([ct(2),ct(1)],4,'drop'),col([ct(3),ct(1),ct(1)],4)],extra='style="top:300px"')
add(5,'اللعب','حمّل الحاويات: وازن السفينة ورتّب حسب الموانئ', f'''
  {game_hud('9','6 / 12')}
  {route([1,2,3])}
  {tilt(58,8,'+3°')}
  {crane_html}
  {s5_ship}
  <div class="wave" style="top:520px"></div>
  <div class="dock"><span class="dock-lbl">الرصيف</span><div class="dock-items">{ct(1)}{ct(2)}{ct(3)}<div class="temp">مؤقت</div></div></div>
  {bbar(False,'4')}
''')

# 6 weights gameplay with bad order highlight
s6_ship=ship([col([ct(2,4),ct(1,2)],4),col([ct(3,5),ct(2,1),ct(1,3,cls='')],4),col([ct(1,2),ct(3,1,cls='bad')],4),col([ct(2,3)],4),col([ct(3,2),ct(1,4)],4)],extra='style="top:300px"')
add(6,'اللعب: مستوى الأوزان','الوزن مكتوب على كل حاوية، والتنبيه الأحمر يكشف الخطأ', f'''
  {game_hud('27','9 / 14')}
  {route([1,2,3])}
  {tilt(76,7,'+6°')}
  <div style="position:absolute;top:240px;left:40px;right:40px;z-index:8;background:var(--red);color:#fff;border-radius:12px;padding:4px 10px;font-weight:800;font-size:13px;text-align:center">⚠️ حاوية الميناء 3 فوق حاوية الميناء 1 · والسفينة تميل لليمين</div>
  {s6_ship}
  <div class="wave" style="top:520px"></div>
  <div class="dock"><span class="dock-lbl">الرصيف</span><div class="dock-items">{ct(2,2)}{ct(1,5)}<div class="temp">مؤقت</div></div></div>
  {bbar(False,'2')}
''')

# 7 success
add(7,'الإبحار الناجح','نجوم ومكافآت', f'''
  {ship([col([ct(3),ct(2),ct(1)],3),col([ct(3),ct(2),ct(1)],3),col([ct(3),ct(2),ct(1)],3)],extra='style="top:150px;transform:translateX(-50%) scale(.8)"')}
  <div class="wave" style="top:330px"></div>
  <div class="dim" style="background:rgba(6,16,30,.35)"></div>
  <div class="card" style="top:420px">
    <div class="stars"><span>★</span><span>★</span><span>★</span></div>
    <div class="ribbon rb-green">رحلة موفقة!</div>
    <h3>المرحلة 27 مكتملة</h3>
    <p>12 حركة · الحل الأمثل!</p>
    <div class="rewards"><div class="reward">{E('🪙')}<b>+25</b></div><div class="reward">{E('⭐')}<b>+3</b></div></div>
    <div class="btn btn-purple">ضاعف العملات ×2 <span class="adtag">▶ إعلان</span></div>
    <div class="btn btn-green">التالي</div>
  </div>
''')

# 8 fail
add(8,'السفينة مالت','تعرض مكان المشكلة وتعيد المحاولة فوراً', f'''
  {ship([col([ct(2,4),ct(1,5)],4),col([ct(3,2)],4),col([ct(1,3),ct(2,5),ct(3,4)],4)],extra='style="top:170px;transform:translateX(-50%) rotate(9deg) scale(.85)"')}
  <div class="wave" style="top:345px"></div>
  <div class="dim" style="background:rgba(6,16,30,.45)"></div>
  <div class="card" style="top:420px">
    <div class="ribbon rb-red">السفينة مالت!</div>
    <h3>الميل وصل إلى <span class="ltr">+11°</span> والحد <span class="ltr">8°</span></h3>
    <p>الجانب الأيمن أثقل بـ<span class="ltr">7</span> أطنان. جرّب نقل الحاويات الثقيلة إلى الوسط.</p>
    <div class="btn btn-orange">أعد المحاولة</div>
    <div class="btn btn-purple">تلميح مجاني <span class="adtag">▶ إعلان</span></div>
    <div class="link">تراجع خطوة ثم أكمل</div>
  </div>
''')

# 9 new element intro
add(9,'عنصر جديد','كل مستوى يبدأ بعنصر جديد يُشرح في نافذة واحدة', f'''
  {game_hud('61','0 / 10')}
  {route([1,2])}
  {ship([col([],3),col([],3,'locked'),col([],3)],extra='style="top:320px"')}
  <div class="wave" style="top:470px"></div>
  <div class="dim"></div>
  <div class="card" style="top:250px">
    <div class="ribbon rb-blue">عنصر جديد!</div>
    <div class="demo">{ct(4,cls='reefer')}<span class="arrow">+</span><span style="display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#ffe9a8;font-size:26px">🔌</span></div>
    <h3>الحاوية المبرّدة</h3>
    <p>يجب أن تكون ملاصقة لمقبس الكهرباء<br>طوال الرحلة، وإلا تفشل الشحنة.</p>
    <div class="btn btn-green">فهمت!</div>
  </div>
''')

# 10 fleet
fleet=[('قارب صغير','3 أعمدة','✓ مملوك',1),('سفينة متوسطة','حتى 5 أعمدة','✓ مملوكة',1),('سفينة كبيرة','حتى 6 أعمدة ومقابس كهرباء','🔒 المرحلة 101',0),('سفينة عملاقة','حتى 7 أعمدة وصهاريج','🔒 المرحلة 161',0)]
fr=''.join(f'<div class="fl{" lock" if not o else ""}"><div class="fl-img" style="transform:scale({.42-i*.03})">{ship([col([ct(1+(j%3))],1) for j in range(3+i)])}</div><div class="fl-t"><b>{n}</b><span>{d}</span></div><span class="fl-s">{s}</span></div>' for i,(n,d,s,o) in enumerate(fleet))
add(10,'الأسطول','سفن أكبر تُفتح مع التقدم', f'''
  <style>.fleet{{position:absolute;top:170px;left:18px;right:18px;display:flex;flex-direction:column;gap:12px}}
  .fl{{background:#fff;border-radius:20px;height:132px;position:relative;overflow:hidden;box-shadow:0 5px 0 rgba(0,0,0,.2);background:linear-gradient(180deg,#e6f5ff 0 55%,#9fd3f7 55%)}}
  .fl.lock{{filter:grayscale(.8);opacity:.75}}
  .fl-img{{position:absolute;top:4px;left:14px;width:220px;height:140px;transform-origin:left top}}
  .fl-img .ship{{left:200px;top:60px}}
  .fl-t{{position:absolute;top:14px;right:14px;text-align:right}} .fl-t b{{display:block;font-size:17px}} .fl-t span{{font-size:12px;color:#5d6f86}}
  .fl-s{{position:absolute;bottom:12px;right:14px;font-weight:900;font-size:13px;background:#fff;border-radius:10px;padding:1px 10px;color:var(--green-d)}}
  .fl.lock .fl-s{{color:#6b7a8f}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div></div>
  <h2 class="title">الأسطول</h2>
  <div class="fleet">{fr}</div>
''','deep')

# 11 port upgrade
ups=[('🏗️','رافعة أسرع','✓',0),('🧱','رصيف أوسع','✓',0),('💡','إضاءة الميناء','15',1),('🏢','مكتب الميناء','25',0),('🚦','منارة','40',0)]
ur=''.join(f'<div class="up{" done" if s=="✓" else ""}"><div class="up-ic">{E(e,"font-size:26px")}</div><b>{n}</b>{"<span class=up-ok>✓</span>" if s=="✓" else (f"<span class=up-buy>⭐ {s} طوّر</span>" if a else f"<span class=up-cost>⭐ {s}</span>")}</div>' for e,n,s,a in ups)
add(11,'تطوير الميناء','النجوم تطوّر ميناءك', f'''
  <style>.ups{{position:absolute;top:430px;left:18px;right:18px;display:flex;flex-direction:column;gap:8px}}
  .up{{display:flex;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:7px 10px;box-shadow:0 4px 0 rgba(0,0,0,.15)}}
  .up.done{{opacity:.65}} .up b{{flex:1;font-size:15px}} .up-ic{{width:42px;height:42px;border-radius:12px;background:#eaf3fb;display:grid;place-items:center}}
  .up-ok{{color:var(--green);font-weight:900;font-size:22px;padding:0 10px}} .up-buy{{background:var(--green);color:#fff;font-weight:900;border-radius:12px;padding:4px 12px;box-shadow:0 3px 0 var(--green-d)}} .up-cost{{font-weight:900;color:#6b7a8f}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('⭐')}18</div></div>
  <h2 class="title" style="color:var(--navy)">تطوير الميناء</h2>
  <div style="position:absolute;top:170px;left:20px;right:20px;height:240px;border-radius:22px;overflow:hidden;border:5px solid #fff;background:linear-gradient(180deg,#bfe9ff 0 55%,#8d98a6 55% 62%,var(--sea1) 62%)">
    <div style="position:absolute;top:30px;left:30px;width:12px;height:110px;background:repeating-linear-gradient(0deg,var(--yellow) 0 10px,#e0a800 10px 12px)"></div>
    <div style="position:absolute;top:30px;left:30px;width:120px;height:10px;background:repeating-linear-gradient(90deg,var(--yellow) 0 10px,#e0a800 10px 12px)"></div>
    <div style="position:absolute;top:70px;right:30px;width:70px;height:62px;background:#e9eef5;border-radius:6px 6px 0 0;box-shadow:inset 0 -14px 0 #c9d2de"></div>
    <div style="position:absolute;top:96px;left:150px;display:flex;gap:2px">{ct(1)}{ct(2)}</div>
    <div style="position:absolute;top:56px;left:150px">{ct(3)}</div>
    <div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;color:#fff;font-weight:800;font-size:12px">مستوى الميناء 3</div>
  </div>
  <div class="ups">{ur}</div>
''','harbor')

# 12 shop
add(12,'المتجر','مشتريات واضحة وعملات مجانية بإعلان اختياري', f'''
  <style>.shop-t{{position:absolute;top:100px;left:0;right:0;text-align:center;font-family:Lalezar;font-size:38px;color:var(--yellow)}}
  .trust{{position:absolute;top:150px;left:20px;right:20px;background:rgba(60,196,107,.18);border:2px solid var(--green);border-radius:14px;padding:5px 10px;font-size:13px;font-weight:700;text-align:center;color:#fff}}
  .offer{{position:absolute;left:20px;right:20px;border-radius:20px;padding:12px 14px;display:flex;align-items:center;gap:12px;color:#fff}}
  .offer .tx{{flex:1}} .offer .tx b{{display:block;font-size:17px}} .offer .tx span{{font-size:12.5px;opacity:.95}}
  .price{{background:var(--green);color:#fff;font-weight:900;border-radius:12px;padding:7px 12px;box-shadow:0 4px 0 var(--green-d);font-size:16px;direction:ltr;white-space:nowrap}}
  .coins{{position:absolute;top:408px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr;gap:12px}}
  .cp{{background:#fff;border-radius:18px;padding:6px 8px;text-align:center;box-shadow:0 5px 0 #9fb2c9;position:relative}}
  .cp b{{display:block;font-size:19px}} .cp .price{{display:block;margin-top:6px}}
  .cp .tag{{position:absolute;top:-10px;right:-6px;background:var(--red);color:#fff;font-size:11px;font-weight:900;padding:1px 8px;border-radius:8px}}
  .bonus{{direction:ltr;unicode-bidi:isolate;display:inline-block;background:var(--yellow);color:var(--ink);font-size:11px;font-weight:900;border-radius:8px;padding:0 6px}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('🪙')}1,250</div></div>
  <div class="shop-t">المتجر</div>
  <div class="trust">✅ لا صناديق حظ · ترى ما تشتريه · الإعلانات اختيارية</div>
  <div class="offer" style="top:196px;background:linear-gradient(135deg,var(--orange),#ff5f6d);box-shadow:0 6px 0 #b8402a">{E('🎒','font-size:40px')}<div class="tx"><b>حزمة البداية · مرة واحدة</b><span>1000 🪙 + 3 ↩️ + 3 🏗️ + 2 ⚓</span></div><span class="price">$0.99</span></div>
  <div class="offer" style="top:300px;background:linear-gradient(135deg,#2f7fe0,#6a5cff);box-shadow:0 6px 0 #1d4fa6">{E('🗺️','font-size:40px')}<div class="tx"><b>افتح الحملة كاملة</b><span>كل المستويات العشرة + 500 🪙</span></div><span class="price">$2.99</span></div>
  <div class="coins">
    <div class="cp">{E('🪙','font-size:36px')}<b>500</b><span class="price">$0.49</span></div>
    <div class="cp"><span class="tag">الأكثر شراءً</span>{E('💰','font-size:36px')}<b>1,200</b><span class="price">$0.99</span></div>
    <div class="cp">{E('💰','font-size:36px')}<b>3,500 <span class="bonus">+15%</span></b><span class="price">$2.99</span></div>
    <div class="cp"><span class="tag">أفضل قيمة</span>{E('🏦','font-size:36px')}<b>10,000 <span class="bonus">+40%</span></b><span class="price">$5.99</span></div>
  </div>
  <div style="position:absolute;bottom:22px;left:20px;right:20px"><div class="btn btn-purple" style="height:56px">{E('🪙')} 50 مجاناً <span class="adtag">▶ إعلان</span></div></div>
  <div style="position:absolute;bottom:96px;left:20px;right:20px;background:rgba(255,255,255,.12);border-radius:16px;padding:8px;color:#fff;text-align:center;font-weight:800">{E('🎨')} أشكال السفن والموانئ · من <span class="ltr">$0.99</span></div>
''','deep')

# 13 daily
add(13,'لغز اليوم','شحنة واحدة للجميع، وشارك نتيجتك', f'''
  <style>.dc{{position:absolute;top:200px;left:26px;right:26px;background:var(--cream);border-radius:28px;padding:22px 20px 20px;text-align:center;border:5px solid #fff;box-shadow:0 10px 0 var(--cream-d)}}
  .dc .ok{{display:inline-block;background:var(--green);color:#fff;font-weight:900;border-radius:14px;padding:2px 16px;box-shadow:0 4px 0 var(--green-d)}}
  .dc .mv{{margin-top:12px;font-size:38px;font-weight:900}} .dc .st{{font-size:38px;color:var(--yellow);-webkit-text-stroke:2px #c99700;letter-spacing:4px;line-height:1.1}}
  .dc .gr{{display:flex;flex-direction:column;gap:4px;margin:14px 0;font-family:"Noto Color Emoji";font-size:28px;line-height:1;direction:ltr}}
  .dc .rk{{font-weight:800;color:#6a5d48;margin-bottom:6px}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('🔥')}5 أيام</div></div>
  <h2 class="title">لغز اليوم</h2>
  <div class="sub">نفس الشحنة لكل اللاعبين اليوم</div>
  <div class="dc"><span class="ok">✓ أبحرت بنجاح!</span>
    <div class="mv"><span class="ltr">11</span> حركة</div><div class="st">★★★</div>
    <div class="gr"><span>🟩🟩🟩🟨🟩</span><span>🟩🟩🟨🟩🟩</span><span>🟩🟩🟩🟩🟩</span></div>
    <div class="rk">حركات أقل من <b class="ltr">76%</b> من اللاعبين</div>
    <div class="btn btn-green">شارك النتيجة {E('📤')}</div></div>
  <div style="position:absolute;bottom:40px;left:0;right:0;text-align:center;color:#fff;font-weight:800">شحنة جديدة بعد <b class="ltr" style="background:rgba(0,0,0,.25);border-radius:10px;padding:2px 10px">08:12:45</b></div>
''','deep')

# 14 weekly
lb=[('1','S','Ship_Master','38',1,0),('2','أ','أنت','41',0,1),('3','B','Blue_Harbor','45',0,0),('4','ن','نجم_الموانئ','52',0,0)]
lbr=''.join(f'<div class="lb{" gold" if g else ""}{" me" if m else ""}"><span class="pos">{p}</span><span class="av">{a}</span><b>{n}</b><span class="t"><span class="ltr">{t}</span> حركة</span></div>' for p,a,n,t,g,m in lb)
add(14,'تحدي الأسبوع','5 شحنات متتالية، وأقل حركات يفوز', f'''
  <style>.steps{{position:absolute;top:196px;left:30px;right:30px;display:flex;align-items:center}}
  .steps i{{flex:1;height:6px;background:rgba(255,255,255,.35);border-radius:3px}}
  .steps .st{{width:46px;height:46px;border-radius:50%;background:#c9d2de;color:#6b7a8f;display:grid;place-items:center;font-weight:900;font-size:20px;box-shadow:0 4px 0 #9aa8ba}}
  .steps .done{{background:linear-gradient(180deg,#ffd96b,#f2b200);color:#fff;box-shadow:0 4px 0 #b98700}} .steps .cur{{width:58px;height:58px;background:linear-gradient(180deg,#5be08a,var(--green));color:#fff;box-shadow:0 5px 0 var(--green-d),0 0 0 6px rgba(255,255,255,.4)}}
  .board{{position:absolute;top:282px;left:22px;right:22px;background:var(--cream);border-radius:24px;padding:12px 12px 8px;border:4px solid #fff;box-shadow:0 8px 0 var(--cream-d)}}
  .board h4{{text-align:center;margin-bottom:8px}}
  .lb{{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:7px 10px;margin-bottom:6px;box-shadow:0 3px 0 var(--cream-d)}}
  .lb .pos{{width:24px;font-weight:900;text-align:center;color:#8a7a5c}} .lb .av{{width:34px;height:34px;border-radius:50%;background:#2f7fe0;color:#fff;font-weight:900;display:grid;place-items:center}}
  .lb b{{flex:1}} .lb .t{{font-weight:900;color:var(--navy2);font-size:13px}} .lb.gold .av{{background:linear-gradient(180deg,#ffd96b,#f2b200)}} .lb.me{{box-shadow:0 0 0 3px var(--green)}} .lb.me .av{{background:var(--green)}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div><div class="pill">{E('⏳')}3 أيام 4 س</div></div>
  <h2 class="title">تحدي الأسبوع</h2>
  <div class="sub">5 شحنات متتالية · أقل حركات يفوز</div>
  <div class="steps"><span class="st done">1</span><i></i><span class="st done">2</span><i></i><span class="st cur">3</span><i></i><span class="st">4</span><i></i><span class="st">5</span></div>
  <div class="board"><h4>ترتيب الأصدقاء</h4>{lbr}</div>
  <div style="position:absolute;top:592px;left:22px;right:22px;background:rgba(0,0,0,.25);color:#fff;border-radius:16px;padding:8px 12px;text-align:center;font-size:14px">🏆 جائزة المركز الأول:<b style="display:block;font-size:17px;direction:ltr">500 🪙 + 3 ↩️ + 3 🏗️</b></div>
  <div style="position:absolute;bottom:40px;left:30px;right:30px"><div class="btn btn-green">العب الشحنة 3</div></div>
''','deep')

# 15 zen
add(15,'وضع الهدوء','دون حد حركات ودون خسارة', f'''
  <div class="hud"><div class="icon-btn">{E('⏸️')}</div><div class="spacer"></div><div class="stat"><small>هادئة</small><strong>4</strong></div></div>
  <div style="position:absolute;top:100px;left:60px;right:60px;z-index:8;background:#fff;border-radius:22px;padding:8px;text-align:center;box-shadow:0 0 0 5px #bfe8d5,0 7px 0 5px #9fd4bc">{E('🍃','font-size:30px')}<b style="display:block;color:#1d7a52;font-size:18px">وضع الهدوء</b><span style="font-size:12px;color:#5c8f78;font-weight:700">بلا حد حركات · بلا خسارة</span></div>
  {route([1,2])}
  <style>#s15 .route{{top:214px}} #s15 .tilt{{top:262px}}</style>
  {tilt(46,10,'-1°')}
  {ship([col([ct(2),ct(1)],3),col([ct(2)],3),col([ct(2),ct(1)],3)],extra='style="top:340px"')}
  <div class="wave" style="top:520px"></div>
  <div class="dock"><span class="dock-lbl">الرصيف</span><div class="dock-items">{ct(1)}{ct(2)}</div></div>
  <div class="bbar"><div class="booster"><div class="ic">{E('↩️')}</div><b>تراجع</b></div><div class="btn btn-gray sail">{E('⛵')}أبحر<small>بقي 2</small></div></div>
''','harbor" style="background:linear-gradient(180deg,#d8f3e8 0%,#eef9f4 38%,#7cc9d8 38.2%,#4a9fb8 100%)')

# 16 settings
add(16,'الإعدادات','اللغة والصوت والاهتزاز والخصوصية', f'''
  <style>.sb{{position:absolute;top:170px;left:18px;right:18px;display:flex;flex-direction:column;gap:12px}}
  .sg4 h4{{color:rgba(255,255,255,.85);font-size:13px;margin:0 6px 6px}} .scd{{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 5px 0 rgba(0,0,0,.2)}}
  .sr{{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid #e6edf4}} .sr:last-child{{border:0}}
  .sr .ri{{width:36px;height:36px;border-radius:11px;background:#eaf3fb;display:grid;place-items:center}} .sr b{{flex:1;font-size:15px}} .sr .v{{color:#2f7fe0;font-weight:800;font-size:14px}} .sr .ch{{color:#9aa8ba;font-weight:900}}
  .tg{{width:50px;height:28px;border-radius:20px;background:var(--green);position:relative}} .tg::after{{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div></div>
  <h2 class="title">الإعدادات</h2>
  <div class="sb">
    <div class="sg4"><h4>اللغة</h4><div class="scd"><div class="sr"><div class="ri">{E('🌐','font-size:20px')}</div><b>لغة اللعبة</b><span class="v">العربية · تلقائي</span><span class="ch">‹</span></div></div></div>
    <div class="sg4"><h4>الصوت والتنبيهات</h4><div class="scd"><div class="sr"><div class="ri">{E('🔊','font-size:20px')}</div><b>المؤثرات الصوتية</b><span class="tg"></span></div><div class="sr"><div class="ri">{E('📳','font-size:20px')}</div><b>الاهتزاز</b><span class="tg"></span></div></div></div>
    <div class="sg4"><div class="scd"><div class="sr"><div class="ri">{E('🔒','font-size:20px')}</div><b>سياسة الخصوصية</b><span class="ch">‹</span></div></div></div>
  </div>
''','deep')

# 17 language
langs=[('العربية','Arabic',1,1),('English','الإنجليزية',0,0),('中文 (简体)','الصينية',0,0),('हिन्दी','الهندية',0,0),('Español','الإسبانية',0,0),('Français','الفرنسية',0,0),('বাংলা','البنغالية',0,0),('Português','البرتغالية',0,0),('Русский','الروسية',0,0),('Bahasa Indonesia','الإندونيسية',0,0),('اردو','الأردية',0,1),('Deutsch','الألمانية',0,0),('日本語','اليابانية',0,0),('Naijá','البيجين النيجيرية',0,0),('मराठी','المراثية',0,0),('Tiếng Việt','الفيتنامية',0,0),('తెలుగు','التيلوغو',0,0),('Hausa','الهوسا',0,0),('Türkçe','التركية',0,0)]
lg=''.join(f'<div class="lg{" sel" if s else ""}"><div class="n"><b dir="{"rtl" if r else "ltr"}">{n}</b><span>{a}{" <i class=dir>RTL</i>" if r else ""}</span></div></div>' for n,a,s,r in langs)
add(17,'اختيار اللغة','19 لغة + تلقائي حسب الجهاز', f'''
  <style>.ls{{position:absolute;top:160px;left:18px;right:18px;height:44px;background:#fff;border-radius:16px;display:flex;align-items:center;gap:8px;padding:0 14px;color:#9aa8ba;font-weight:700;font-size:14px}}
  .la{{position:absolute;top:216px;left:18px;right:18px;background:#fff;border-radius:18px;padding:9px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 0 0 3px var(--yellow),0 5px 0 3px #c99700}}
  .la .t{{flex:1}} .la b{{display:block;font-size:15px}} .la span{{font-size:12px;color:#5d6f86}}
  .rd{{width:24px;height:24px;border-radius:50%;border:3px solid var(--green);background:radial-gradient(circle,var(--green) 0 5px,#fff 6px)}}
  .lsub{{position:absolute;top:290px;left:24px;right:24px;display:flex;justify-content:space-between;color:#fff;font-size:13px;font-weight:800}}
  .lgrid{{position:absolute;top:314px;left:18px;right:18px;display:grid;grid-template-columns:1fr 1fr;gap:5px 6px}}
  .lg{{background:rgba(255,255,255,.95);border-radius:13px;padding:2px 10px;height:38px;display:flex;align-items:center;position:relative}}
  .lg .n{{flex:1;min-width:0}} .lg b{{display:block;font-size:13.5px;line-height:19px;height:19px;white-space:nowrap;overflow:hidden;font-family:"Cairo","Noto Sans Devanagari","Noto Sans Bengali","Noto Sans Telugu","WenQuanYi Zen Hei","IPAGothic","Inter",sans-serif}}
  .lg .n>span{{display:block;font-size:10.5px;color:#5d6f86;line-height:14px;white-space:nowrap}}
  .lg .dir{{font-style:normal;font-size:9px;font-weight:900;color:var(--purple);background:#efeaff;border-radius:6px;padding:0 4px;margin-right:4px}}
  .lg.sel{{background:#fff;box-shadow:0 0 0 3px var(--green)}} .lg.sel::after{{content:"✓";position:absolute;top:-7px;left:-5px;width:20px;height:20px;border-radius:50%;background:var(--green);color:#fff;font-size:12px;font-weight:900;display:grid;place-items:center;border:2px solid #fff}}</style>
  <div class="hud"><div class="icon-btn">{E('⬅️')}</div><div class="spacer"></div></div>
  <h2 class="title">اللغة · Language</h2>
  <div class="ls">{E('🔍')}ابحث عن لغتك… Search</div>
  <div class="la">{E('📱','font-size:26px')}<div class="t"><b>تلقائي — لغة الجهاز</b><span>تم اكتشاف: العربية</span></div><span class="rd"></span></div>
  <div class="lsub"><span>كل اللغات</span><span>19</span></div>
  <div class="lgrid">{lg}</div>
''','deep')

html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>لعبة شحن السفينة — التصاميم</title><style>{css}</style></head><body>
<header class="page-head"><h1>لغز شحن السفينة</h1><p>تصاميم كل شاشات اللعبة — محايدة، ودون كائنات حية، وإعلاناتها اختيارية</p></header>
<main class="grid">
{''.join(f'<figure class="cell">{h}<figcaption>{i}. {t}<span>{s}</span></figcaption></figure>' for i,t,s,h in screens)}
</main></body></html>'''
open('/home/user/oya-agent-agent/design/cargo/cargo-mockups.html','w').write(html)
print(len(screens))
