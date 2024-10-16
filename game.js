const config = {
    type: Phaser.AUTO,
    width: 1200, //  
    height: 900,  
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
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
let floor;
let mousePosClick = null; // Место, где был зафиксирован клик
let isDragging = false; // Флаг, показывающий, зажата ли ЛКМ
const maxHandDistance = 150; // Максимальное расстояние для руки

// Переменные для отслеживания скорости мыши
let prevMousePos = { x: 0, y: 0 }; // Предыдущее положение мыши
let mouseVelocity = { x: 0, y: 0 }; // Скорость мыши

function preload() {
    // Загружаем изображения для игрока, руки и пола
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
    this.load.image('hand', 'https://labs.phaser.io/assets/sprites/hand.png');
    this.load.image('floor', 'https://labs.phaser.io/assets/skies/gradient16.png'); // Пол (фон)
}

function create() {
    // Создаем пол (сцену)
    floor = this.add.tileSprite(0, 0, 2000, 2000, 'floor'); // Увеличиваем размер пола
    floor.setOrigin(0.5, 0.5); // Центрируем пол по его координатам

    // Включаем расширенную границу для камеры (размер сцены больше экрана)
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // Создаем игрока (тело персонажа)
    player = this.physics.add.image(400, 300, 'player').setDisplaySize(50, 50);
    player.setCollideWorldBounds(false); // Убираем ограничение по стенам

    // Создаем руку
    hand = this.physics.add.image(400, 300, 'hand').setDisplaySize(20, 20);
    hand.setCollideWorldBounds(false); // Убираем ограничение по стенам

    // Настраиваем камеру, чтобы она следила за игроком
    this.cameras.main.startFollow(player);

    // Событие нажатия ЛКМ
    this.input.on('pointerdown', (pointer) => {
        if (!isDragging && pointer.leftButtonDown()) {
            // Запоминаем позицию клика, чтобы не обновлять её при удержании
            mousePosClick = { x: pointer.worldX, y: pointer.worldY };
            isDragging = true; // Фиксируем руку, когда ЛКМ нажата
        }
    });

    // Событие отпускания ЛКМ
    this.input.on('pointerup', (pointer) => {
        if (isDragging) {
            isDragging = false; // Отключаем фиксирование руки при отпускании ЛКМ
        }
    });
}

function update() {
    // Получаем текущее положение курсора
    const pointer = this.input.activePointer;

    // Вычисляем расстояние от игрока до руки
    const distance = Phaser.Math.Distance.Between(player.x, player.y, hand.x, hand.y);

    // Если ЛКМ нажата, персонаж подтягивается к месту клика (рука фиксируется)
    if (isDragging && mousePosClick) {
        // Движение персонажа с использованием скорости курсора
        player.setVelocity(-pointer.velocity.x * 10, -pointer.velocity.y * 10); // Используем скорость указателя

        if (distance > maxHandDistance) {                    
            // Если игрок выходит за пределы допустимого расстояния, ограничиваем его движение
            const angle = Phaser.Math.Angle.Between(hand.x, hand.y, player.x, player.y);

            // Ограничиваем перемещение тела в пределах максимального расстояния
            player.x = hand.x + Math.cos(angle) * maxHandDistance;
            player.y = hand.y + Math.sin(angle) * maxHandDistance;
        }
    } else {
        // Если ЛКМ не зажата, рука должна стремиться к курсору с ограничением по расстоянию
        if (distance < maxHandDistance) {
            // Если рука в пределах допустимого расстояния, двигаем её к курсору
            hand.x += (pointer.worldX - hand.x) * 0.1; // Плавное движение руки
            hand.y += (pointer.worldY - hand.y) * 0.1;
        } else {
            // Если рука выходит за пределы допустимого расстояния, останавливаем её
            const angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.worldX, pointer.worldY);

            // Ограничиваем перемещение руки границей максимального расстояния
            hand.x = player.x + Math.cos(angle) * maxHandDistance;
            hand.y = player.y + Math.sin(angle) * maxHandDistance;
        }

        // Останавливаем движение тела, если ЛКМ не зажата
        player.setVelocity(0, 0);
    }

    // Обновляем фон пола (чтобы пол двигался с игроком и заполнял экран)
}
