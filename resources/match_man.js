//////////////////////////////////////////////////////////////////////////////////////////////
// 作者:        蟹恼板                                                                      //
// 日期:        2019-08-09                                                                  //
// GayHub:      https://github.com/xienaoban                                                //
// Demo 链接:   https://xienaoban.github.io/resources/DEMO_%E7%81%AB%E6%9F%B4%E4%BA%BA.html //
//////////////////////////////////////////////////////////////////////////////////////////////

// var BACKGROUND_COLOR = "rgba(244,244,244,1)";   // 背景色
// var FOREGROUND_COLOR = "rgba(16,16,16,1)";      // 点的颜色
var BACKGROUND_COLOR = "rgb(23, 23, 23)";       // 背景色
var FOREGROUND_COLOR = "rgb(233, 233, 233)";    // 点的颜色
var GRAVITY = 5000;

// init
var cvs = document.createElement("canvas");
cvs.width = window.innerWidth;
cvs.height = window.innerHeight;
cvs.style.cssText = "\
    position:fixed;\
    top:0px;\
    left:0px;\
    z-index:-1;\
    opacity:1.0;\
    ";
document.body.appendChild(cvs);
var ctx = cvs.getContext("2d");

function drawBackground() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, cvs.width, cvs.height);
}

function debugInfo(str) {
    document.getElementById("debug").innerHTML = str;
}

function randomInt(min, max) {
    return Math.floor((max - min + 1) * Math.random() + min);
}
function randomFloat(min, max) {
    return (max - min) * Math.random() + min;
}
function numberSign(num) {
    return num < 0 ? -1 : 1;
}

function Point(_x, _y) {
    this.x = _x != _x ? randomFloat(0, cvs.width) : _x;
    this.y = _y != _y ? randomFloat(0, cvs.height) : _y;
    this.vx = 0.0;     // speed x
    this.vy = 0.0;     // speed y
    this.ax = 0.0;     // acceleration x
    this.ay = 0.0;     // acceleration y

    this.color = FOREGROUND_COLOR;
    this.r = 1.2;
}
Point.prototype.setXY = function (_x, _y) {
    this.x = _x;
    this.y = _y;
}
Point.prototype.setV = function (_vx, _vy) {
    this.vx = _vx;
    this.vy = _vy;
}
Point.prototype.setA = function (_ax, _ay) {
    this.ax = _ax;
    this.ay = _ay;
}
Point.prototype.move = function (lag, sink = 0) {
    this.vx += this.ax * lag;
    this.vy += this.ay * lag;
    this.x += this.vx * lag;
    this.y += this.vy * lag;
    var vback = -1;
    if (this.x < 0) {
        this.x = 0;
        this.vx *= vback;
    }
    else if (this.x > window.innerWidth) {
        this.x = window.innerWidth;
        this.vx *= vback;
    }
    if (this.y < 0) {
        this.y = 0;
        this.vy *= vback;
    }
    else if (this.y > window.innerHeight + sink) {
        this.y = window.innerHeight + sink;
        this.vy *= vback;
    }
}
Point.prototype.drawPoint = function () {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}
Point.prototype.drawLineTo = function (point) {
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.stroke();
}
Point.prototype.distance2To = function (point) {
    dx = this.x - point.x;
    dy = this.y - point.y;
    return dx*dx + dy*dy;
}
Point.prototype.distanceTo = function (point) {
    return Math.sqrt(this.distance2To(point))
}
Point.prototype.correctDistanceWith = function (point, realDistance) {
    dis = this.distanceTo(point);
    cos = (this.x - point.x) / dis;
    sin = (this.y - point.y) / dis;
    midx = (this.x + point.x) * 0.5;
    midy = (this.y + point.y) * 0.5;
    dx = cos * realDistance * 0.5;
    dy = sin * realDistance * 0.5;
    this.x = midx + dx;
    this.y = midy + dy;
    point.x = midx - dx;
    point.y = midy - dy;
    this.vx = point.vx = (this.vx + point.vx) * 0.5;
    this.vy = point.vy = (this.vy + point.vy) * 0.5;
}
Point.prototype.correctDistanceTo = function (point, realDistance) {
    dis = this.distanceTo(point);
    cos = (this.x - point.x) / dis;
    sin = (this.y - point.y) / dis;
    this.x = point.x + cos * realDistance;
    this.y = point.y + sin * realDistance;
}
Point.prototype.isOutOfWindow = function () {
    return this.x < 0 || this.y < 0 || this.x > window.innerWidth || this.y > window.innerHeight;
}


