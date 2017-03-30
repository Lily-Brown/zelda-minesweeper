console.log('Assets connected.');

$(document).ready(function() {
  var isMobile = window.matchMedia('only screen and (max-width: 760px)');

  // Creates new Game and GameBoard, cleans up old board, reset statuses/listeners
  function startGame(event,height,width,difficulty,highScores) {
    game = new Game(height,width,difficulty,highScores);
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

  // Adds Event Listeners
  function addEventListeners() {
    $('.box').on('click',handleClick);
    $('.box').on('contextmenu',handleRightClick);
  }

  // Starts are game with Custom height/width/difficulty from form
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
      startGame(event,height,width,difficulty,game.highScores);
    }
  }

  // Handle Left-Click when Game is 'In Play'
  function handleClick() {
    if (game.state === 'In Play') {

      // Start timer for High Score
      if (!timerStarted) {
        timerStarted = true;
        startTime = Date.now();
      }

      var position = getPosition(event),
          x = position[0],
          y = position[1],
          coordinate = gameBoard.board[x][y],
          displayCoordinate = '.row_' + x + '.col_' + y;
      // If bomb ==> 'You Lost.' && Return without Revel recursion
      if (coordinate === 'bomb') {
        $(displayCoordinate).css('background-color', 'red');
        game.state = 'You Lost.';
        game.gameOver();
        return;
      // If Marker Number != Flagged-Near ==> Return without Revel recursion
      } else if (parseInt(coordinate) != NaN && coordinate != null) {
        value = coordinate.toString().replace('revealed-','');
        $(displayCoordinate)[0].classList.add(numbers[value]);
        if (!gameBoard.revealed.includes(x+':'+y)) {
          gameBoard.revealed.push(x+':'+y);
        }
        gameBoard.checkWin();
        if (gameBoard.findNear(x,y,'flag') != value ) {
          return;
        }
      }
      if (!gameBoard.revealed.includes(x+':'+y)) {
        gameBoard.revealed.push(x+':'+y);
      }
      gameBoard.reveal(x,y);
      gameBoard.checkWin();
    }
  }

  // Handle Right-Click when Game is 'In Play'
  function handleRightClick() {
    event.preventDefault();
    if (game.state === 'In Play') {
      var position = getPosition(event),
        x = position[0],
        y = position[1],
        coordinate = gameBoard.board[x][y],
        displayCoordinate = '.row_' + x + '.col_' + y;
      // Flag if Not Flagged || Un-Flag if Flagged, Adjust Bomb count
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

  // Get row,col position of click event
  function getPosition(event) {
    var toParse = event.target.className;
    var row = toParse.substring((toParse.indexOf('row_'))+4,(toParse.indexOf('col')));
    var col = toParse.substring((toParse.indexOf('col'))+4,(toParse.length));
    return [parseInt(row), parseInt(col)];
  }

  // Helper Function to Sort High Scores as Integers
  function sortNumber(a,b) {
    return a - b;
  }

  // Get Time User took to Complete Game
  function getTime() {
    endTime = Date.now();
    timerStarted = false;
    return (endTime - startTime)/1000;
  }

  // Display High Scores on Modal
  function displayHighScores() {
    $('#high-scores').empty();
    var score;
    for(var i=0;i<10;i++) {
      if (game.highScores[i] === undefined) {
        score = '';
      } else {
        score = game.highScores[i] + ' s';
      }
      var element = '<li>' + score +'</li>';
      $('#high-scores').append(element);
    }
  }

  // GAME CONSTRUCTOR
  function Game(height,width,difficulty,highScores) {
    this.state = 'In Play';
    this.height = height;
    this.width = width;
    this.difficulty = difficulty;
    this.highScores = highScores;
  }

  // GAME: Creates HTML board on page
  Game.prototype.initalizeDisplayBoard = function(height,width) {
    for(var i=0;i<height;i++) {
      var rowId="starter"+i;
      var element="<div class='headbox "+rowId+" row_"+(i)+"''></div>";
      if (isMobile.matches) {
        $('#mobile-wrapper').append(element);
        $('#mobile-wrapper').width(width*20);
      } else {
        $('#wrapper').append(element);
        $('#wrapper').width(width*20);
      }
      for(var j=0;j<width;j++) {
        var rowElement="<div class='box border row_"+(i)+" col_"+(j)+"'></div>";
        newRowId=".starter"+i;
        $(newRowId).append(rowElement);
      }
    }
    console.log('Board created.');
  };

  // GAME: Handle Game Over
  Game.prototype.gameOver = function() {
    var yourTime = getTime();
    // Clears/resets image and bomb-span
    $('#game-over-image')[0].classList = '';
    $('#bomb-span').css('color','#4B964C');
    // If 'You Lost' ==> Display bombs and Toggle Modal
    if (game.state === 'You Lost.') {
      gameBoard.bombs.forEach(function(bomb,key) {
        displayCoordinate = '.row_' + bomb[0] + '.col_' + bomb[1];
        $(displayCoordinate)[0].classList.add('bomb');
      });
      $('#game-over-image')[0].classList.add('link-lost');
      $('#game-state').html('You lost.');
      $('#game-over-modal').modal('toggle');
    // If 'You Win' ==> Display flags, add Time to High Scores, and Toggle Modal
    } else {
      gameBoard.bombs.forEach(function(bomb,key) {
        displayCoordinate = '.row_' + bomb[0] + '.col_' + bomb[1];
        $(displayCoordinate).css('background-color', '#19BC05');
        $(displayCoordinate)[0].classList.add('flag');
      });
      game.highScores.push(yourTime);
      game.highScores.sort(sortNumber);
      displayHighScores();
      $('#game-over-image')[0].classList.add('link-won');
      $('#game-state').html('You won in ' + yourTime + ' seconds!');
      $('#game-over-modal').modal('toggle');
    }
    // Displays 'Potion' in reset button
    $('#reset')[0].classList.remove('link');
    $('#reset')[0].classList.add('potion');
    $('#mobile-reset')[0].classList.remove('link');
    $('#mobile-reset')[0].classList.add('potion');
  }

  // BOARD CONSTRUCTOR
  function Board(height=12,width=12) {
    this.board = [];
    this.bombs = [];
    this.flags = [];
    this.revealed = [];
    this.height = height;
    this.width = width;
    this.size = height * width;

    // Initalize board with all values null
    for(var i=0;i<height;i++) {
      this.board[i]=[];
      for(var j=0;j<width;j++) {
         this.board[i][j]= null;
      }
    }
  }

  // BOARD: Places Bombs randomly on board
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

  // BOARD: Places Markers on Board based on bombsNear
  Board.prototype.placeMarkers = function() {
    for(var i=0;i<this.height;i++) {
      for(var j=0;j<this.width;j++) {
        var bombsNear = this.findNear(i,j,'bomb');
        if (bombsNear > 0) {
          this.board[i][j] = bombsNear.toString();
          var displayCoordinate = '.row_'+ i + '.col_' + j;
        }
      }
    }
    console.log('Markers placed.');
  };

  // BOARD: Returns the number of 'elements' near given location i,j
  Board.prototype.findNear = function(i,j,element) {
    var foundNear = 0;
    // If not the first row
    if (this.board[i][j] != element) {
      if (i > 0) {
        // If not the first column
        if (j > 0 && String(this.board[i-1][j-1]).includes(element)) {
          foundNear++;
        }
        if (String(this.board[i-1][j]).includes(element)) {
          foundNear++;  
        }
        // If not the last column
        if (j < this.width-1) {
          if (String(this.board[i-1][j+1]).includes(element)) {
            foundNear++;
          }
        }
      }
      // If not the last row
      if (i < this.height-1) {
        // If not the first column
        if (j > 0 && String(this.board[i+1][j-1]).includes(element)) {
          foundNear++;
        }
        if (String(this.board[i+1][j]).includes(element)) {
          foundNear++;
        }
        // If not the last column
        if (j < this.width-1) {
          if (String(this.board[i+1][j+1]).includes(element)) {
           foundNear++;
          }
        }
      }
      // If not the first column
      if (j > 0) {
        if (String(this.board[i][j-1]).includes(element)) {
          foundNear++;
        }
      }
      // If not the last column
      if (j < this.width-1) {
        if (String(this.board[i][j+1]).includes(element)) {
          foundNear++;
        }
      }
    }
    return foundNear;
  }

  // BOARD: Reveal logic from
  // http://kitedeveloper.blogspot.com/2013/04/minesweeper-using-recursion-to-reveal.html
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

  // BOARD: RevealNextCell from
  // http://kitedeveloper.blogspot.com/2013/04/minesweeper-using-recursion-to-reveal.html
  Board.prototype.revealNextCell = function(x, y){
    var displayCoordinate = '.row_' + x + '.col_' + y;

    if (x < 0 || y < 0 || x > this.height-1 || y > this.width-1) return;
    var coordinate = this.board[x][y];
    if (coordinate === 'revealed') return;
    if (coordinate === 'bomb') return;

    if (coordinate === null) {
      this.board[x][y] = 'revealed';
      $(displayCoordinate)[0].classList.remove('border');
      if (!gameBoard.revealed.includes(x+':'+y)) {
        gameBoard.revealed.push(x+':'+y);
      }
      this.reveal(x,y);
    } else { 
      if (coordinate.includes('flag')) return;
      var state = this.board[x][y].replace('revealed-','');
      this.board[x][y] = 'revealed-'+state;
      if (!gameBoard.revealed.includes(x+':'+y)) {
        gameBoard.revealed.push(x+':'+y);
      }
      $(displayCoordinate)[0].classList.add(numbers[state]);
    }
  }
  
  // BOARD: Checks for a Win State
  Board.prototype.checkWin = function() {
    // If number of Flags are the same as Bombs
    if (this.flags.length === this.bombs.length) {
      if(this.flags.sort().join(',') === this.bombs.sort().join(',')){
        game.state = 'You win.';
        game.gameOver();
      }
    }
    // If number of Revealed cells equal (Size of Board - Number of Bombs)
    if (gameBoard.revealed.length === (gameBoard.size-gameBoard.bombs.length)) {
      game.state = 'You win.';
      game.gameOver();
    }
  };

  /*
  ----------------
  When document.ready, start game
  ----------------
  */
  var game,
      timerStarted = false,
      startTime,
      endTime,
      numbers = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven'
  }
  startGame('',12,12,0,[]);

  // Add EventListeners for reset and create buttons
  $('#reset').on('click',function() {
    startGame('', game.height, game.width, game.difficulty,game.highScores);
  });
  $('#mobile-reset').on('click',function() {
    startGame('', game.height, game.width, game.difficulty,game.highScores);
  });
  $('#create').on('click',createGame);

});
