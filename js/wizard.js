/**
 * Описание объекта Маг.
 * @type {exports|module.exports}
 */
var setTimer = require('./timer.js');
var Keys = require('./key.js');
var Key = Keys.Key;
var keyCodes = Keys.keyCodes;

var Fireball = require('./fireball.js');
/**
 * Максимальная длительность прыжка в фрэймах.
 * @type {number}
 */
var JUMP_TIME = 30;

/**
 * Сила прыжка
 * @type {number}
 */
var JUMP_FORCE = 10;

/**
 * Задержка между прыжками.
 * @type {number}
 */
var JUMP_DELAY = 20;

/**
 * Количество действий совершаемых за одну единицу маны.
 * @type {number}
 */
var ACTIONS_PER_MANA = 5;

/**
 * Настройки объекта
 * @constructor
 */
function Wizard() {
  this.wizardImage = new Image();
  this.wizardImage.src = 'img/wizard.png';

  this.direction = 'right';
  this.fly = 0;
  this.canShootFireball = 1;
  this.manaCounter = 0;
  this.needRestoreMana = 0;
  this.restoringMana = 0;

  this.wizardParams = {
    w: 93,
    h: 90,
    x: 0,
    y: 0,
    speed: 5,
    mass: 5,
    mana: 5,
    maxMana: 5
  };

  this.jumpParams = {
    force: JUMP_FORCE,
    time: JUMP_TIME,
    delay: JUMP_DELAY,
    minHeight: JUMP_TIME / 3,
    currJumpTime: 0
  };

  /*Границы мира*/
  this.leftBorder = 0;
  this.rightBorder = 1024 - this.wizardParams.w;
  this.floor = 0;

  this.fireballsArray = [];
}

/**
 * Отрисовка мага
 * @param context
 */
Wizard.prototype.drawWizard = function (context) {
  if (this.direction == 'right') {
    context.drawImage(
      this.wizardImage,
      0,
      0,
      this.wizardParams.w,
      this.wizardParams.h,
      this.wizardParams.x,
      this.wizardParams.y,
      this.wizardParams.w,
      this.wizardParams.h);
  }
  else {
    context.drawImage(
      this.wizardImage,
      0 + this.wizardParams.w,
      0,
      this.wizardParams.w,
      this.wizardParams.h,
      this.wizardParams.x,
      this.wizardParams.y,
      this.wizardParams.w,
      this.wizardParams.h);
  }
};

/**
 * Метод проверки гравитации.
 */
Wizard.prototype.checkGravitation = function () {
if (!(Key.map[keyCodes.shift] && Key.map[keyCodes.up])) {
  if (this.wizardParams.y < this.floor) {
    this.wizardParams.y += this.wizardParams.mass;
    this.fly = 1;
  }

  if (this.wizardParams.y > this.floor) {
    this.wizardParams.y = this.floor;
  }

  if (this.wizardParams.y === this.floor) {
    this.fly = 0;

    if (this.jumpParams.delay > 0) {
      this.jumpParams.delay--;
    }
    else {
      this.jumpParams.currJumpTime = 0;
      this.jumpParams.delay = JUMP_DELAY;
    }
  }
}
};

/**
 * Метод перемещения мага
 * @param direction направление движения
 */
Wizard.prototype.moveTo = function (direction) {
  switch (direction) {
    case 'right':
      this.direction = 'right';
      if (this.wizardParams.x < this.rightBorder) {
        this.wizardParams.x += this.wizardParams.speed;
      }
      break;
    case 'left':
      this.direction = 'left';
      if (this.wizardParams.x > this.leftBorder) {
        this.wizardParams.x -= this.wizardParams.speed;
      }
  }
};

/**
 * Метод прыжка.
 */
Wizard.prototype.jump = function () {
  if (this.jumpParams.currJumpTime < this.jumpParams.time) {
    var force = this.jumpParams.force - ((this.jumpParams.currJumpTime / (this.jumpParams.force)) * 2 | 0);
    this.wizardParams.y -= force;
    this.jumpParams.currJumpTime++;
  }
};

/**
 * Метод полета.
 */
Wizard.prototype.fly = function () {
  if (this.jumpParams.currJumpTime < this.jumpParams.time) {
    var force = this.jumpParams.force - ((this.jumpParams.currJumpTime / (this.jumpParams.force)) * 2 | 0);
    this.wizardParams.y -= force;
    this.jumpParams.currJumpTime++;
  }
};

/**
 * Выстрел файрболлом
 */
Wizard.prototype.fireball = function () {
  this.canShootFireball = 0;
  var fireball = new Fireball(this.wizardParams.x, this.wizardParams.y, this.direction);
  this.fireballsArray.push(fireball);

  setTimer(function () {
    this.canShootFireball = 1;
  }.bind(this), 20);
  setTimer(function () {
    this.fireballsArray.shift();
  }.bind(this), 60);
};

/**
 * Обработка нажатий клавиш
 */
Wizard.prototype.keyBindings = function () {
  if (Key.map[keyCodes.right]) {
    this.moveTo('right');
  }
  if (Key.map[keyCodes.left]) {
    this.moveTo('left');
  }
  if (Key.map[keyCodes.up]) {
    this.jump();
  }
  if ((!Key.map[keyCodes.up]) && this.fly && (this.jumpParams.currJumpTime <= this.jumpParams.minHeight)) {
    this.jump();
  }
  if ((!Key.map[keyCodes.up]) && this.fly && (this.jumpParams.currJumpTime > this.jumpParams.minHeight)) {
    this.jumpParams.currJumpTime = JUMP_TIME;
  }

  if (Key.map[keyCodes.space]) {
    if (this.canShootFireball) {
      this.manaConsumption(this.fireball.bind(this));
    }
  }
};

/**
 * Установка высоты пола для мага.
 * @param y
 */
Wizard.prototype.setFloor = function (y) {
  this.wizardParams.y = this.floor = y - this.wizardParams.h;
};

/**
 * Обертка для отслеживания потребления маны.
 * @param action функция выполнения.
 */
Wizard.prototype.manaConsumption = function (action) {
  if (this.wizardParams.mana > 0) {
    if (this.manaCounter < ACTIONS_PER_MANA) {
      this.manaCounter++;
    } else {
      this.wizardParams.mana--;
      this.manaCounter = 0;
    }

    action();
  } else {
    if (!this.needRestoreMana && !this.restoringMana) {
      console.log('work')
      this.needRestoreMana = 1;
    }
  }
};

/**
 * Получение текущего значения маны
 * @returns {number}
 */
Wizard.prototype.getMana = function () {
  return this.wizardParams.mana;
};

//Wizard.prototype.checkMana = function () {
//if (this.needRestoreMana && !this.restoringMana) {
//  this.restoringMana = 1;
//  for (var i = 0; i < this.wizardParams.maxMana; i++) {
//    setTimer(function () {
//      this.wizardParams.mana++;
//    }.bind(this), 60);
//  }
//
//  //this.needRestoreMana = 0;
//  //this.restoringMana = 0;
//}
//
//this.needRestoreMana = 0;
//this.restoringMana = 0;
//};

/**
 * Отрисовка объекта
 * @param context
 */
Wizard.prototype.draw = function (context) {
  this.drawWizard(context);

  this.fireballsArray.forEach(function (item) {
    item.draw(context);
  });

};

/**
 * Обновление объекта.
 */
Wizard.prototype.update = function () {
  this.checkGravitation();
  this.keyBindings();
  //this.checkMana();

  this.fireballsArray.forEach(function (item) {
    item.update();
  });
};

module.exports = Wizard;
