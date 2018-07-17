const X = 'X';
const O = 'O';
const E = ' ';

let player;
let grid = [[E, E, E], [E, E, E], [E, E, E]]; 
let data;
let model;

function preload() {
    data = loadJSON("data.json");
}

function setup() {
    const xarr = [], yarr = [];
    for(const key in data) {
        xarr.push(key.split("").map(x => parseInt(x)));
        yarr.push(data[key]);
    }
    
    const xs = tf.tensor2d(xarr, [4520, 20]);
    const ys = tf.tensor2d(yarr, [4520, 9]);

    model = tf.sequential();
    model.add(tf.layers.dense({units: 64, inputShape: [20], activation: "sigmoid"}));
    model.add(tf.layers.dense({units: 9, activation: "softmax"}));
    const optimizer = tf.train.adam(0.01);
    model.compile({optimizer, loss: tf.losses.softmaxCrossEntropy});

    model.fit(xs, ys, {
        epochs: 100,
        shuffle: true,
        callbacks: {
            onEpochEnd: (num, logs) => {
                console.log(`Epoch: ${num}`);
                console.log(`Loss: ${logs.loss}`);
            }
        }
    }).then((res) => {
        console.log(res);
    });

    createCanvas(600, 600).parent("sketch-holder");
    player = O;

    select("#use-ai").mousePressed(() => {
        const xarr = [];
        switch(player) {
        case X:
            xarr.push(0);
            xarr.push(1);
            break;
        case O:
            xarr.push(1);
            xarr.push(0);
            break;
        }
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                switch(grid[i][j]) {
                case X:
                    xarr.push(0);
                    xarr.push(1);
                    break;
                case O:
                    xarr.push(1);
                    xarr.push(0);
                    break;
                case E:
                    xarr.push(0);
                    xarr.push(0);
                }
            }
        }
        tf.tidy(() => {
            const x = tf.tensor2d(xarr, [1, 20]);
            const y = model.predict(x);
            console.log(y.dataSync());
            const idx = y.argMax(1).dataSync()[0];
            grid[floor(idx / 3)][idx % 3] = player;
            player = (player == X) ? O : X;
        });
    });
}


function drawX(x, y) {
    line(x - 50, y - 50, x + 50, y + 50);
    line(x + 50, y - 50, x - 50, y + 50);
}

function drawO(x, y) {
    noFill();
    ellipse(x, y, 120);
}

function displayMsg(txt) {
    fill(255, 255, 0);
    noStroke();
    rectMode(CENTER);
    rect(300, 300, 250, 150);
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(txt, 300, 300);
    noLoop();
}

function draw() {
    background(0);

    stroke(255);
    strokeWeight(5);

    line(200, 0, 200, 600);
    line(400, 0, 400, 600);
    line(0, 200, 600, 200);
    line(0, 400, 600, 400);

    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            stroke(255);
            switch(grid[i][j]) {
            case X:
                drawX(j * 200 + 100, i * 200 + 100);
                break;
            
            case O:
                drawO(j * 200 + 100, i * 200 + 100);
                break;
            
            case E:
                if(mouseX >= j * 200 && mouseX <= j * 200 + 200 &&
                    mouseY >= i * 200 && mouseY <= i * 200 + 200) {
                    stroke(100);
                    if(player === X) drawX(j * 200 + 100, i * 200 + 100);
                    else drawO(j * 200 + 100, i * 200 + 100);
                }
                break;
            }
        }
    }

    if((grid[0][0] === X && grid[0][1] === X && grid[0][2] === X) ||
        (grid[1][0] === X && grid[1][1] === X && grid[1][2] === X) ||
        (grid[2][0] === X && grid[2][1] === X && grid[2][2] === X) ||
        (grid[0][0] === X && grid[1][0] === X && grid[2][0] === X) ||
        (grid[0][1] === X && grid[1][1] === X && grid[2][1] === X) ||
        (grid[0][2] === X && grid[1][2] === X && grid[2][2] === X) ||
        (grid[0][0] === X && grid[1][1] === X && grid[2][2] === X) ||
        (grid[0][2] === X && grid[1][1] === X && grid[2][0] === X))
        displayMsg("X won");
    else if((grid[0][0] === O && grid[0][1] === O && grid[0][2] === O) ||
        (grid[1][0] === O && grid[1][1] === O && grid[1][2] === O) ||
        (grid[2][0] === O && grid[2][1] === O && grid[2][2] === O) ||
        (grid[0][0] === O && grid[1][0] === O && grid[2][0] === O) ||
        (grid[0][1] === O && grid[1][1] === O && grid[2][1] === O) ||
        (grid[0][2] === O && grid[1][2] === O && grid[2][2] === O) ||
        (grid[0][0] === O && grid[1][1] === O && grid[2][2] === O) ||
        (grid[0][2] === O && grid[1][1] === O && grid[2][0] === O))
        displayMsg("O won"); 
    else {
        let draw = true;
        for(let i = 0; i < 3; i++) for(let j = 0; j < 3; j++) if(grid[i][j] === E) draw = false;
        if(draw) displayMsg("Draw");
    }
}

function mousePressed() {
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            if(grid[i][j] === E &&
                mouseX >= j * 200 && mouseX <= j * 200 + 200 &&
                mouseY >= i * 200 && mouseY <= i * 200 + 200) {
                grid[i][j] = player;
                player = (player == X) ? O : X;
            }
        }                
    }
}