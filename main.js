enchant();

var teaBottleTex = 'resource/obj/tea_bottle.png';
var blastTex = 'resource/blast/blast.png';
var coffeeBigBottleTex = 'resource/obj/cofee_big_bottle.png';
var lemonShotTex = 'resource/shoot/lemon.png';
var coffeeBeansTex = 'resource/shoot/cofee_beans.png';
var backgroundTex = 'resource/bg/background.jpg';

var Player = enchant.Class.create(enchant.Sprite, {
	initialize:function (x, y)
	{
		enchant.Sprite.call(this, 64, 64);
		this.image = game.assets[coffeeBigBottleTex];
		this.x = x - 20;
		this.y = y;

		//入力検出
		game.rootScene.addEventListener('touchstart', function (e)
		{
			if (e.x < 320 - 64 && e.x > 0) {
				//移動
				player.x = e.x - 20;
				game.touched = true;
			}
		});
		game.rootScene.addEventListener('touchend', function (e)
		{
			if (e.x < 320 - 64 && e.x > 0) {
				player.x = e.x - 20;
				game.touched = false;
			}
		});
		game.rootScene.addEventListener('touchmove', function (e)
		{
			if (e.x < 320 - 64 && e.x > 0) {
				player.x = e.x;
			}
		});
		this.addEventListener('enterframe', function ()
		{
			//shoting per 3sex
			if (game.touched && game.frame % 3 == 0) {

				var shot = new PlayerShoot(this.x, this.y);
				//TODO Play shoot Sound

			}
		});
		game.rootScene.addChild(this);
	}
});

var Enemy = enchant.Class.create(enchant.Sprite, {
	initialize:function (x, y, omega)
	{
		enchant.Sprite.call(this, 64, 64);
		this.image = game.assets[teaBottleTex];
		this.rotate(180);
		this.x = x;
		this.y = y;
		this.time = 0;

		//radianに変換
		this.omega = omega * Math.PI / 180;
		this.direction = 0;
		this.movespeed = 3;

		//動きの制御
		this.addEventListener('enterframe', function ()
		{
			this.direction -= this.omega / 2;
			this.x -= this.movespeed * Math.sin(this.direction);
			this.y += this.movespeed * Math.cos(this.direction);

			//画面外に出たら消える
			if (this.y >= 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
				this.remove();
			}
			else if (rand(100) % 40 == 0) {
				var s = new EnemyShoot(this.x, this.y);
			}
		});
		game.rootScene.addChild(this);
	},
	remove:function ()
	{
		game.rootScene.removeChild(this);
		delete enemies[this.key];
		delete this;
	}
});

var CofeeBoss = enchant.Class.create(enchant.Sprite, {
	initialize:function (x, y)
	{
		enchant.Sprite.call(this, 64, 64);
		this.image = game.assets[teaBottleTex];
		this.x = x;
		this.y = y;
	}

});

//弾の基底クラス
var Shoot = enchant.Class.create(enchant.Sprite, {
	initialize:function (x, y, direction)
	{
		enchant.Sprite.call(this, 32, 32);
		this.x = x;
		this.y = y;

		this.direction = direction;
		this.movespeed = 5;

		//まっすぐ進め！
		this.addEventListener('enterframe', function ()
		{
			this.x += this.movespeed * Math.sin(this.direction);
			this.y += this.movespeed * Math.cos(this.direction);

			//画面外に出たら消える
			if (this.y >= 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
				this.remove();
			}

		});
		game.rootScene.addChild(this);
	},
	remove:function ()
	{
		game.rootScene.removeChild(this);
		delete this;
	}
});

//弾を継承　自機の弾
var PlayerShoot = enchant.Class.create(Shoot, {
	initialize:function (x, y)
	{
		Shoot.call(this, x, y, 3);
		this.image = game.assets[coffeeBeansTex];
		this.movespeed = 15;
		this.scale(0.5);
		this.addEventListener('enterframe', function ()
		{
			//衝突検出
			for (var i in enemies) {
				if (enemies[i].intersect(this)) {
					//blast anim
					var blast = new Blast(enemies[i].x, enemies[i].y);

					if (enemyCount > 10) {
						enemyRate++;
						enemyCount = 0;
					}
					enemyCount++;
					//当たっていたら敵を殺す
					this.remove();
					enemies[i].remove();

					//スコア追加
					game.score += 100;
				}
			}

		});
	}
});

var EnemyShoot = enchant.Class.create(Shoot, {
	initialize:function (x, y)
	{
		Shoot.call(this, x, y, 6);
		this.image = game.assets[lemonShotTex];
		this.scale(0.5);
		this.addEventListener('enterframe', function ()
		{
			this.rotate(10);

			//Playerが敵の弾と衝突したら死亡
			if (player.within(this, 32)) {
				game.end(game.score, "Score : " + game.score);
			}
		});
	}
});

var Blast = enchant.Class.create(enchant.Sprite, {
	initialize:function (x, y)
	{
		enchant.Sprite.call(this, 32, 32);
		this.x = x;
		this.y = y;

		this.image = game.assets[blastTex];
		this.time = 0;

		//animation delay
		this.duration = 10;
		this.frame = 0;

		this.addEventListener('enterframe', function ()
		{
			this.time++;

			//blast anim
			this.frame = Math.floor(this.time / this.duration * 3);
			this.frame = this.time;

			if (this.time == this.duration) {
				this.remove();
			}

		});
		game.rootScene.addChild(this);
	},
	remove:function ()
	{
		game.rootScene.removeChild(this);
	}
});

var backGround = enchant.Class.create(enchant.Sprite, {
	initialize:function ()
	{
		enchant.Sprite.call(this, 320, 320);
		this.x = 0;
		this.y = 0;
		this.image = game.assets[backgroundTex];

		game.rootScene.addChild(this);
	}
});
window.onload = function ()
{
	//game生成
	//noinspection JSUnresolvedFunction
	game = new Game(320, 320);

	// set framerate
	game.fps = 20;
	game.score = 0;
	game.touched = false;

	//画像ロード
	game.preload(coffeeBigBottleTex, teaBottleTex, lemonShotTex, coffeeBeansTex, blastTex, backgroundTex);

	//ロード終了後の処理
	game.onload = function ()
	{
		backGround = new backGround();
		player = new Player(150, 250);
		enemies = [];
		enemyRate = 100;
		enemyCount = 0;

		game.rootScene.addEventListener('enterframe',
			function ()
			{
				if (rand(1000) < enemyRate) {
					//出てくる位置はランダム
					var x = rand(320);

					//進行方向の指定
					var omega = x < 160 ? 1 : -1;
					var enemy = new Enemy(x, 0, omega);
					enemy.key = game.frame;
					enemies[game.frame] = enemy;
				}
				scoreLabel.score = game.score;
			}
		);
		scoreLabel = new ScoreLabel(8, 8);
		game.rootScene.addChild(scoreLabel);
	};
	game.start();
};
