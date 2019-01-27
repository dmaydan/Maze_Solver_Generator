canvas = document.getElementsByTagName("canvas")[0];
ctx = canvas.getContext("2d");
const WIDTH = 600;
const HEIGHT = 600
canvas.width = WIDTH;
canvas.height = HEIGHT;


var Cell = function(cellType){
	this.value = cellType;
	this.row = null;
	this.column = null;
	this.distance = null;
	this.pred = null;
	this.bfsColor = "white";
};

Cell.prototype.getColor = function() {
	if (this.value == "#"){
		return "#000000";
	}
	else if (this.value == " "){
		return "#FFFFFF";
	}
	else if (this.value == "S"){
		return 	"#008000";
	}
	else if (this.value == "E"){
		return "#FF0000";
	}
	else if (this.value == "P"){
		return "#800080";
	}
	else{
		return "#FFFF00";
	}
};

Cell.prototype.setPos = function(row, col){
	this.row = row;
	this.col = col;
};

Cell.prototype.getNeighbors = function(){
	// Not necessarily legal neighbors
	row = this.row;
	col = this.col;
	return [[row-1,col-1], [row-1,col], [row-1,col+1], [row,col-1], [row,col+1], [row+1,col-1], [row+1,col], [row+1,col+1]];
};

Cell.prototype.setDistance = function(distance){
	this.distance = distance;
};

Cell.prototype.getDistance = function(){
	return this.distance;
};

Cell.prototype.getBFSColor = function(){
	return this.bfsColor;
};

Cell.prototype.setBFSColor = function(color){
	this.bfsColor = color;
};

Cell.prototype.setBFSColor = function(color){
	this.bfsColor = color;
};

Cell.prototype.setPred = function(pred){
	this.pred = pred;
};

Cell.prototype.getPred = function(){
	return this.pred;
};

var Maze = function(){
	this.contents = [];
	this.start = null;
	this.end = null;
};

Maze.prototype.initContents = function(desiredRes){
	for (let i = 0; i < desiredRes; i++){
		this.contents.push([])
		for (let j = 0; j < desiredRes; j++){
			if (i == 0 || i == (desiredRes-1) || j == 0 || j == (desiredRes-1)){
				let cell = new Cell("#");
				cell.setPos(i, j);
				this.contents[i].push(cell);
			}
			else{
				let cell = new Cell(" ");
				cell.setPos(i, j);
				this.contents[i].push(cell);
			}
		}
	}
};

Maze.prototype.generator = function([x1, x2], [y1, y2], desiredRes){
	let width = x2 - x1;
	let height = y2 - y1;
	if (width >= height){
		// vertical bisection
		if(x2-x1>3){
			let bisection = Math.ceil((x1+x2)/2);
			let max = y2-1;
			let min = y1+1;
			let randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
			let first = false;
			let second = false;
			if (this.contents[y2][bisection].value == " "){
				randomPassage = max;
				first = true;
			}
			if (this.contents[y1][bisection].value == " "){
				randomPassage = min;
				second = true;
			}
			for (let i = y1+1; i < y2; i++){
				if (first && second){
					if (i == max || i == min){
						continue;
					}
				}
				else if (i == randomPassage){
					continue;
				}
				this.contents[i][bisection].value = "#";
			}
			this.generator([x1, bisection],[y1, y2], desiredRes);
			this.generator([bisection, x2],[y1, y2], desiredRes);
		}
	}
	else{
		// horizontal bisection
		if (y2-y1 > 3){
			let bisection = Math.ceil((y1+y2)/2);
			let max = x2-1;
			let min = x1+1;
			let randomPassage = Math.floor(Math.random() * (max - min + 1)) + min;
			let first = false;
			let second = false;
			if (this.contents[bisection][x2].value == " "){
				randomPassage = max;
				first = true;
			}
			if (this.contents[bisection][x1].value == " "){
				randomPassage = min;
				second = true;
			}
			for (let i = x1+1; i < x2; i++){
				if (first && second){
					if (i == max || i == min){
						continue;
					}
				}
				else if (i == randomPassage){
					continue;
				}
				this.contents[bisection][i].value = "#";
			} 
			this.generator([x1, x2],[y1, bisection], desiredRes);
			this.generator([x1, x2],[bisection, y2], desiredRes);
		}
	}
};

Maze.prototype.render = function(){
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	let numRows = this.contents.length;
	let numCols = this.contents[0].length;
	let cellWidth = WIDTH/numCols;
	let cellHeight = HEIGHT/numRows;
	let cellLength = cellWidth > cellHeight ? cellHeight : cellWidth;
	for (let row = 0; row < numRows; row++){
		for (let col = 0; col < numCols; col++){
			let cell = this.contents[row][col];
			ctx.fillStyle = cell.getColor()
			let rectX = col * cellLength;
			let rectY = row * cellLength;
			ctx.fillRect(rectX, rectY, cellLength, cellLength);
		}
	}
};

Maze.prototype.getEmptySlots = function(){
	let emptySlots = [];
	for (let row = 0; row < this.contents.length; row++){
		for (let col = 0; col < this.contents[0].length; col++){
			if (this.contents[row][col].value == " "){
				emptySlots.push(this.contents[row][col]);
			}
		}
	}
	return emptySlots;
};

Maze.prototype.initPoints = function(){
	let emptySlots = this.getEmptySlots();
	if (emptySlots.length > 1){
		this.start = emptySlots[0];
		this.end = emptySlots[emptySlots.length-1];
		this.start.value = "S";
		this.end.value = "E";
	}
};

Maze.prototype.shortestBFS = function(){
	let start = this.end;
	start.setDistance(0);
	start.setPred(null);
	let cellQueue = []; // enqueue is push - dequeue is shift
	cellQueue.push(start);
	while (cellQueue.length > 0){
		let currentCell = cellQueue.shift();
		let neighbors = currentCell.getNeighbors();
		for (let neighbor of neighbors){
			let row = neighbor[0];
			let col = neighbor[1];
			if (row >= 0 && col >= 0 && row < this.contents.length && col < this.contents[0].length){
				let cell = this.contents[row][col];
				if (cell.getBFSColor() == "white" && cell.value != "#"){
					cell.setBFSColor("gray");
					cell.setDistance(currentCell.getDistance() + 1);
					cell.setPred(currentCell);
					cellQueue.push(cell);
				}
			}
		}
		currentCell.setBFSColor("black");
	}
};

Maze.prototype.bfsTraverse = function(currentCell){
	currentCell.value = "P";
	this.render();
};

Maze.prototype.clearSolution = function(){
	for (let row of this.contents){
		for (let element of row){
			if (element.value == "P"){
				element.value = " ";
			}
		}
	}
};

let generate = document.getElementById("generate");
let size = document.getElementById("size");
let solve = document.getElementById("solve");
let clear = document.getElementById("clear");

myMaze = null;

function generator(){
	myMaze = new Maze();
	genSize = size.value;
	myMaze.initContents(genSize);
	myMaze.generator([0, genSize-1], [0, genSize-1], genSize);
	myMaze.initPoints();
	myMaze.render();
}

generator();

generate.addEventListener("click", generator);

solve.addEventListener("click", function(){
	myMaze.shortestBFS();
	currentCell = myMaze.start.getPred();
	function animate() {
		if (currentCell != myMaze.end){
			myMaze.bfsTraverse(currentCell);
			currentCell = currentCell.getPred();
			requestAnimationFrame(animate);
		}
	}
	requestAnimationFrame(animate);
});

clear.addEventListener("click", function(){
	myMaze.clearSolution();
	myMaze.render();
});