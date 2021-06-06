
export class AnimationInfo {
    name: string = "";
    cooldown: number = -1;
    constructor(name: string, cd: number = -1, exclude: string[] = [], finishedTo: string = '') {
        this.name = name;
        this.cooldown = cd;
        this.exclude = exclude;
        this.finishedTo = finishedTo;
    }
    /** 不能打断此动作的列表 */
    exclude: string[];
    finishedTo: string = '';
}