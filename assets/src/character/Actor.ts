
import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody, ColliderComponent, ICollisionEvent, BoxCollider, sys, systemEvent, SystemEventType, EventKeyboard, macro } from 'cc';
import { AnimationInfo } from './AnimationInfo';

const { ccclass, property, type } = _decorator;

@ccclass('Actor')
export class Actor extends Component {
    @property
    moveSpeed = 10;

    @property
    runSpeed = 20;

    @type(Animation)
    animation: Animation | null = null;

    _currentAnim: AnimationInfo | null = null;
    start() {
        this.animation!.on(AnimationComponent.EventType.FINISHED, this.onAnimationFinished.bind(this))
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
        if (this._animQuque.length > 0) {
            this._animQuque[0].cooldown -= deltaTime;
            if (this._animQuque[0].cooldown <= 0) {
                this._animQuque.splice(0, 1);
            }
        }
    }

    play(info: AnimationInfo) {
        if (!this.animation) {
            return;
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
            this._animQuque.push(info);
        }
    }
    onAnimationFinished(type, state) {
        if (state.name == this._currentAnim?.name) {
            if (this._currentAnim && this._currentAnim.finishedTo != '') {
                this._currentAnim.exclude = [];
                this._attacking = false;
                this.play(new AnimationInfo(this._currentAnim.finishedTo));
            }
        }
    }
    protected _IdleTimer = 7;
    /** 一个动画队列 */
    protected _animQuque:AnimationInfo[] = [];
    protected attack(){
        this._attacking = true;
    }
    protected _attacking = false;
}