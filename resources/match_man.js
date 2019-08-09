var BACKGROUND_COLOR = "rgba(244,244,244,1)";   // 背景色
var POINT_NUM = 99;                             // 屏幕上点的数目
var FOREGROUND_COLOR = "rgba(16,16,16,1)";      // 点的颜色
var LINE_LENGTH = 6400;                         // 点之间连线长度(的平方)
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

//随机数函数
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
    this.x = _x < 0 ? randomFloat(0, cvs.width) : _x;
    this.y = _y < 0 ? randomFloat(0, cvs.height) : _y;
    this.vx = 0.0;     // speed x
    this.vy = 0.0;     // speed y
    this.ax = 0.0;     // acceleration x
    this.ay = 0.0;     // acceleration y

    this.color = "rgba(16,16,16,1)";
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
Point.prototype.move = function (lag) {
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
    else if (this.y > window.innerHeight) {
        this.y = window.innerHeight;
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
    //document.getElementById("debug").innerHTML = Math.floor(_dx) + "\t" + Math.floor(_dy) + "\t" + Math.floor(dis);
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


function Person() {
    this.neckLength = 6;
    this.armLength = 16;
    this.bodyLength = 22;
    this.legLength = 18;
    this.ph = new Point(-1,-1);   // head
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
            //this.pc.vx = this.walkx * walkSpeed * 0.6;
            this.pn.vx = this.walkx * walkSpeed * 0.6;
            if (this.foot) {
                this.prk.vx = this.walkx * walkSpeed;
                this.prf.vx = this.walkx * walkSpeed;

                this.plk.vx = this.walkx * walkSpeed * 0.2;
                this.plf.x = oldlfx;
                if ((this.prf.x - this.plf.x) * this.walkx > step) this.foot = false;
            }
            else {
                this.plk.vx = this.walkx * walkSpeed;
                this.plf.vx = this.walkx * walkSpeed;

                this.prk.vx = this.walkx * walkSpeed * 0.2;
                this.prf.x = oldrfx;
                if ((this.plf.x - this.prf.x) * this.walkx > step) this.foot = true;
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
Person.prototype.aim = function (x, y) {
    this.prh.vx = (x - player.prh.x);
    this.prh.vy = (y - player.prh.y);
}

player = new Person();
document.onmousemove = function (event) {
    player.aim(event.clientX, event.clientY);
}
document.onmousedown = function (event) {
    player.aim(event.clientX, event.clientY);
    //player.walkx = 1;
}
document.onmouseup = function (event) {
    //player.walkx = 0;
    //player.pn.vy = -700;
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

var startTime = new Date().getTime();
function drawFrame() {
    var endTime = new Date().getTime();
    var lag = (endTime - startTime) / 1000;
    startTime = endTime;
    if (lag < 0.02) {
        drawBackground();
        player.move(lag);
        player.draw();        
    }
    window.requestAnimationFrame(drawFrame);
}
drawFrame();