import Sword from './sword.js'; // Импортируем класс меча
import Enemy from './enemy.js'; // Импортируем класс врага

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let hand;
let sword;
let enemy;
let floor;
let particles;
let isDragging = false;
const maxHandDistance = 150;

function preload() {
    // Загружаем изображения
    this.load.image('floor', 'https://labs.phaser.io/assets/skies/gradient16.png');
    this.load.image('particle', 'https://labs.phaser.io/assets/particles/green.png'); // Частица
    this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/baddie.png'); // Спрайт врага
    this.load.image('sword', 'https://labs.phaser.io/assets/sprites/sword.png'); // Меч
}

function create() {
    // Создаем пол
    floor = this.add.tileSprite(0, 0, 2000, 2000, 'floor');
    floor.setOrigin(0.5, 0.5);

    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Создаем игрока
    player = this.physics.add.image(400, 300, 'player').setDisplaySize(50, 50);
    player.visible = false; // Прячем игрока

    // Создаем руку
    hand = this.physics.add.image(400, 300, 'hand').setDisplaySize(20, 20);
    hand.setCollideWorldBounds(false);

    // Создаем меч
    sword = new Sword(this, player, hand); // Передаем ссылку на игрока и руку в меч

    // Создаем врага
    enemy = new Enemy(this, 600, 400); // Передаем координаты для создания врага

    // Создаем эмиттер частиц для эффекта слизи
    particles = this.add.particles(0, 0, 'particle', {
        lifespan: 300,
        speed: { min: 50, max: 60 },
        scale: { start: 1, end: 0.7 },
        blendMode: 'ADD',
        alpha: { start: 0.5, end: 0 }, // Прозрачность: частицы постепенно исчезают
        follow: player, // Частицы следуют за игроком
        quantity: 1
    });

    particles.startFollow(player);
    this.cameras.main.startFollow(player);

    // Обработка нажатий ЛКМ
    this.input.on('pointerdown', (pointer) => {
        if (!isDragging && pointer.leftButtonDown()) {  
            isDragging = true;
        }
    });

    this.input.on('gameout', () => {
        isDragging = false;
    });

    this.input.on('pointerup', () => {
        isDragging = false;
    });
}

function update() {
    const pointer = this.input.activePointer;
    const distance = Phaser.Math.Distance.Between(player.x, player.y, hand.x, hand.y);
    const distanceHandMouse = Phaser.Math.Distance.Between(player.x, player.y, pointer.worldX, pointer.worldY);

    // Обновляем состояние врага — он будет двигаться к игроку
    enemy.update(player);

    // Обновляем состояние меча
    sword.update();

    // Проверка резкого движения мыши вверх и вниз

    // Перемещение игрока с помощью "руки"
    if (isDragging) {
        player.setVelocity(-pointer.velocity.x * 10, -pointer.velocity.y * 10);
        
        if (distance > maxHandDistance) {
            const angle = Phaser.Math.Angle.Between(hand.x, hand.y, player.x, player.y);
            player.x = hand.x + Math.cos(angle) * maxHandDistance;
            player.y = hand.y + Math.sin(angle) * maxHandDistance;
        }
    } else {
        // Рука плавно двигается к курсору
        if (distanceHandMouse < maxHandDistance) {
            hand.x += (pointer.worldX - hand.x) * 0.1;
            hand.y += (pointer.worldY - hand.y) * 0.1;
        }
        if (distanceHandMouse >= maxHandDistance) {
            const angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.worldX, pointer.worldY);
            hand.x = player.x + Math.cos(angle) * (maxHandDistance);
            hand.y = player.y + Math.sin(angle) * (maxHandDistance);
        }


        player.setVelocity(0, 0);
    }
}
