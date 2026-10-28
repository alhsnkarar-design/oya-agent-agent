import runpy
G=runpy.run_path('/tmp/claude-0/-home-user-oya-agent-agent/7a9b771f-0dd7-531e-a63a-bfbcbb85613f/scratchpad/gen_pro_real.py')
css,D,ico,coin,starsvg,ct,ports_html=G['css'],G['D'],G['ico'],G['coin'],G['starsvg'],G['ct'],G['ports_html']
css=css.replace('url("../mockups/fonts/','url("../mockups/fonts/')
game=f'''<div class="phone" id="s1" style="background:url(render-game.png) center/390px 844px">
<div class="hud">
  <div class="goalbox" style="right:16px"><small>الموانئ</small><div class="ports">{ports_html([1,2,3])}</div></div>
  <div class="moves"><small>الحركات</small><b class="ltr">5</b></div>
  <div style="position:absolute;top:24px;left:16px"><div class="round">{ico('pause',22)}</div></div>
</div>
<div class="tilt" style="top:180px"><div class="tube"><i class="m" style="left:calc(50% - 20px)"></i><i class="m" style="left:calc(50% + 18px)"></i><i class="b" style="left:calc(50% + 16px)"></i></div></div>
<div class="tray"><div class="pier"><div class="pierItems"><svg width="54" height="40" viewBox="0 0 54 40" style="overflow:visible">{ct(1,1,2,label='2t')}</svg><svg width="54" height="40" viewBox="0 0 54 40" style="overflow:visible">{ct(1,1,3,label='5t')}</svg><div class="slotT">مؤقت</div></div></div>
<div class="boosters"><div class="bst">{ico('undo',28)}<span class="n">2</span><b>تراجع</b></div><div class="bst">{ico('box',28)}<span class="n">1</span><b>مكان مؤقت</b></div><div class="bst">{ico('anchor',28)}<span class="n">1</span><b>ثقل موازن</b></div><div class="big sailb off">{ico('sail',28)}أبحر</div></div></div>
</div>'''
home=f'''<div class="phone" id="s2" style="background:url(render-home.png) center/390px 844px">
<div class="bar"><div class="res">{coin(30)}<span class="ltr">1,250</span><span class="plus">+</span></div><div class="res">{starsvg(30)}<span>86</span></div><div class="sp"></div><div class="round">{ico('gear',24)}</div></div>
<div style="position:absolute;top:112px;left:14px;display:flex;flex-direction:column;gap:14px;z-index:9"><div class="round or" style="width:58px;height:58px;border-radius:18px">{ico('gift',28)}</div><div class="round" style="width:58px;height:58px;border-radius:18px">{ico('cal',28)}</div></div>
<div style="position:absolute;top:112px;right:14px;z-index:9"><div class="round" style="width:58px;height:58px;border-radius:18px;background:linear-gradient(180deg,#c7a6ff,#6a3be6);border-color:#4a1fb0;box-shadow:inset 0 3px 0 rgba(255,255,255,.45),0 4px 0 #3a1690">{ico('trophy',28)}</div></div>
<div style="position:absolute;top:186px;left:0;right:0;text-align:center;z-index:5"><div style="display:inline-block;font-family:Lalezar;font-size:30px;color:#fff;text-shadow:0 3px 0 #0b3f82,0 0 12px rgba(0,60,140,.4)">المستوى 2 · الأوزان</div>
 <div style="width:220px;height:20px;margin:6px auto 0;border-radius:10px;background:#0f3368;border:2.5px solid #0a2550;padding:2px"><i style="display:block;width:35%;height:100%;border-radius:8px;background:linear-gradient(180deg,#ffe36a,#ffb21a)"></i></div></div>
<div style="position:absolute;bottom:126px;left:30px;right:30px;z-index:9"><div class="big">العب <small>المرحلة 27</small></div></div>
<div class="nav"><div class="nv"><span class="ni">{ico('bag',26)}</span>المتجر</div><div class="nv"><span class="ni">{ico('ship',26)}</span>الأسطول</div><div class="nv on"><span class="ni">{ico('home',30)}</span>الرئيسية</div><div class="nv"><span class="ni">{ico('map',26)}</span>المستويات</div><div class="nv"><span class="ni">{ico('tool',26)}</span>الميناء</div></div>
</div>'''
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>لعبة شحن السفينة — تجربة 3D</title><style>{css} .grid{{grid-template-columns:repeat(2,390px)}}</style></head><body>{D}
<h1>تجربة ثلاثية الأبعاد</h1><p class="lead">مشهد 3D حقيقي (سفينة وحاويات وإضاءة وظلال) مع واجهة اللعبة فوقه</p>
<main class="grid"><figure>{game}<figcaption>اللعب<span>رندر ثلاثي الأبعاد</span></figcaption></figure><figure>{home}<figcaption>الرئيسية<span>رندر ثلاثي الأبعاد</span></figcaption></figure></main></body></html>'''
open('/home/user/oya-agent-agent/design/cargo-3d/screens.html','w').write(html)