function Gun(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.dx = 1;
    this.dy = 0;
    this.p0 = new Point(this.x, this.y + 2);
    this.p1 = new Point(this.x, this.y - 2);
    this.p2 = new Point(this.x + 8, this.y - 2);
}
Gun.prototype.set = function (_x, _y, _dx, _dy) {
    this.x = _x;
    this.y = _y;

    var dis = Math.sqrt(_dx*_dx + _dy*_dy);
    var gunLength = 4;
    this.dx = _dx * gunLength / dis;
    this.dy = _dy * gunLength / dis;

    if (_dx > 0) {
        this.p0.setXY(this.x - this.dy, this.y + this.dx);
        this.p1.setXY(this.x + this.dy, this.y - this.dx);
        this.p2.setXY(this.x + this.dx * 4 + this.dy, this.y + this.dy * 4 - this.dx);
    }
    else {
        this.p0.setXY(this.x + this.dy, this.y - this.dx);
        this.p1.setXY(this.x - this.dy, this.y + this.dx);
        this.p2.setXY(this.x + this.dx * 4 - this.dy, this.y + this.dy * 4 + this.dx);
    }
}
Gun.prototype.draw = function () {
    this.p0.drawLineTo(this.p1);
    this.p1.drawLineTo(this.p2);
}

function Bullet(_x, _y, _dx, _dy) {
    this.penetrationLeft = randomInt(8, 24);

    this.x = _x;
    this.y = _y;
    var dis = Math.sqrt(_dx*_dx + _dy*_dy);
    this.dx = _dx/dis*600;
    this.dy = _dy/dis*600;

    this.head = new Point(this.x, this.y);
    this.tail = new Point(this.x - this.dx/100, this.y - this.dy/100);
}
Bullet.prototype.move = function (lag) {
    this.x += this.dx * lag;
    this.y += this.dy * lag;
    this.head.setXY(this.x, this.y);
    this.tail.setXY(this.x - this.dx/100, this.y - this.dy/100);
} 
Bullet.prototype.draw = function () {
    this.head.drawLineTo(this.tail);
} 


