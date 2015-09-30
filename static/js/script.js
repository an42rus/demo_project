var CELL_WIDTH = 20;
var CELL_HEIGHT = 20;
var TABLE_SIZE = 25;
var CANVAS_WIDTH = CELL_WIDTH * TABLE_SIZE;
var CANVAS_HEIGHT = CELL_HEIGHT * TABLE_SIZE;

var context;
var canvas;
var socket = null;
// ------ Offset ----
var x0 = 0;
var y0 = 0;

var curr_player = 1;
var other_player = 2;
var steps = {};

//Canvas event
function addEvent(){
    $(canvas).click(fieldClick);
}

function removeEvent() {
    $(canvas).unbind("click");
}

//--------------- Draw ------------------------
function drawBG(ctx){
    $('#coord_y').css("left", -CANVAS_WIDTH/2 - 20);
    $('#coord_x').css("margin-right", CANVAS_WIDTH - 20);
    ctx.beginPath();
    for (i = 0; i <= CANVAS_WIDTH/CELL_WIDTH; i++){
        ctx.moveTo(i*CELL_WIDTH, 0);
        ctx.lineTo(i*CELL_WIDTH, CANVAS_HEIGHT);
    }
    for (j = 0; j <= CANVAS_HEIGHT/CELL_HEIGHT; j++){
        ctx.moveTo(0, j*CELL_HEIGHT);
        ctx.lineTo(CANVAS_WIDTH, j*CELL_HEIGHT);
    }
    context.strokeStyle = '#000000';
    ctx.stroke();
}
//     Draw O
function drawEllipseByCenter(ctx, cx, cy, w, h) {
    drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
}

function drawEllipse(ctx, x, y, w, h) {
    var kappa = .5522848,
          ox = (w / 2) * kappa, // control point offset horizontal
          oy = (h / 2) * kappa, // control point offset vertical
          xe = x + w,           // x-end
          ye = y + h,           // y-end
          xm = x + w / 2,       // x-middle
          ym = y + h / 2;       // y-middle

      ctx.beginPath();
      ctx.moveTo(x, ym);
      ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
      ctx.closePath();
      context.strokeStyle = '#ff0000';
      ctx.stroke();
}

function drawO(ctx, x, y){
    ctx.lineWidth = 2;
    drawEllipse(ctx, x*CELL_WIDTH + CELL_WIDTH*0.2, y*CELL_HEIGHT + 2, CELL_WIDTH*0.6, CELL_HEIGHT-4)
}
// ------------

function drawX(ctx, x, y){
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x * CELL_WIDTH + 3, y * CELL_HEIGHT + 3);
    ctx.lineTo((x + 1) * CELL_WIDTH - 3, (y + 1) * CELL_HEIGHT - 3);
    ctx.moveTo((x + 1) * CELL_WIDTH - 3, y * CELL_HEIGHT + 3);
    ctx.lineTo(x * CELL_WIDTH + 3, (y + 1) * CELL_HEIGHT - 3);
    context.strokeStyle = '#129925';
    ctx.stroke();
}

function drawSymbol(ctx, x, y, my){
    if ((x - x0 < 0) || (x - x0 >= TABLE_SIZE) || (y - y0 < 0) || (y - y0 >= TABLE_SIZE)){
        x0 = (x/TABLE_SIZE | 0)*TABLE_SIZE;
        y0 = (y/TABLE_SIZE | 0)*TABLE_SIZE;
        drawField(ctx);
    }
    if ((my && curr_player == 1) || (!my && curr_player == 2)) {
        drawX(ctx, x - x0, y - y0);
    } else{
        drawO(ctx, x - x0, y - y0);
    }
}

function drawField(ctx){
    canvas.width = canvas.width; //clear canvas
    drawBG(ctx);
    $('#coord_x').html(x0);
    $('#coord_y').html(y0);
    for (x in steps){
        for (y in steps[x]){
            if ((x - x0 >= 0) && (x - x0 < TABLE_SIZE) && (y - y0 >= 0) && (y - y0 < TABLE_SIZE)){
                drawSymbol(ctx, x, y, steps[x][y] == curr_player);
            }
        }
    }
}

//--------------- Logic ------------------------
function getStep(x, y){
    if (x in steps){
        if (y in steps[x]){
            return steps[x][y];
        }
    } else{
        steps[x] = {}
    }
    return 0;
}

function checkWin(x, y){
    var curr_value = getStep(x, y);
    var win = false;
    i = 0;
    while(i<5 && getStep(x + i, y) == curr_value){
        i++;
    }
    win = (i == 5);
    if (!win){
        while(i<5 && getStep(x + i, y + i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x, y + i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x - i, y - i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x - i, y + i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x + i, y - i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x, y - i) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    if (!win){
        while(i<5 && getStep(x - i, y) == curr_value){
            i++;
        }
        win = (i == 5);
    }
    return win;
}

function endGame(){
    removeEvent();
}

function changeField(i, j){
    x0 = x0 + i*TABLE_SIZE;
    y0 = y0 + j*TABLE_SIZE;
    drawField(context);
}

function fieldClick(e){
    var x = ((e.pageX - canvas.offsetLeft) / CELL_WIDTH | 0) + x0;
    var y = ((e.pageY - canvas.offsetTop)  / CELL_HEIGHT | 0) + y0;
    if(getStep(x, y) === 0){
        drawSymbol(context, x, y, true);
        steps[x][y] = curr_player;
        socket.emit("step", {"game_id": $('#game_id').text(), "x": x, "y": y});
        removeEvent();
        $("#status h2").html("Opponent's move");
        $("#status h2").css('color', '#3E96E2');
        if (checkWin(x, y)) {
            $("#status h2").html('You win!');
            $("#status h2").css('color', '#129925');
            $('.gameover').css('display', 'inline-block');
            socket.emit("end_game", {"game_id": $('#game_id').text()});
        }
    }
}

function opponentStep(x, y){
    if(getStep(x, y) === 0){
        drawSymbol(context, x, y, false);
        steps[x][y] = other_player;
        if (checkWin(x, y)) {
            $("#status h2").html('You lost!');
            $("#status h2").css('color', 'red');
            $('.gameover').css('display', 'inline-block');
            socket.emit("end_game", {"game_id": $('#game_id').text()});
            endGame();
        } else{
            addEvent();
            $("#status h2").html("You move");
            $("#status h2").css('color', '#129925');
        }
    }
}
