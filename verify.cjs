const assert=require('node:assert/strict');
const {cards,elements,Game,starter}=require('./dist/engine.js');
const byEffect=e=>cards.find(c=>c.type==='spell'&&c.effect===e&&c.rarity===0);
const monster=(element,ability)=>cards.find(c=>c.type==='monster'&&c.element===element&&(ability?c.ability===ability:!c.ability));
function fresh(){let g=new Game();g.active.energy=99;g.active.max=99;return g}
function cast(g,e,t){let c=byEffect(e);g.active.hand=[c.id];return g.play(0,t)}
function add(g,p,c,ready=true){let u=g.unit(c);u.sleep=!ready;p.field.push(u);return u}
function total(p){return p.deck.length+p.hand.length+p.grave.length+p.field.reduce((n,u)=>n+1+u.items.length,0)}
assert.equal(cards.length,180);assert.equal(elements.length,5);assert.equal(starter().length,40);
for(let e of elements){let all=cards.filter(c=>c.element===e.id);assert.equal(all.length,36);assert.equal(all.filter(c=>c.type==='monster').length,20);assert.equal(all.filter(c=>c.type==='spell').length,10);assert.equal(all.filter(c=>c.type==='item').length,6)}
let g=new Game();assert.equal(g.active.energy,1);assert.equal(g.active.hand.length,7);assert.equal(g.enemy.hand.length,6);assert.equal(g.active.hp,4000);
// Fire: targeted destruction, invalid targets do not consume cards/energy, permanent boost.
g=fresh();let u=add(g,g.enemy,monster('water'));u.bonus=-100;assert.deepEqual(cast(g,'destroy'),{target:'enemy'});let energy=g.active.energy;assert.equal(g.play(0,{side:0,uid:u.uid}),false);assert.equal(g.active.energy,energy);assert.equal(g.play(0,{side:1,uid:u.uid}),true);assert.ok(g.enemy.grave.includes(u.card.id));
u=add(g,g.active,monster('fire'));let p=g.power(u,g.active);assert.equal(cast(g,'boost',{side:0,uid:u.uid}),true);assert.equal(g.power(u,g.active),p+300);
// Water: draw, return to hand, discard equipment, reset grants.
g=fresh();let n=g.active.deck.length;cast(g,'draw');assert.equal(g.active.deck.length,n-2);u=add(g,g.enemy,monster('wood'));u.items=[cards[150]];u.grants=['block'];cast(g,'bounce',{side:1,uid:u.uid});assert.ok(g.enemy.hand.includes(u.card.id));assert.ok(g.enemy.grave.includes(150));assert.equal(g.enemy.field.length,0);
// Wood: energy and healing.
g=fresh();let max=g.active.max;energy=g.active.energy;cast(g,'ramp');assert.equal(g.active.max,max+1);assert.equal(g.active.energy,energy-byEffect('ramp').cost+1);cast(g,'heal');assert.equal(g.active.hp,4600);
// Light: grants persist; hostile effects blocked while allied equipment and battle work.
g=fresh();u=add(g,g.active,monster('fire'));cast(g,'grantBlock',{side:0,uid:u.uid});assert.equal(g.canBlock(u),true);cast(g,'grantWard',{side:0,uid:u.uid});assert.equal(g.has(u,'ward'),true);
g.turn=1;assert.equal(cast(g,'destroy',{side:0,uid:u.uid}),false);assert.equal(cast(g,'bounce',{side:0,uid:u.uid}),false);assert.equal(g.kill(u,g.enemy,'effect'),false);let before=g.power(u,g.enemy);g.damage(u,g.enemy,9999);assert.equal(g.power(u,g.enemy),before);g.turn=0;g.active.hand=[150];assert.equal(g.play(0,{side:0,uid:u.uid}),true);assert.equal(g.kill(u,g.active),true);
// Automatic on-summon abilities also respect ward.
g=fresh();u=add(g,g.enemy,monster('light','ward'));u.bonus=-2000;g.active.hand=[monster('fire','summonDestroy').id];g.play(0);assert.ok(g.enemy.field.includes(u));g.active.hand=[monster('water','summonBounce').id];g.play(0);assert.ok(g.enemy.field.includes(u));
// Dark: destroyed and milled monsters become eligible; spell/item cards cannot be recovered.
g=fresh();u=add(g,g.active,monster('fire'));g.kill(u,g.active);let index=g.active.grave.indexOf(u.card.id);assert.deepEqual(cast(g,'recover'),{target:'grave'});assert.equal(g.play(0,{side:0,graveIndex:index}),true);assert.ok(g.active.hand.includes(u.card.id));g.active.grave=[100];assert.equal(cast(g,'recover'),false);
g=fresh();let revived=monster('wood','summonRamp');g.active.grave=[revived.id];let rampMax=g.active.max;assert.equal(cast(g,'revive',{side:0,graveIndex:0}),true);assert.equal(g.active.max,rampMax);assert.equal(g.active.field[0].card.id,revived.id);assert.equal(g.canAttack(g.active.field[0]),false);assert.equal(g.active.field[0].items.length,0);
g=fresh();let big=cards.find(c=>c.type==='monster'&&c.cost>byEffect('revive').cap);g.active.grave=[big.id];assert.equal(cast(g,'revive'),false);g.active.grave=[0];for(let i=0;i<6;i++)add(g,g.active,cards[0]);assert.equal(cast(g,'revive'),false);assert.deepEqual(g.active.grave,[0]);
g=fresh();g.active.deck=[0,2,...g.active.deck];g.active.hand=[monster('dark','summonRecover').id];g.play(0);assert.ok(g.active.hand.includes(2));assert.ok(g.active.grave.includes(0));
g=fresh();g.active.deck=[0];g.active.hand=[monster('dark','summonRevive').id];g.play(0);assert.equal(g.winner,1);assert.equal(g.active.field.length,1);assert.ok(g.active.grave.includes(0));
// Blockers can intercept once, but ward alone does not prevent battle damage.
g=fresh();let attacker=add(g,g.active,cards[9]);let block=add(g,g.enemy,monster('light','block'));assert.equal(g.attack(attacker.uid,null),'block');let hp=g.enemy.hp;assert.equal(g.block(block.uid),true);assert.equal(g.enemy.hp,hp);assert.equal(block.attacks,1);assert.equal(g.pending,null);
g=fresh();g.enemy.hp=1;attacker=add(g,g.active,cards[0]);g.attack(attacker.uid,null);assert.equal(g.winner,0);
// Autonomous matches exercise all effects while conserving each original 40-card deck.
for(let trial=0;trial<40;trial++){let deck=trial<5?cards.filter(c=>c.element===elements[trial].id).map(c=>c.id):starter();while(deck.length<40)deck.push(deck[deck.length%36]);g=new Game(deck);for(let step=0;step<1500&&g.winner===null;step++){assert.equal(total(g.players[0]),40);assert.equal(total(g.players[1]),40);if(g.pending){let blocker=g.enemy.field.find(x=>g.canBlock(x));g.block(blocker?blocker.uid:null);continue}let played=false;for(let i=0;i<g.active.hand.length;i++){let c=cards[g.active.hand[i]],r=g.play(i);if(r?.target){let choices=g.targetOptions(c);r=choices.length?g.play(i,choices[0]):false}if(r===true){played=true;break}}if(played)continue;let a=g.active.field.find(x=>g.canAttack(x));if(a){g.attack(a.uid,null);continue}g.endTurn()}assert.notEqual(g.winner,null);for(let player of g.players){assert.equal(total(player),40);assert.ok(player.energy>=0);assert.ok(player.field.length<=6)}}
console.log('PASS: 五属性各36種、破壊/強化、ドロー/帰還、エネルギー/回復、防御/耐性、墓地送り/回収/復活、勝敗、カード保存則、40試合。');
