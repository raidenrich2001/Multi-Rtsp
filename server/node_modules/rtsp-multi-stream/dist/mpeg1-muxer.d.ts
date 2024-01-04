/// <reference types="node" />
/// <reference types="node" />
import { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
export interface MuxerOptions {
    url?: string;
    ffmpegArgs?: Record<string, string>;
    ffmpegPath?: string;
    /** weather the spawned `ffmpeg` child process should be detached or not */
    shouldDetached?: boolean;
    /** seconds to wait for rtsp connection */
    timeout?: number;
    debug?: boolean;
}
export declare class Mpeg1Muxer extends EventEmitter {
    streamProcess?: ChildProcess;
    private streamStarted;
    constructor(options?: MuxerOptions);
    stop(): void;
}