function Person(hx = NaN, hy = NaN) {
    this.health = 100;
    this.sink = 0;

    this.neckLength = 6;
    this.armLength = 16;
    this.bodyLength = 22;
    this.legLength = 18;
    this.ph = new Point(hx, hy);   // head
    this.ph.r = this.neckLength;
    this.ph.ay = -GRAVITY * 0.2;
    this.pn = new Point (this.ph.x, this.ph.y + this.neckLength);   // neck
    this.ple = new Point(this.pn.x - Math.cos(Math.PI/6) * this.armLength, this.pn.y + Math.sin(Math.PI/6) * this.armLength);  // left elbow
    this.pre = new Point(this.pn.x + Math.cos(Math.PI/6) * this.armLength, this.pn.y + Math.sin(Math.PI/6) * this.armLength);  // right elbow
    this.plh = new Point(this.ple.x - Math.cos(Math.PI/3) * this.armLength, this.ple.y + Math.sin(Math.PI/3) * this.armLength);  // left hand
    this.plh.ay = GRAVITY * 0.05;
    this.prh = new Point(this.pre.x + Math.cos(Math.PI/3) * this.armLength, this.pre.y + Math.sin(Math.PI/3) * this.armLength);  // right hand
    this.prh.ay = GRAVITY * 0.05;
    this.pc = new Point (this.pn.x, this.pn.y + this.bodyLength);   // cock
    this.plk = new Point(this.pc.x - Math.cos(Math.PI/3) * this.legLength, this.pc.y + Math.sin(Math.PI/3) * this.legLength);  // left knee
    this.prk = new Point(this.pc.x + Math.cos(Math.PI/3) * this.legLength, this.pc.y + Math.sin(Math.PI/3) * this.legLength);  // right knee
    this.plf = new Point(this.plk.x, this.plk.y + this.legLength);  // left foot
    this.plf.ay = GRAVITY * 1;
    this.prf = new Point(this.prk.x, this.prk.y + this.legLength);  // right foot
    this.prf.ay = GRAVITY * 1;
    this.pArray = [this.ph, this.pn, this.pc, this.ple, this.pre, this.plk, this.prk, this.plh, this.prh, this.plf, this.prf];
    // Author: XieNaoban | Github: https://github.com/xienaoban
    this.gun = new Gun(this.prh.x, this.prh.y);

    this.walkx = 0;
    this.walky = 0;
    this.foot = true;
}
Person.prototype.draw = function () {
    this.ph.drawPoint();
    this.ph.drawLineTo(this.pn);
    this.pn.drawLineTo(this.ple);
    this.pn.drawLineTo(this.pre);
    this.pn.drawLineTo(this.pc);
    this.ple.drawLineTo(this.plh);
    this.pre.drawLineTo(this.prh);
    this.pc.drawLineTo(this.plk);
    this.pc.drawLineTo(this.prk);
    this.plk.drawLineTo(this.plf);
    this.prk.drawLineTo(this.prf);
    this.gun.draw();
}
Person.prototype.isBugged = function () {
    return this.ph.x != this.ph.x && this.ph.y != this.ph.y;
}
Person.prototype.isDead = function () {
    return this.health <= 0;
}
Person.prototype.isFirstDeath = function () {
    let res = this._firstDeath == undefined;
    this._firstDeath = false;
    return res;
}
Person.prototype.isDisappeared = function () {
    return this.health <= 0 && this.ph.y > window.innerHeight + 20;
}
Person.prototype.move = function (lag) {
    oldlfx = this.plf.x;
    oldrfx = this.prf.x;
    for (var i = 0; i < this.pArray.length; ++i) this.pArray[i].move(lag);
    
    this.ple.correctDistanceTo(this.pn, this.armLength);
    this.pre.correctDistanceTo(this.pn, this.armLength);
    this.plh.correctDistanceWith(this.ple, this.armLength);
    this.prh.correctDistanceWith(this.pre, this.armLength);

    this.plk.correctDistanceWith(this.pc, this.legLength);
    this.prk.correctDistanceWith(this.pc, this.legLength);
    this.plf.correctDistanceWith(this.plk, this.legLength);
    this.prf.correctDistanceWith(this.prk, this.legLength);

    this.pn.correctDistanceWith(this.pc, this.bodyLength);
    this.ph.correctDistanceWith(this.pn, this.neckLength);

    var minDis = 8;
    if (this.plh.distanceTo(this.prh) < minDis) {
        this.plh.correctDistanceWith(this.prh, minDis);
    }
    if (this.walkx == 0 && this.plf.distanceTo(this.prf) < minDis) {
        this.plf.correctDistanceWith(this.prf, minDis);
    }
    this.ple.vx = this.pre.vx = 0;
    this.plh.vx = this.prh.vx = 0;
    if (this.walkx != 0) {
        if (this.ph.y < window.innerHeight - 38) {
            var walkSpeed = 400;
            var step = 30;
            // Author: XieNaoban | this.pc.vx = this.walkx * walkSpeed * 0.6;
            this.pn.vx = this.walkx * walkSpeed * 0.6;
            if (this.foot) {
                this.prk.vx = this.walkx * walkSpeed;
                this.prf.vx = this.walkx * walkSpeed;

                this.plk.vx = this.walkx * walkSpeed * 0.2;
                this.plf.x = oldlfx;
                if (Math.abs(this.prf.x - this.plf.x) > step) this.foot = false;
            }
            else {
                this.plk.vx = this.walkx * walkSpeed;
                this.plf.vx = this.walkx * walkSpeed;

                this.prk.vx = this.walkx * walkSpeed * 0.2;
                this.prf.x = oldrfx;
                if (Math.abs(this.plf.x - this.prf.x) > step) this.foot = true;
            }
        }
        else {
            this.pn.vx *= 0.9;
            this.pn.vy = 60;
            this.pc.vy = -60;
            this.plf.vy = -200;
            this.plk.vy = 160;
            this.prk.vy = 20;
            this.ple.vx = this.pre.vx = this.walkx * 100;
            this.plh.vx = this.prh.vx = this.walkx * 400;
        }
        
    }
    else {
        this.pn.vx = 0;
    }
    if (this.walky < 0) {
        this.pn.vy = 300;
    }
    else if (this.walky > 0 && (this.plf.y > window.innerHeight - 10 || this.prf.y > window.innerHeight - 10)) {
        if (this.ph.y < window.innerHeight - this.legLength - this.bodyLength) this.pc.vy = -1000;
        this.ph.vy = -500;
    }

    this.gun.set(this.prh.x, this.prh.y, this.prh.x - this.pre.x, this.prh.y - this.pre.y);
}
Person.prototype.aim = function (x, y, degree) {
    if (x == undefined || y == undefined) return;
    var dx = x - this.prh.x;
    var dy = y - this.prh.y;
    var dis = Math.sqrt(dx * dx + dy * dy);
    this.prh.vx = dx / dis * 100 * degree;
    this.prh.vy = dy / dis * 100 * degree;
}
Person.prototype.shoot = function (list) {
    list.push(new Bullet(this.gun.p2.x, this.gun.p2.y, this.prh.x - this.pre.x, this.prh.y - this.pre.y));
    this.aim(mouseX, mouseY - recoil * randomFloat(-20, 20), 4 + recoil);
}
Person.prototype.ragDoll = function (lag) {
    for (let p of this.pArray) p.move(lag, this.sink);
    if (this.sink < 50) this.sink += lag * 0.08 * Math.pow((1 + this.sink), 4);

    if (this.ph.ay < 0) {
        this.walkx = this.walky = 0;
        for (let p of this.pArray) p.ay = randomFloat(0.10, 0.30) * GRAVITY;
        this.plh.ay = this.prh.ay = 0.05 * GRAVITY;
        this.ple.ay = this.pre.ay = 0.02 * GRAVITY;
    }

    if (this.ph.y >= window.innerHeight - 38) {
        for (let p of this.pArray) p.vx *= 0.95;
    }

    this.ple.correctDistanceTo(this.pn, this.armLength);
    this.pre.correctDistanceTo(this.pn, this.armLength);
    this.plh.correctDistanceWith(this.ple, this.armLength);
    this.prh.correctDistanceWith(this.pre, this.armLength);

    this.plk.correctDistanceWith(this.pc, this.legLength);
    this.prk.correctDistanceWith(this.pc, this.legLength);
    this.plf.correctDistanceWith(this.plk, this.legLength);
    this.prf.correctDistanceWith(this.prk, this.legLength);

    this.pn.correctDistanceWith(this.pc, this.bodyLength);
    this.ph.correctDistanceWith(this.pn, this.neckLength);

    this.ple.vx = this.pre.vx = 0;
    this.plh.vx = this.prh.vx = 0;

    this.gun.set(this.prh.x, this.prh.y, this.prh.x - this.pre.x, this.prh.y - this.pre.y);
}

