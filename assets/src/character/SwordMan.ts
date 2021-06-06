
import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody, ColliderComponent, ICollisionEvent, BoxCollider, sys, systemEvent, SystemEventType, EventKeyboard, macro } from 'cc';
import input from '../utils/input';
import { JoyStick } from '../utils/joy-stick';
import OrbitCamera from '../utils/orbit-camera';
import { Actor } from './Actor';
import { AnimationInfo } from './AnimationInfo';
const { ccclass, property, type } = _decorator;
let tempVec3 = new Vec3;
@ccclass('SwordMan')
export class SwordMan extends Actor {

    @type(RigidBody)
    rigidBody: RigidBody | null = null;

    @type(OrbitCamera)
    orbitCamera: OrbitCamera | null = null;

    speed = new Vec3;
    targetSpeed = new Vec3;

    rotation = 0;
    targetRotation = 0;


    _currentCollider: ColliderComponent | null = null;


    @type(JoyStick)
    joyStick: JoyStick | null = null;

    start() {
        super.start();
        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        if (!sys.isMobile && this.joyStick) {
            this.joyStick = null;
        }

        if (this.joyStick) {
            this.joyStick.node.on(Node.EventType.TOUCH_START, this.onJoyStickTouchStart, this);
        }
    }
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.up:
            case macro.KEY.w:
            case macro.KEY.down:
            case macro.KEY.s: {
                if (this.orbitCamera) {
                    // this.orbitCamera.resetTargetRotation()
                }
                break;
            }
        }
    }
    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.down:
            case macro.KEY.s:
                this.targetRotation += 180;
                break;
        }
    }
    onJoyStickTouchStart() {
        if (this.orbitCamera) {
            // this.orbitCamera.resetTargetRotation()
        }
    }
    update(deltaTime: number) {
        // Your update function goes here.

        let moving = false;
        let speed = this.speed;
        let speedAmount = this.moveSpeed;
        if (input.key.shift) {
            speedAmount = this.runSpeed;
        } else if (this.joyStick) {
            speedAmount = this.moveSpeed + (this.runSpeed * 0.8 - this.moveSpeed) * this.joyStick.magnitude;
        }

        this.targetSpeed.x = this.targetSpeed.z = 0;

        if (input.key.left) {
            this.targetRotation += 180 * deltaTime;
        }
        else if (input.key.right) {
            this.targetRotation -= 180 * deltaTime;
        }
        else if (this.joyStick) {
            // keep joystrick angle is relative to current camera view angle
            this.targetRotation = this.joyStick.rotation + this.orbitCamera!.targetRotation.y;
        }

        let targetRotationRad = this.targetRotation * Math.PI / 180;
        if (input.key.up || (this.joyStick && this.joyStick.magnitude > 0)) {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = speedAmount * Math.cos(targetRotationRad);
            moving = true;
        }

        let reverseRotation = 0;
        if (input.key.down) {
            this.targetSpeed.x = -speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = -speedAmount * Math.cos(targetRotationRad);
            moving = true;
            reverseRotation = 180;
        }
        moving = moving && !this._attacking;
        Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);

        /** 使用Jumping作为攻击键 */
        if (input.key.space || (this.joyStick && this.joyStick.jump)) {
            this.attack();
        }

        if (moving) {
            this._IdleTimer = 0;
            this.play(new AnimationInfo('Run'));
        }
        else {
            speed.x = speed.z = 0;
            this.play(new AnimationInfo('Idle'));
        }
        if(!this._attacking){
            if (this.joyStick) {
                this.rotation = this.targetRotation + reverseRotation;
            }
            else {
                this.rotation = lerp(this.rotation, this.targetRotation + reverseRotation, deltaTime * 5);
            }
        }
        this.rigidBody!.getLinearVelocity(tempVec3);
        speed.y = tempVec3.y;
        this.rigidBody!.setLinearVelocity(speed);


        this.animation!.node.eulerAngles = tempVec3.set(0, this.rotation, 0);
        super.update(deltaTime);
    }
    protected attack(){
        const aniName = this._currentAnim?.name;
        if(aniName == 'Idle'|| aniName == 'Idle1'){
            const ex = ['Idle','Idle1','Run'];
            const anim = new AnimationInfo('Attack1',4,ex,'Idle');
            if(this._animQuque.length > 0){
                if(this._animQuque[0].name === 'Attack1'){
                    anim.name = 'Attack2';
                }else if(this._animQuque[0].name === 'Attack2'){
                    anim.name = 'Attack3';
                }
            }
            this._attacking = true;
            this.play(anim);
        }
    }
}