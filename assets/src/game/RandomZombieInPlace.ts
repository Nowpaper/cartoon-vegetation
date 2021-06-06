
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RandomZombieInPlace')
export class RandomZombieInPlace extends Component {
    @property(Prefab)
    zombie: Prefab | null = null;
    @property
    sum: number = 3;
    @property(Node)
    plane: Node | null = null;
    @property(Node)
    actorsLayer: Node | null = null;
    start() {
        if (!this.actorsLayer) {
            this.actorsLayer = this.node;
        }
        let plane = this.plane;
        if (!plane) {
            plane = this.actorsLayer;
        }
        for (let i = 0; i < this.sum; i++) {
            const zombie = <any>instantiate(this.zombie) as Node;
            zombie.setPosition(
                plane.position.x + (0.5 - Math.random()) * plane.getScale().x * 10,
                zombie.position.y,
                plane.position.z + (0.5 - Math.random()) * plane.getScale().z * 10);
            this.actorsLayer.addChild(zombie);
            zombie.setRotationFromEuler(0, Math.random() * 360, 0);
        }
        if (this.plane) {
            this.plane.destroy();
        }
    }

}