//////////////////////////////
// 游戏相关全局变量与执行函数 //
//////////////////////////////

var player = new Person(window.innerWidth / 2, window.innerHeight / 2);
var npcs = [];
npcs.push(new Person()); npcs.push(new Person()); npcs.push(new Person());
var bullets = [];
var killed = 0;
var isMouseDown = false;
var mouseX, mouseY;
var shootCnt = 0;
var shootMaxCnt = 15;
var shootFrequency = 0.01;
var recoil = 20;

document.onmousemove = function (event) {
    mouseX = event.clientX, mouseY = event.clientY;
}
document.onmousedown = function (event) {
    isMouseDown = true;
    shootCnt = shootMaxCnt;
}
document.onmouseup = function (event) {
    isMouseDown = false;
}
document.onkeydown = function (event) {
    switch (event.keyCode) {
        case 37: case 65: player.walkx = -1; break;
        case 39: case 68: player.walkx = 1; break;
        case 38: case 87: player.walky = 1; break;
        case 40: case 83: player.walky = -1; break;
    }
}
document.onkeyup = function (event) {
    switch (event.keyCode) {
        case 37: case 65: if (player.walkx == -1) player.walkx = 0; break;
        case 39: case 68: if (player.walkx == 1)player.walkx = 0; break;
        case 38: case 87: case 40: case 83: player.walky = 0; break;
    }
}
function beforeEachFrame() {}
function afterEachFrame() {
    player.health = 9999999;
}

