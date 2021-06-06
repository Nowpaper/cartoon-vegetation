
import { _decorator, Component, Node, Vec3 } from 'cc';
import { Actor } from './Actor';
import { AnimationInfo } from './AnimationInfo';
const { ccclass, property } = _decorator;

@ccclass('Zombie')
export class Zombie extends Actor {

    private searchDistance = 10;
    targetSpeed = new Vec3;
    speed = new Vec3;
    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        if (this.lockTarget) {
            this.node.lookAt(this.lockTarget.position);
        }
        this.searchEnemy();
        let speedAmount = this.moveSpeed;
        let targetRotationRad = this.node.eulerAngles.y;
        let speed = new Vec3;
        if (this._currentAnim?.name == "Walking") {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = speedAmount * Math.cos(targetRotationRad);
            Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);
        } else if (this._currentAnim?.name == "Idle") {
            speed.x = speed.z = 0;
        }

        this.rigidBody!.setLinearVelocity(speed);
    }
    private lockTarget: Node | null = null;
    searchEnemy() {
        // 如果锁定目标存在，则看是否离开范围
        if (this.lockTarget) {
            const v = this.lockTarget.position.subtract(this.node.position);
            if (v.length() > this.searchDistance) {
                this.lockTarget = null;
                this.play(new AnimationInfo('Idle'));
            }
        }
        if (this.node.parent && !this.lockTarget) {
            for (let actor of this.node.parent.children) {
                if (actor == this.node) continue;
                if (actor.getComponent(Actor)?.actorGroup != this.actorGroup) {
                    const v = actor.position.subtract(this.node.position);
                    if (v.length() < this.searchDistance) {
                        this.lockTarget = actor;
                        this.play(new AnimationInfo('Transition', -1, ["Idle"], 'Walking'));
                        console.log("search target", actor);
                        break;
                    }
                }
            }
        }
    }
}
