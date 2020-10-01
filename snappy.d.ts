export function compress(input: string | Buffer, callback: (err: Error, buffer?: Buffer) => void): void;
export function compressSync(input: string | Buffer): Buffer;

export var isValidCompressed: (buffer: Buffer, callback: (err: Error | null, isValid?: boolean) => void) => void;
export var isValidCompressedSync: (buffer: Buffer) => boolean;

export function uncompress(compressed: Buffer, callback: (err: Error, uncompressed?: Buffer) => void): void;
export function uncompress(compressed: Buffer, opts: {asBuffer: false}, callback: (err: Error, uncompressed?: string) => void): void;
export function uncompress(compressed: Buffer, opts: {asBuffer: true}, callback: (err: Error, uncompressed?: Buffer) => void): void;

export function uncompressSync(compressed: Buffer): Buffer;
export function uncompressSync(compressed: Buffer, opts: {asBuffer: false} ): string;
export function uncompressSync(compressed: Buffer, opts: {asBuffer: true} ): Buffer;