var startTime = new Date().getTime();
var endTime = new Date().getTime();
var lag = (endTime - startTime) / 1000;
function drawFrame() {
    endTime = new Date().getTime();
    lag = (endTime - startTime) / 1000;
    startTime = endTime;
    if (lag < 0.02) {   // 搞那么长一个 if, 主要还是怕尾递归优化失败
        beforeEachFrame();
        drawBackground();

        var tmpList = [];
        const baseDamage = 0.1 + lag * 10;
        for(var i = 0; i < bullets.length; ++i) {
            bullets[i].move(lag);
            bullets[i].draw();
            if (bullets[i].tail.isOutOfWindow()) continue;
            npcs.push(player);
            for (var j = 0; j < npcs.length; ++j) {
                let range = 30, dmgL = 64, dmgR = 84;
                for (var k = 0; k < npcs[j].pArray.length; ++k) {
                    if (k == 8) continue;
                    if (npcs[j].pArray[k].distance2To(bullets[i].tail) < range) {
                        --bullets[i].penetrationLeft;
                        npcs[j].pArray[k].vx = bullets[i].dx;
                        npcs[j].pArray[k].vy = bullets[i].dy;
                        npcs[j].health -= randomFloat(dmgL, dmgR) * baseDamage;
                        if (bullets[i].penetrationLeft <= 0) break;
                    }
                    range = 128;
                    dmgL = 4, dmgR = 10;
                    if (bullets[i].penetrationLeft <= 0) break;
                }
            }
            npcs.pop();
            if (bullets[i].penetrationLeft > 0) tmpList.push(bullets[i]);
        }
        bullets = tmpList;

        if (player.isBugged()) {
            let old = player;
            player = new Person(window.innerWidth - 5, window.innerHeight - 70);
            player.health = old.health;
            player._firstDeath = old._firstDeath;
        }

        for (var j = 0; j < npcs.length; ++j) {
            if (npcs[j].isDisappeared() || npcs[j].isBugged()) {
                switch (randomInt(0, 2)) {
                    case 0:
                        npcs[j] = new Person(randomInt(0, window.innerWidth), window.innerHeight);
                        break;
                    case 1:
                        npcs[j] = new Person(randomInt(0, window.innerWidth), -5);
                        break;
                    default:
                        let lr = randomInt(0, 1) == 0 ? -12 : window.innerWidth + 12;
                        npcs[j] = new Person(lr, window.innerHeight - randomInt(-16, 200));
                        break;
                }
            }
            if (npcs[j].isDead()) {
                npcs[j].ragDoll(lag);
                npcs[j].draw();
                if (npcs[j].isFirstDeath() && !player.isDead()) ++killed;
                continue;
            }
            if (npcs[j].ph.y < window.innerHeight - 38) {
                let dis = Math.abs(player.pc.x - npcs[j].pc.x);
                let sign = numberSign(player.pc.x - npcs[j].pc.x);
                if (dis > 256) npcs[j].walkx = sign * 0.1;
                else if (dis > 196) npcs[j].walkx = 0;
                else npcs[j].walkx = -sign / (dis + 32) * 64;
            }
            else npcs[j].walkx = 0;
            // Author: XieNaoban | npcs[j].walky = 1;
            npcs[j].move(lag);
            npcs[j].aim(player.ph.x, player.ph.y, 1);
            if (Math.random() < shootFrequency) npcs[j].shoot(bullets);
            npcs[j].draw();
        }

        if (player.isDead()) {
            player.ragDoll(lag);
            player.sink = -1;
            player.draw();
        }
        else {
            player.aim(mouseX, mouseY, 4);
            if (isMouseDown && shootCnt++ >= shootMaxCnt) {
                shootCnt = 0;
                player.shoot(bullets);
            }
            player.move(lag);
            player.draw();
        }

        // DEBUG
        // if (true) {
        //     ht = 'PLAYER:<br/>' + parseInt(player.health) + ' ' 
        //     for (let p of player.pArray) ht += '(' + parseInt(p.x) + ', ' + parseInt(p.y) + ') '
        //     ht += '<br/>NPC:<br/>'
        //     for (let npc of npcs) {
        //         ht += parseInt(npc.health) + ' '
        //         for (let p of npc.pArray) ht += '(' + parseInt(p.x) + ', ' + parseInt(p.y) + ') '
        //         ht += '<br/>'
        //     }
        //     document.getElementById('debug').innerHTML = ht;
        // }
        afterEachFrame();
    }
    window.requestAnimationFrame(drawFrame);
}
drawFrame();