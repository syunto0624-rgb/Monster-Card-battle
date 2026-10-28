(function(root){
const races=['ドラゴン','獣人','精霊','機械','アンデッド','天使','悪魔','海獣','妖精','魔導士'];
const rarities=['ノーマル','レア','スーパーレア','ハイパーレア','ウルトラレア'];
const elements=[{id:'fire',name:'火',symbol:'炎',color:'#f1a080',role:'破壊・パワー強化'},{id:'water',name:'水',symbol:'滴',color:'#82d5f5',role:'ドロー・手札への帰還'},{id:'wood',name:'木',symbol:'葉',color:'#a5d79a',role:'エネルギー増加・回復'},{id:'light',name:'光',symbol:'輝',color:'#eed89b',role:'ブロッカー・能力耐性'},{id:'dark',name:'闇',symbol:'影',color:'#c3a3ef',role:'墓地回収・復活召喚'}];
const prefixes=['暁の','森の','蒼穹の','鋼鉄の','黄昏の','聖域の','深淵の','潮騒の','月光の','星読みの'];
const names=['幼竜','斥候','守護者','戦士','狩人','騎士','賢者','覇者','古王','神皇'];
const labels={block:'ブロッカー：未行動ならタップして攻撃を引き受ける。',ward:'能力耐性：相手のカードの効果を受けない（戦闘は有効）。'};
const cards=[];
function attribute(c,n){c.element=elements[n].id;c.elementId=n;return c}
for(let r=0;r<10;r++)for(let j=0;j<10;j++){
 let tier=Math.floor(j/2),cost=1+Math.floor(j*.75),el=r%5,variant=j%2,value=200+tier*100,limit=600+tier*400,cap=Math.max(1,cost-1);
 let effects=[['summonDestroy','summonBoost'],['summonDraw','summonBounce'],['summonRamp','summonHeal'],['block','ward'],['summonRecover','summonRevive']];let ab=j===0?'':effects[el][variant];
 let texts={summonDestroy:`召喚時：能力耐性のない敵のうち、パワー${limit}以下で最も低い1体を破壊。`,summonBoost:`召喚時：自身のパワーを永続で${value}上げる。`,summonDraw:'召喚時：カードを1枚引く。',summonBounce:`召喚時：能力耐性のないコスト${cap}以下の敵のうち、最も高コストの1体を手札に戻す。`,summonRamp:'召喚時：エネルギー総量と現在値を1増やす。',summonHeal:`召喚時：自分の体力を${400+tier*200}回復。`,...labels,summonRecover:'召喚時：デッキの上から2枚を墓地へ送り、墓地の最高コストの味方モンスター1体を手札へ。',summonRevive:`召喚時：デッキの上から2枚を墓地へ送り、墓地からコスト${cap}以下で最高コストの味方1体を追加コストなしで復活召喚。召喚時能力は発動しない。`};
 cards.push(attribute({id:cards.length,type:'monster',race:races[r],raceId:r,name:prefixes[r]+names[j],cost,power:300+cost*150+tier*180+(ab?0:400),rarity:tier,ability:ab,value,limit,cap,text:ab?texts[ab]:'能力を持たない。高いパワーで戦場を制する。'},el));
}
const spellNames=['紅蓮の裁き','戦意の祝福','知恵の泉','静寂の帰還','マナの芽吹き','生命の雫','守護の契約','聖域の結界','魂の回収','冥界の門'];
const spellEffects=['destroy','boost','draw','bounce','ramp','heal','grantBlock','grantWard','recover','revive'];
for(let j=0;j<50;j++){let k=j%10,t=Math.floor(j/10),v=300+t*150,cap=2+t;cards.push(attribute({id:cards.length,type:'spell',race:'魔法',raceId:k,name:spellNames[k]+(t?'・'+['','練成','秘術','極意','究極'][t]:''),cost:[2,1,2,2,2,1,1,2,2,3][k]+Math.floor(t/2),rarity:t,effect:spellEffects[k],value:v,limit:800+t*400,cap,text:[`パワー${800+t*400}以下の敵1体を破壊。`,`味方1体のパワーを永続で${v}上げる。`,`カードを${t>=3?3:2}枚引く。`,'敵1体を相手の手札に戻す。','エネルギー総量と現在値を1増やす。',`自分の体力を${v+300}回復。`,'味方1体にブロッカーを永続で付与。','味方1体に能力耐性を永続で付与。相手のカード効果を受けなくなる（戦闘は有効）。','墓地の味方モンスター1体を選んで手札に戻す。',`墓地のコスト${cap}以下の味方モンスター1体を選び、追加コストなしで復活召喚。召喚時能力は発動しない。`][k]},Math.floor(k/2)));}
const itemNames=['紅蓮の剣','焔の紋章','叡智の書','帰還の宝珠','芽吹きの杖','生命の首飾り','守護の盾','聖域の護符','追憶の灯','冥府の冠'];
for(let j=0;j<30;j++){let k=j%10,t=Math.floor(j/10),bonus=100+t*200,ab=k===6?'block':k===7?'ward':'',effect=['equipBoost','equipDestroy','equipDraw','equipBounce','equipRamp','equipHeal','','','equipRecover','equipRevive'][k],cap=1+t;
 let text=[`装備時：装備先のパワーをさらに${200+t*100}上げる。`,`装備時：能力耐性のない敵のうち、パワー${600+t*400}以下で最も低い1体を破壊。`,'装備時：カードを1枚引く。',`装備時：能力耐性のないコスト${cap}以下の敵のうち、最も高コストの1体を手札に戻す。`,'装備時：エネルギー総量と現在値を1増やす。',`装備時：自分の体力を${400+t*200}回復。`,labels.block,labels.ward,'装備時：デッキ上2枚を墓地へ送り、墓地の最高コストの味方モンスター1体を手札へ。',`装備時：デッキ上2枚を墓地へ送り、コスト${cap}以下で最高コストの味方1体を復活召喚。召喚時能力は発動しない。`][k];cards.push(attribute({id:cards.length,type:'item',race:'アイテム',raceId:k,name:itemNames[k]+(t?' ＋'+t:''),cost:1+t,rarity:Math.min(4,t*2),bonus,ability:ab,effect,value:200+t*100,limit:600+t*400,cap,text:`味方1体に装備。パワー＋${bonus}。${text}`},Math.floor(k/2)));}
function shuffle(a){return a.map(x=>({x,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.x)}
function starter(){return [0,0,10,10,20,20,30,30,40,40,50,50,60,60,70,70,80,80,90,90,2,12,22,32,44,54,66,76,88,99,100,102,104,106,108,109,150,152,156,159]}
let uid=1;
class Game{
constructor(deck=starter(),mode='cpu'){this.mode=mode;this.players=[deck,starter()].map(d=>({hp:4000,max:0,energy:0,deck:shuffle(d),hand:[],field:[],grave:[]}));this.turn=0;this.round=0;this.winner=null;this.pending=null;this.log=[];for(let p of this.players)p.hand=p.deck.splice(0,6);this.startTurn()}
message(t){this.log.unshift(t);this.log=this.log.slice(0,60)}
get active(){return this.players[this.turn]}
get enemy(){return this.players[1-this.turn]}
check(){if(this.winner!==null)return true;for(let i=0;i<2;i++)if(this.players[i].hp<=0||!this.players[i].deck.length){this.winner=1-i;this.pending=null;return true}return false}
draw(p,n=1){for(let i=0;i<n&&this.winner===null;i++){if(!p.deck.length)break;p.hand.push(p.deck.shift());if(this.check())break}}
mill(p,n=2){for(let i=0;i<n&&this.winner===null;i++){if(!p.deck.length)break;let id=p.deck.shift();p.grave.push(id);this.message(`${cards[id].name}をデッキから墓地へ`);if(this.check())break}}
startTurn(){if(this.winner!==null)return;this.round++;let p=this.active;p.max++;p.energy=p.max;for(let u of p.field){u.attacks=0;u.sleep=false}this.draw(p);this.message(`${this.turn===0?'あなた':'相手'}のターン / エネルギー ${p.energy}`)}
endTurn(){if(this.winner!==null||this.pending)return false;this.turn=1-this.turn;this.startTurn();return true}
has(u,a){return u.card.ability===a||(u.grants||[]).includes(a)||u.items.some(c=>c.ability===a)}
power(u,p){return u.card.power+u.bonus+u.items.reduce((s,c)=>s+c.bonus,0)}
canAttack(u){return !u.sleep&&u.attacks<1}
canBlock(u){return !u.sleep&&u.attacks===0&&this.has(u,'block')}
unit(c){return {uid:uid++,card:c,bonus:0,items:[],grants:[],attacks:0,sleep:true}}
graveOptions(p,cap=Infinity){return p.grave.map((id,index)=>({card:cards[id],index})).filter(x=>x.card.type==='monster'&&x.card.cost<=cap)}
need(c){if(c.type==='item')return 'ally';if(c.type!=='spell')return null;if(['boost','grantBlock','grantWard'].includes(c.effect))return 'ally';if(['destroy','bounce'].includes(c.effect))return 'enemy';if(['recover','revive'].includes(c.effect))return 'grave';return null}
validTarget(c,t){if(!t)return false;let need=this.need(c);if(need==='grave')return t.side===this.turn&&this.graveOptions(this.active,c.effect==='revive'?c.cap:Infinity).some(x=>x.index===t.graveIndex)&&(c.effect!=='revive'||this.active.field.length<6);let side=need==='ally'?this.turn:1-this.turn;if(t.side!==side)return false;let u=this.players[side].field.find(x=>x.uid===t.uid);if(!u)return false;if(need==='enemy'&&this.has(u,'ward'))return false;if(c.effect==='destroy'&&this.power(u,this.enemy)>c.limit)return false;return true}
targetOptions(c){let need=this.need(c);if(need==='grave')return this.graveOptions(this.active,c.effect==='revive'?c.cap:Infinity).map(x=>({side:this.turn,graveIndex:x.index})).filter(t=>this.validTarget(c,t));if(!need)return [];let side=need==='ally'?this.turn:1-this.turn;return this.players[side].field.map(u=>({side,uid:u.uid})).filter(t=>this.validTarget(c,t))}
play(index,target){if(this.winner!==null||this.pending)return false;let p=this.active,e=this.enemy,c=cards[p.hand[index]];if(!c||c.cost>p.energy)return false;if(c.type==='monster'&&p.field.length>=6)return false;let need=this.need(c);if(need){let options=this.targetOptions(c);if(!options.length)return false;if(!target)return {target:need};if(!this.validTarget(c,target))return false}
p.energy-=c.cost;p.hand.splice(index,1);this.message(`${elements[c.elementId].name}属性：${c.name}を使用`);
if(c.type==='monster'){let u=this.unit(c);p.field.push(u);this.trigger(c.ability,c,p,e,u)}
else if(c.type==='item'){let u=p.field.find(x=>x.uid===target.uid);u.items.push(c);this.trigger(c.effect,c,p,e,u)}
else{p.grave.push(c.id);let u=target&&this.players[target.side].field.find(x=>x.uid===target.uid);switch(c.effect){case 'destroy':this.kill(u,e,'effect');break;case 'boost':u.bonus+=c.value;break;case 'draw':this.draw(p,c.rarity>=3?3:2);break;case 'bounce':this.bounce(u,e);break;case 'ramp':p.max++;p.energy++;break;case 'heal':p.hp+=c.value+300;break;case 'grantBlock':if(!u.grants.includes('block'))u.grants.push('block');break;case 'grantWard':if(!u.grants.includes('ward'))u.grants.push('ward');break;case 'recover':this.recover(p,target.graveIndex);break;case 'revive':this.revive(p,target.graveIndex);break;}}
this.check();return true}
trigger(effect,c,p,e,u){if(this.winner!==null)return;switch(effect){case 'summonBoost':case 'equipBoost':u.bonus+=c.value;break;case 'summonDestroy':case 'equipDestroy':{let victims=e.field.filter(x=>!this.has(x,'ward')&&this.power(x,e)<=c.limit).sort((a,b)=>this.power(a,e)-this.power(b,e));if(victims[0])this.kill(victims[0],e,'effect');break}case 'summonDraw':case 'equipDraw':this.draw(p);break;case 'summonBounce':case 'equipBounce':{let victims=e.field.filter(x=>!this.has(x,'ward')&&x.card.cost<=c.cap).sort((a,b)=>b.card.cost-a.card.cost);if(victims[0])this.bounce(victims[0],e);break}case 'summonRamp':case 'equipRamp':p.max++;p.energy++;break;case 'summonHeal':case 'equipHeal':p.hp+=400+c.rarity*(c.type==='monster'?200:100);break;case 'summonRecover':case 'equipRecover':case 'summonRevive':case 'equipRevive':{this.mill(p);if(this.winner!==null)break;let revive=effect.endsWith('Revive'),choices=this.graveOptions(p,revive?c.cap:Infinity).sort((a,b)=>b.card.cost-a.card.cost);if(choices.length){if(revive)this.revive(p,choices[0].index);else this.recover(p,choices[0].index)}break;}}}
recover(p,index){let id=p.grave[index];if(cards[id]?.type!=='monster')return false;p.grave.splice(index,1);p.hand.push(id);this.message(`${cards[id].name}を墓地から手札へ回収`);return true}
revive(p,index){let id=p.grave[index];if(p.field.length>=6||cards[id]?.type!=='monster')return false;p.grave.splice(index,1);p.field.push(this.unit(cards[id]));this.message(`${cards[id].name}を墓地から復活召喚（召喚時能力なし）`);return true}
kill(u,p,reason='battle'){if(!u||!p.field.includes(u))return false;if(reason==='effect'&&this.has(u,'ward'))return false;p.field=p.field.filter(v=>v.uid!==u.uid);p.grave.push(u.card.id,...u.items.map(c=>c.id));this.message(`${u.card.name}が${reason==='battle'?'戦闘で':'効果で'}破壊され墓地へ`);return true}
bounce(u,p){if(!u||this.has(u,'ward'))return false;p.field=p.field.filter(x=>x!==u);p.hand.push(u.card.id);p.grave.push(...u.items.map(c=>c.id));this.message(`${u.card.name}が手札に戻った（装備は墓地へ）`);return true}
damage(u,p,n){if(!u||this.has(u,'ward'))return;if(n>=this.power(u,p))this.kill(u,p,'effect');else u.bonus-=n}
attack(id,target){if(this.pending||this.winner!==null)return false;let u=this.active.field.find(x=>x.uid===id);if(!u||!this.canAttack(u))return false;if(target!==null&&!this.enemy.field.some(x=>x.uid===target))return false;u.attacks++;let blockers=this.enemy.field.filter(x=>this.canBlock(x)&&x.uid!==target);if(blockers.length){this.pending={attacker:id,target,defender:1-this.turn};this.message('ブロッカーの選択待ち');return 'block'}this.resolve(u,target);return true}
block(id){let a=this.pending;if(!a)return false;let u=this.active.field.find(x=>x.uid===a.attacker),target=a.target;if(id!==null){let b=this.enemy.field.find(x=>x.uid===id);if(!b||!this.canBlock(b))return false;b.attacks=1;target=id}this.pending=null;this.resolve(u,target);return true}
resolve(u,id){if(!u)return;let p=this.active,e=this.enemy,a=this.power(u,p),v=e.field.find(x=>x.uid===id);if(id===null){e.hp-=a;this.message(`${u.card.name}の直接攻撃！ ${a}ダメージ`)}else if(v){let b=this.power(v,e);this.message(`${u.card.name} (${a}) → ${v.card.name} (${b})`);if(a>=b)this.kill(v,e);if(a<=b)this.kill(u,p)}this.check()}
}
root.Arcana={cards,races,rarities,elements,Game,starter};if(typeof module!=='undefined')module.exports=root.Arcana;
})(typeof window!=='undefined'?window:globalThis);
