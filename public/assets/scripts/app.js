console.log('Assets connected.');

$(document).ready(function() {
  var isMobile = window.matchMedia("only screen and (max-width: 760px)");

  function startGame(event,height,width,difficulty) {
    game = new Game();
    game.height = height;
    game.width = width;
    game.difficulty = difficulty;
    gameBoard = new Board(height,width);

    $('#wrapper').empty();
    $('#mobile-wrapper').empty();

    game.initalizeDisplayBoard(height,width);
    gameBoard.placeBombs(difficulty);
    gameBoard.placeMarkers();

    $('#bombs').html(gameBoard.bombs.length);

    $('#bomb-span').css('color','#000000');

    $('#reset')[0].classList.remove('potion');
    $('#reset')[0].classList.add('link');
    $('#mobile-reset')[0].classList.remove('potion');
    $('#mobile-reset')[0].classList.add('link');

    $('#v-align').width(width*20+5);
    $('#v-align').height(height*20+10);

    $('#mobile-v-align').width(width*20+5);
    $('#mobile-v-align').height(height*20+10);

    addEventListeners();
  }

  function createGame(event) {
    event.preventDefault();
    var height = parseInt($('#height').val());
    var width = parseInt($('#width').val());
    var difficulty = parseInt($('#difficulty').val());
    if (height <= 0 || height > 15) {
      alert('Height needs to be a number between 1 and 15.');
    } else if (isMobile.matches && width > 12 ) {
      alert('Width needs to be a number between 1 and 12.');
    } else if (width <= 0 || width > 20) {
      alert('Width needs to be a number between 1 and 20.');
    } else if (difficulty < 0 || difficulty > 3) {
      alert('Difficulty must be an integer between 0 and 2.');
    } else {
      $('#custom-modal').modal('hide');
      startGame(event,height,width,difficulty);
    }
  }

  function addEventListeners() {
    $('.box').on('click',handleClick);
    $('.box').on('contextmenu',handleRightClick);
  }

  function handleClick() {
    if (game.state === 'In Play') {
      var position = getPosition(event),
          x = position[0],
          y = position[1],
          coordinate = gameBoard.board[x][y];

      var displayCoordinate = '.row_' + x + '.col_' + y;
      if (coordinate === 'bomb') {
        $(displayCoordinate).css('background-color', 'red');
        game.state = 'You Lost.';
        gameOver();
        return;
      } else if (parseInt(coordinate) != NaN && coordinate != null) {
        something = coordinate.toString().replace('revealed-','');
        $(displayCoordinate)[0].classList.add(numbers[something]);
      }
      gameBoard.reveal(x,y);
    }
  }

  function handleRightClick() {
    event.preventDefault();
    if (game.state === 'In Play') {
      var position = getPosition(event),
        x = position[0],
        y = position[1],
        coordinate = gameBoard.board[x][y],
        displayCoordinate = '.row_' + x + '.col_' + y;
      if (coordinate != null && !coordinate.includes('revealed')) {
        if (coordinate.includes('flag-')) {
          gameBoard.board[x][y] = coordinate.replace("flag-",'');
          $(displayCoordinate)[0].classList.remove('flag')
          gameBoard.flags.splice(gameBoard.flags.indexOf([x,y]),1)
          $('#bombs').html(gameBoard.bombs.length - gameBoard.flags.length);
        } else {
          gameBoard.flags.push([x,y]);
          gameBoard.board[x][y] = 'flag-'+ gameBoard.board[x][y];
          $(displayCoordinate)[0].classList.add('flag')
          $('#bombs').html(gameBoard.bombs.length - gameBoard.flags.length);
        }
      }
    }
    gameBoard.checkWin();
  }

  function getPosition(event) {
    var toParse = event.target.className;
    var row = toParse.substring((toParse.indexOf('row_'))+4,(toParse.indexOf('col')));
    var col = toParse.substring((toParse.indexOf('col'))+4,(toParse.length));
    return [parseInt(row), parseInt(col)];
  }

  function gameOver() {
    $('#bomb-span').css('color','#4B964C');
    if (game.state === 'You Lost.') {
      gameBoard.bombs.forEach(function(bomb,key) {
        displayCoordinate = '.row_' + bomb[0] + '.col_' + bomb[1];
        $(displayCoordinate)[0].classList.add('bomb');
      });
      $('#game-over-modal').modal('toggle');
      $('#game-over-image')[0].classList.add('link-lost');
    } else {
      gameBoard.flags.forEach(function(flag,key) {
        displayCoordinate = '.row_' + flag[0] + '.col_' + flag[1];
        $(displayCoordinate).css('background-color', '#19BC05');
      });
      $('#game-over-modal').modal('toggle');
      $('#game-over-image')[0].classList.add('link-won');
    }
    $('#reset')[0].classList.remove('link');
    $('#reset')[0].classList.add('potion');
    $('#mobile-reset')[0].classList.remove('link');
    $('#mobile-reset')[0].classList.add('potion');
  }

  // Game Constructor
  function Game() {
    this.state = 'In Play';
    this.height = 0;
    this.width = 0;
    this.difficulty = 0;
  }

  // Creates HTML board on page
  Game.prototype.initalizeDisplayBoard = function(height,width) {
    console.log("hi");
    for(var i=0;i<height;i++) {
      var rowId="starter"+i;
      var element="<div class='headbox "+rowId+" row_"+(i)+"''></div>";
      if (isMobile.matches) {
        $('#mobile-wrapper').append(element);
      } else {
        $('#wrapper').append(element);
      }
      for(var j=0;j<width;j++) {
        var rowElement="<div class='box border row_"+(i)+" col_"+(j)+"'></div>";
        newRowId=".starter"+i;
        $(newRowId).append(rowElement);
      }
    }
    $('#wrapper').width(width*20);
    $('#mobile-wrapper').width(width*20);
    console.log('Board created.');
  };

  // Board Constructor
  function Board(height=12,width=12) {
    this.board = [];
    this.bombs = [];
    this.flags = [];
    this.height = height;
    this.width = width;
    this.size = height * width;

    // Initalizing board
    for(var i=0;i<height;i++) {
      this.board[i]=[];
      for(var j=0;j<width;j++) {
         this.board[i][j]= null;
      }
    }
  }

  // Places Bombs on board
  Board.prototype.placeBombs = function(difficulty=0) {
    var bombs,
        height,
        width;

    if (difficulty === 0) {
      bombs = Math.floor(this.size * 0.05);
    } else if (difficulty === 1) {
      bombs = Math.floor(this.size * 0.25);
    } else if (difficulty === 2) {
      bombs = Math.floor(this.size * 0.50);
    }
    for (var i=0; i<bombs; i++) {
      height = Math.floor(Math.random() * this.height);
      width = Math.floor(Math.random() * this.width);
      if (this.board[height][width] === null) {
        this.board[height][width] = 'bomb';
        this.bombs.push([height,width]);
      } else {
        bombs++;
      }
    }
    console.log('Bombs placed.');
  };

  // Places Markers on Board
  Board.prototype.placeMarkers = function() {
    for(var i=0;i<this.height;i++) {
      for(var j=0;j<this.width;j++) {
        var bombsNear = 0;
        // If not the first row
        if (this.board[i][j] != 'bomb') {
          if (i > 0) {
            // If not the first column
            if (j > 0 && this.board[i-1][j-1] === 'bomb') {
              bombsNear ++;
            }
            if (this.board[i-1][j] === 'bomb') {
              bombsNear ++;  
            }
            // If not the last column
            if (j < this.width-1) {
              if (this.board[i-1][j+1] === 'bomb') {
                bombsNear ++;
              }
            }
          }
          // If not the last row
          if (i < this.height-1) {
            // If not the first column
            if (j > 0 && this.board[i+1][j-1] === 'bomb') {
              bombsNear ++;
            }
            if (this.board[i+1][j] === 'bomb') {
              bombsNear ++;
            }
            // If not the last column
            if (j < this.width-1) {
              if (this.board[i+1][j+1] === 'bomb') {
               bombsNear ++;
              }
            }
          }
          // If not the first column
          if (j > 0) {
            if (this.board[i][j-1] === 'bomb') {
              bombsNear ++;
            }
          }
          // If not the last column
          if (j < this.width-1) {
            if (this.board[i][j+1] === 'bomb') {
              bombsNear ++;
            }
          }
          if (bombsNear > 0) {
            this.board[i][j] = bombsNear.toString();
            var displayCoordinate = '.row_'+ i + '.col_' + j;
          }
        }
      }
    }
    console.log('Markers placed.');
  };

  Board.prototype.reveal = function(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    this.revealNextCell(x - 1, y - 1);
    this.revealNextCell(x - 1, y);
    this.revealNextCell(x - 1, y + 1);
    this.revealNextCell(x + 1, y);

    this.revealNextCell(x, y - 1);
    this.revealNextCell(x, y + 1);
    this.revealNextCell(x + 1, y - 1);
    this.revealNextCell(x + 1, y + 1);
  }

  Board.prototype.revealNextCell = function(x, y){
    var displayCoordinate = '.row_' + x + '.col_' + y;

    if (x < 0 || y < 0 || x > this.height-1 || y > this.width-1) return;
    var coordinate = this.board[x][y];
    if (coordinate === 'revealed') return;
    if (coordinate === 'bomb') return;

    if (coordinate === null) {
      this.board[x][y] = 'revealed';
      $(displayCoordinate)[0].classList.remove('border');
      this.reveal(x,y);
    } else { 
      if (coordinate.includes('flag')) return;
      var state = this.board[x][y].replace('revealed-','');
      this.board[x][y] = 'revealed-'+state;
      $(displayCoordinate)[0].classList.add(numbers[state]);
    }
  }
  
  // Checks for a Win State
  Board.prototype.checkWin = function() {
    // If player Flags are the same as Bombs
    if (this.flags.length === this.bombs.length) {
      if(this.flags.sort().join(',') === this.bombs.sort().join(',')){
        game.state = 'You win.';
        gameOver();
      }
    }
  };

  // Start Game
  var game;
  var numbers = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven'
  }
  startGame('',12,12,0);

  $('#reset').on('click',function() {
    startGame('', game.height, game.width, game.difficulty);
  });
  $('#mobile-reset').on('click',function() {
    startGame('', game.height, game.width, game.difficulty);
  });
  $('#create').on('click',createGame);
});
