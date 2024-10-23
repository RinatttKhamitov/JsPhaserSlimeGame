export default class Sword {
    constructor(scene, player, hand) {
        this.scene = scene;
        this.player = player;
        this.hand = hand;
        
        this.lagFactor = 0.1; // Фактор "запаздывания" меча, чем больше, тем сильнее задержка
        this.currentAngle = 0; // Текущий угол меча
        this.sword = scene.physics.add.image(this.hand.x, this.hand.y, 'sword').setDisplaySize(100, 20);
        this.sword.setOrigin(0.1, 0.5); // Точка вращения у основания меча
    }

    update() {

        // Определяем угол между игроком и рукой
        const targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.hand.x, this.hand.y);

        this.sword.x = this.hand.x - Math.cos(targetAngle) * 20;
        this.sword.y = this.hand.y - Math.sin(targetAngle) * 20;

        // Плавное интерполирование текущего угла к целевому углу
        this.currentAngle = Phaser.Math.Angle.RotateTo(this.currentAngle, targetAngle, this.lagFactor);

        // Применяем текущий угол к мечу
        this.sword.rotation = this.currentAngle;
    }
}
