//==========================================
// File:    background.js
// Title:   星空连线(鼠标跟随)
// Auther:  XieNaoban
// Version: v1.1
// Note:    直接扔在<body>里
//==========================================

// 可调参数
var BACKGROUND_COLOR = "rgba(0,43,54,1)";   // 背景色
var POINT_NUM = 100;                         // 屏幕上点的数目
var FOREGROUND_COLOR = "rgba(244,246,248,"; // 点的颜色
var LINE_LENGTH = 6000;                     // 点之间连线长度(的平方)
var MAX_AXIS_SPEED = 0.9;                  // 在 x, y 轴方向的最大速度
var GRAVITY = 0.6;

var BACKGROUND_COLOR = "rgba(244,244,244,1)";
var FOREGROUND_COLOR = "rgba(16,16,16,";

// 创建背景画布
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

//随机数函数
function randomInt(min, max) {
    return Math.floor((max - min + 1) * Math.random() + min);
}

function randomFloat(min, max) {
    return (max - min) * Math.random() + min;
}

//构造点类
function Point() {
    this.x = randomFloat(0, cvs.width);
    this.y = randomFloat(0, cvs.height);
    this.alone = true;

    var speed = randomFloat(0.3, 1.3);
    speed = 0.6;
    var angle = randomFloat(0, 2 * Math.PI);

    this.dx = Math.sin(angle) * speed;
    this.dy = Math.cos(angle) * speed;

    this.r = 1.6;

    this.color = FOREGROUND_COLOR + "0.2)";
}

Point.prototype.move = function () {
    if (this.alone) {
        var rectifySpeed = 0.05;
        if (this.dx > MAX_AXIS_SPEED) this.dx -= rectifySpeed;
        else if (this.dx < -MAX_AXIS_SPEED) this.dx += rectifySpeed;
        if (this.dy > MAX_AXIS_SPEED) this.dy -= rectifySpeed;
        else if (this.dy < -MAX_AXIS_SPEED) this.dy += rectifySpeed;
    }
    this.x += this.dx;
    if (this.x < 0) {
        this.x = 0;
        this.dx = -this.dx;
    } else if (this.x > cvs.width) {
        this.x = cvs.width;
        this.dx = -this.dx;
    }
    this.y += this.dy;
    if (this.y < 0) {
        this.y = 0;
        this.dy = -this.dy;
    } else if (this.y > cvs.height) {
        this.y = cvs.height;
        this.dy = -this.dy;
    }
}

Point.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

var points = [];

function initPoints(num) {
    for (var i = 0; i < num; ++i) {
        points.push(new Point());
    }
}

var p0 = new Point(); //鼠标
p0.dx = p0.dy = 0;
var degree = 1;
var isMouseUp = true;
document.onmousemove = function (ev) {
    p0.x = ev.clientX;
    p0.y = ev.clientY;
}
document.onmousedown = function (ev) {
    degree = -3;
    isMouseUp = false;
    p0.x = ev.clientX;
    p0.y = ev.clientY;
}
document.onmouseup = function (ev) {
    //degree = 1;
    isMouseUp = true;
    p0.x = ev.clientX;
    p0.y = ev.clientY;
}
window.onmouseout = function () {
    p0.x = null;
    p0.y = null;
}

function drawLine(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    var dis2 = dx * dx + dy * dy;
    if (dis2 < LINE_LENGTH) {
        p1.alone = p2.alone = false;
        var t = (1.05 - dis2 / LINE_LENGTH) * 0.16;
        ctx.strokeStyle = FOREGROUND_COLOR + t + ")";
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.stroke();
    }
    return;
}

function calGravity(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    var dis2 = dx * dx + dy * dy + 64;
    if (dis2 < LINE_LENGTH) {
        dx = dx / dis2 * degree * GRAVITY;
        dy = dy / dis2 * degree * GRAVITY;
        p1.dx -= dx;
        p1.dy -= dy;
        p2.dx += dx;
        p2.dy += dy;
    }
    return;
}

function drawBackFround() {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, cvs.width, cvs.height);
}

//绘制每一帧
function drawFrame() {
    drawBackFround();
    var arr = (p0.x == null ? points : [p0].concat(points));
    //var arr = points;
    for (var i = 0; i < arr.length; ++i) {
        arr[i].draw();
        for (var j = i + 1; j < arr.length; ++j) {
            drawLine(arr[i], arr[j]);
            calGravity(arr[i], arr[j]);
        }
        //arr[i].dy += 0.05;
    }
    for (var i = 1; i < arr.length; ++i) {
        arr[i].move();
        arr[i].alone = true;
    }
    if(isMouseUp && degree < 1) degree += 0.05;
    window.requestAnimationFrame(drawFrame);
}

drawBackFround();
initPoints(POINT_NUM);
drawFrame();