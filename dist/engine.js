(function(root){
const races=['ドラゴン','獣人','精霊','機械','アンデッド','天使','悪魔','海獣','妖精','魔導士'];
const rarities=['ノーマル','レア','スーパーレア','ハイパーレア','ウルトラレア'];
const prefixes=['暁の','森の','蒼穹の','鋼鉄の','黄昏の','聖域の','深淵の','潮騒の','月光の','星読みの'];
const names=['幼竜','斥候','守護者','戦士','狩人','騎士','賢者','覇者','古王','神皇'];
const abilities=['','block','haste','drain','draw','burn','regen','pierce','aura','double'];
const labels={block:'ブロッカー：未行動ならタップして攻撃を引き受ける。',haste:'速攻：召喚したターンから攻撃できる。',drain:'吸収：与えたダメージ分、自分の体力を回復。',draw:'召喚時：カードを1枚引く。',burn:'召喚時：相手の体力に300ダメージ。',regen:'再生：自分のターン開始時、体力を200回復。',pierce:'貫通：戦闘で勝つとパワー差を相手の体力に与える。',aura:'号令：他の味方モンスターのパワー＋200。',double:'連撃：1ターンに2回攻撃できる。'};
const cards=[];
for(let r=0;r<10;r++)for(let j=0;j<10;j++){let tier=Math.floor(j/2),ab=j===0?'':abilities[(r+j)%9+1],cost=Math.min(10,1+Math.floor(j*.75));let power=300+cost*150+tier*180+(ab?0:400);cards.push({id:cards.length,type:'monster',race:races[r],raceId:r,name:prefixes[r]+names[j],cost,power,rarity:tier,ability:ab,text:ab?labels[ab]:'能力を持たない。高いパワーで戦場を制する。'});}
const spellNames=['紅蓮の矢','生命の雫','知恵の泉','マナの芽吹き','戦意の祝福','封印の雷','静寂の帰還','崩壊の波','王者の進軍','星の再生'];
for(let j=0;j<50;j++){let k=j%10,t=Math.floor(j/10),v=300+t*150;cards.push({id:cards.length,type:'spell',race:'魔法',raceId:k,name:spellNames[k]+(t?'・'+['','練成','秘術','極意','究極'][t]:''),cost:[2,1,2,2,1,3,2,4,3,2][k]+Math.floor(t/2),rarity:t,effect:k,value:v,text:[`敵1体か相手の体力に${v}ダメージ。`,`自分の体力を${v+300}回復。`,`カードを${t>=3?3:2}枚引く。`,'エネルギー総量と現在値を1増やす。',`味方1体のパワーを永続で${v}上げる。`,`パワー${800+t*300}以下の敵1体を破壊。`,'敵1体を相手の手札に戻す。',`敵全体に${v}ダメージ。`,'味方全員のパワーを200上げ、未行動にする。',`体力を${v}回復し、カードを1枚引く。`][k]});}
const itemNames=['守護の盾','疾風の靴','吸血の牙','貫きの槍','双月の刃','巨人の剣'];
for(let j=0;j<30;j++){let k=j%6,t=Math.floor(j/6),bonus=100+t*150+(k===5?400:0),ab=['block','haste','drain','pierce','double',''][k];cards.push({id:cards.length,type:'item',race:'アイテム',raceId:k,name:itemNames[k]+(t?' ＋'+t:''),cost:1+t,rarity:t,bonus,ability:ab,text:`味方1体に装備。パワー＋${bonus}。`+(ab?labels[ab]:'')});}
function shuffle(a){return a.map(x=>({x,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.x)}
function starter(){return [0,0,10,10,20,20,30,30,40,40,50,50,60,60,70,70,80,80,90,90,2,12,22,32,44,54,66,76,88,99,100,101,102,103,104,105,150,151,152,155]}
let uid=1;
class Game{
constructor(deck=starter(),mode='cpu'){this.mode=mode;this.players=[deck,starter()].map(d=>({hp:4000,max:0,energy:0,deck:shuffle(d),hand:[],field:[],grave:[]}));this.turn=0;this.round=0;this.winner=null;this.pending=null;this.log=[];for(let p of this.players)p.hand=p.deck.splice(0,6);this.startTurn()}
message(t){this.log.unshift(t);this.log=this.log.slice(0,60)}
get active(){return this.players[this.turn]}
get enemy(){return this.players[1-this.turn]}
check(){for(let i=0;i<2;i++)if(this.players[i].hp<=0||!this.players[i].deck.length){this.winner=1-i;this.pending=null;return true}return false}
draw(p,n=1){for(let i=0;i<n;i++){if(!p.deck.length)break;p.hand.push(p.deck.shift());if(this.check())break}}
startTurn(){if(this.winner!==null)return;this.round++;let p=this.active;p.max++;p.energy=p.max;for(let u of p.field){u.attacks=0;u.sleep=false;if(this.has(u,'regen'))p.hp+=200}this.draw(p);this.message(`${this.turn===0?'あなた':'相手'}のターン / エネルギー ${p.energy}`)}
endTurn(){if(this.winner!==null||this.pending)return false;this.turn=1-this.turn;this.startTurn();return true}
has(u,a){return u.card.ability===a||u.items.some(c=>c.ability===a)}
power(u,p){return u.card.power+u.bonus+u.items.reduce((s,c)=>s+c.bonus,0)+p.field.filter(v=>v.uid!==u.uid&&this.has(v,'aura')).length*200}
canAttack(u){return (!u.sleep||this.has(u,'haste'))&&u.attacks<(this.has(u,'double')?2:1)}
canBlock(u){return !u.sleep&&u.attacks===0&&this.has(u,'block')}
play(index,target){if(this.winner!==null||this.pending)return false;let p=this.active,e=this.enemy,c=cards[p.hand[index]];if(!c||c.cost>p.energy)return false;if(c.type==='monster'&&p.field.length>=6)return false;
let need=c.type==='item'?'ally':c.type==='spell'&&[0,4,5,6].includes(c.effect)?(c.effect===4?'ally':c.effect===0?'enemyAny':'enemy'):null;
if(need){if(need==='ally'&&!p.field.length)return false;if(need==='enemy'&&!e.field.length)return false;if(!target)return {target:need};let side=target.side===this.turn?p:e;let u=side.field.find(x=>x.uid===target.uid);if(need==='ally'&&(!u||side!==p)||need==='enemy'&&(!u||side!==e)||need==='enemyAny'&&side!==e)return false;if(c.type==='spell'&&c.effect===5&&this.power(u,e)>800+c.rarity*300)return false;}
p.energy-=c.cost;p.hand.splice(index,1);this.message(`${c.name}を使用`);
if(c.type==='monster'){let u={uid:uid++,card:c,bonus:0,items:[],attacks:0,sleep:true};p.field.push(u);if(c.ability==='draw')this.draw(p);if(c.ability==='burn')e.hp-=300;}
else if(c.type==='item'){p.field.find(x=>x.uid===target.uid).items.push(c)}
else{p.grave.push(c.id);let u=target&&e.field.find(x=>x.uid===target.uid);switch(c.effect){case 0:if(target.uid===null)e.hp-=c.value;else this.damage(u,e,c.value);break;case 1:p.hp+=c.value+300;break;case 2:this.draw(p,c.rarity>=3?3:2);break;case 3:p.max++;p.energy++;break;case 4:p.field.find(x=>x.uid===target.uid).bonus+=c.value;break;case 5:this.kill(u,e);break;case 6:e.field=e.field.filter(x=>x!==u);e.hand.push(u.card.id);u.items.forEach(c=>e.grave.push(c.id));break;case 7:[...e.field].forEach(x=>this.damage(x,e,c.value));break;case 8:p.field.forEach(x=>{x.bonus+=200;x.attacks=0});break;case 9:p.hp+=c.value;this.draw(p);break;}}
this.check();return true}
kill(u,p){if(!u)return;p.field=p.field.filter(v=>v.uid!==u.uid);p.grave.push(u.card.id,...u.items.map(c=>c.id))}
damage(u,p,n){if(!u)return;if(n>=this.power(u,p))this.kill(u,p);else u.bonus-=n}
attack(id,target){if(this.pending||this.winner!==null)return false;let u=this.active.field.find(x=>x.uid===id);if(!u||!this.canAttack(u))return false;if(target!==null&&!this.enemy.field.some(x=>x.uid===target))return false;u.attacks++;let blockers=this.enemy.field.filter(x=>this.canBlock(x)&&x.uid!==target);if(blockers.length){this.pending={attacker:id,target,defender:1-this.turn};this.message('ブロッカーの選択待ち');return 'block'}this.resolve(u,target);return true}
block(id){let a=this.pending;if(!a)return false;let u=this.active.field.find(x=>x.uid===a.attacker),target=a.target;if(id!==null){let b=this.enemy.field.find(x=>x.uid===id);if(!b||!this.canBlock(b))return false;b.attacks=this.has(b,'double')?2:1;target=id}this.pending=null;this.resolve(u,target);return true}
resolve(u,id){if(!u)return;let p=this.active,e=this.enemy,a=this.power(u,p),v=e.field.find(x=>x.uid===id);if(id===null){e.hp-=a;if(this.has(u,'drain'))p.hp+=a;this.message(`${u.card.name}の直接攻撃！ ${a}ダメージ`)}else if(v){let b=this.power(v,e);this.message(`${u.card.name} (${a}) → ${v.card.name} (${b})`);if(a>=b){this.kill(v,e);if(a>b&&this.has(u,'pierce'))e.hp-=a-b;}if(a<=b)this.kill(u,p);if(this.has(u,'drain'))p.hp+=Math.min(a,b);}this.check()}
}
root.Arcana={cards,races,rarities,Game,starter};if(typeof module!=='undefined')module.exports=root.Arcana;
})(typeof window!=='undefined'?window:globalThis);
