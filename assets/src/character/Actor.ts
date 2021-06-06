
import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody, ColliderComponent, ICollisionEvent, BoxCollider, sys, systemEvent, SystemEventType, EventKeyboard, macro, math } from 'cc';
import { AnimationInfo } from './AnimationInfo';

const { ccclass, property, type } = _decorator;

@ccclass('Actor')
export class Actor extends Component {
    @type(RigidBody)
    rigidBody: RigidBody | null = null;
    @property
    actorGroup = 0;
    @property
    moveSpeed = 10;

    @property
    runSpeed = 20;

    @type(Animation)
    animation: Animation | null = null;

    _currentAnim: AnimationInfo | null = null;
    start() {
        if (!this.animation) {
            this.animation = this.node.getComponentInChildren(Animation);
        }
        if (!this.rigidBody) {
            this.rigidBody = this.node.getComponent(RigidBody);
        }
        this.animation!.on(AnimationComponent.EventType.FINISHED, this.onAnimationFinished.bind(this));
    }
    update(deltaTime: number) {
        /////////////////
        this._IdleTimer += deltaTime;
        if (this._IdleTimer >= 12) {
            this._IdleTimer = 0;
            if (this._currentAnim?.name === "Idle") {
                this.play(new AnimationInfo('Idle1', -1, ['Idle']));
            }
        }
        if (this._currentAnim) {
            this._currentAnim.cooldown -= deltaTime;
        }
        for (let i = this._animQuque.length - 1; i >= 0; i--) {
            this._animQuque[i].cooldown -= deltaTime;
            if (this._animQuque[i].cooldown <= 0) {
                this._animQuque.splice(i, 1);
            }
        }
    }

    play(anim: string | AnimationInfo) {
        if (!this.animation) {
            return;
        }
        let info: null | AnimationInfo = null;
        if (typeof anim === 'string') {
            info = new AnimationInfo(anim);
        } else {
            info = anim;
        }
        if (this._currentAnim?.name === info.name) {
            let state = this.animation.getState(info.name);
            if (state.wrapMode !== AnimationClip.WrapMode.Normal) {
                return;
            }
        }
        if (this._currentAnim && this._currentAnim.exclude.indexOf(info.name) >= 0) {
            return;
        }
        this._currentAnim = info;
        this.animation.crossFade(info.name, 0.1);
        if (info.cooldown > 0) {
            if (this._animQuque.length > 0) {
                if (this._animQuque[this._animQuque.length - 1].name != info.name) {
                    this._animQuque.push(info);
                }
            } else {
                this._animQuque.push(info);
            }
        }
    }
    onAnimationFinished(type, state) {
        if (state.name == this._currentAnim?.name) {
            if (this._currentAnim && this._currentAnim.finishedTo != '') {
                this._currentAnim.exclude = [];
                this._attacking = false;
                this._beating = false;
                this.play(this._currentAnim.finishedTo);
            } else {
                this.play("Idle")
            }
        }
    }
    protected _IdleTimer = math.random() * 5 + 3;
    /** 一个动画队列 */
    protected _animQuque: AnimationInfo[] = [];
    protected attack() {
        this._attacking = true;
    }
    protected _attacking = false;
    protected _beating = false;
    /** 被打中 */
    protected beaten() {
        this._beating = true;
    }
    protected checkHit() {
        if (this.node.parent) {
            for (let actor of this.node.parent?.children) {
                const actorSc = actor.getComponent(Actor);
                if (actorSc && actorSc.actorGroup != this.actorGroup) {
                    const v = actor.worldPosition.clone().subtract(this.node.worldPosition);
                    const len = v.length();
                    const angle = Vec3.angle(v, this.node.forward) / Math.PI * 180 - 180;
                    if (len <= 1 && 25 > Math.abs(angle)) {
                        actorSc.beaten();
                    }
                }
            }
        }
    }
}