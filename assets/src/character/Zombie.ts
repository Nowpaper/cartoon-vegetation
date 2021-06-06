
import { _decorator, Component, Node, Vec3, math } from 'cc';
import { Actor } from './Actor';
import { AnimationInfo } from './AnimationInfo';
const { ccclass, property } = _decorator;

@ccclass('Zombie')
export class Zombie extends Actor {
    @property
    searchDistance = 10;
    // @property
    HP: number = 3;
    targetSpeed = new Vec3;
    speed = new Vec3;
    start() {
        super.start();
        this.play('Idle');
    }
    reviveTime = 0;
    update(deltaTime: number) {
        super.update(deltaTime);
        if (this.HP <= 0) {
            this.reviveTime -= deltaTime;
            if (this.reviveTime <= 0) {
                this.HP = Math.random() * 3 + 3;
                this.play(new AnimationInfo("StandUp", -1, [], 'Idle'));
            }
            return;
        }

        const curAnimName = this._currentAnim ? this._currentAnim.name : "";
        if(curAnimName == "StandUp"){
            return;
        }
        if (this.lockTarget) {
            this.node.lookAt(this.lockTarget.position);
            this.node.setRotationFromEuler(0, this.node.eulerAngles.y - 180, 0);
        }
        let speedAmount = this.moveSpeed;
        let targetRotationRad = this.node.eulerAngles.y;
        let speed = new Vec3;
        if (curAnimName == "Walking" && !this._attacking && !this._beating) {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = speedAmount * Math.cos(targetRotationRad);
            Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);

        } else if (curAnimName == "Idle") {
            speed.x = speed.z = 0;
        }
        if (this._stopSearchArray.indexOf(curAnimName) < 0) {
            this.searchEnemy();
        }

        this.rigidBody!.setLinearVelocity(speed);
    }
    private _stopSearchArray = ["ReactionHit", "Transition", "StandUp"];
    private lockTarget: Node | null = null;
    protected searchEnemy() {
        // 如果锁定目标存在，则看是否离开范围
        if (this.lockTarget) {
            const v = this.lockTarget.position.clone().subtract(this.node.position);
            const len = v.length();
            if (v.length() > this.searchDistance) {
                this.lockTarget = null;
                this.play('Idle');
            } else if (len < 1) {
                this.attack();
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
    protected attack() {
        if (this._attacking || this._beating) { return; }
        super.attack();
        let attname = math.random() < 0.5 ? 'Attack' : 'Punching';
        let delay = 0.5;
        if (Math.random() < 0.5) {
            attname = 'Attack';
            delay = 1;
        } else {
            attname = 'Punching';
            delay = 1.2;
        }
        this.play(new AnimationInfo(attname, -1, [], 'Walking'));
        this.scheduleOnce(() => {
            this.checkHit();
        }, delay);
    }
    protected beaten() {
        super.beaten();
        this.HP -= 1;
        if (this.HP > 0) {
            this.play(new AnimationInfo("ReactionHit", -1, [], 'Walking'));
        } else {
            this.play("Death");
            this.reviveTime = 5 + Math.random() * 5;
            this.lockTarget = null;
        }

    }

}
