"use stirct";

var Game = {};
Game.fps = 60;
Game.initialize = function () {
  this.entities = [];
  this.field = document.getElementById("demo");
  this.context = this.field.getContext("2d");
}

Game.draw = function () {
  this.context.clearRect(0, 0, this.field.width, this.field.height);

  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this.context);
  }
}

Game.update = function () {
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].update();
  }
}

Game.run = (function () {
  var loops = 0,
    skipTicks = 1000 / Game.fps,
    maxFrameSkip = 10,
    nextGameTick = (new Date).getTime();

  return function () {
    loops = 0;

    while ((new Date).getTime() > nextGameTick) {
      Game.update();
      nextGameTick += skipTicks;
      loops++;
    }

    Game.draw();
  };
})();
Game.addEntity = function (entity) {
  Game.entities.push(entity);
};

module.exports = Game;
