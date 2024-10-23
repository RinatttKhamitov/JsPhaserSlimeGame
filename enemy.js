export default class Enemy {
    constructor(scene, x, y) {
        // Создаем врага как физический объект
        this.scene = scene;
        this.enemy = scene.physics.add.image(x, y, 'enemy').setDisplaySize(40, 40);

        // Устанавливаем физику для врага
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setVelocity(0, 0);
    }

    // Метод для обновления поведения врага
    update(player) {
        const playerX = player.x;
        const playerY = player.y;

        // Логика движения врага к игроку
        const angle = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, playerX, playerY);

        const speed = 100; // Скорость врага
        this.enemy.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
}
