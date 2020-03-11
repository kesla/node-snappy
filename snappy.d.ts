export function compress(input: string | Buffer, callback: (err: Error, buffer?: Buffer) => void): void;
export function compressSync(input: string | Buffer): Buffer;
export var isValidCompressed: (buffer: Buffer, callback: (err: Error | null, isValid?: boolean) => void) => void;
export var isValidCompressedSync: (buffer: Buffer) => boolean;
export function uncompress(compressed: Buffer, opts: any, callback: (err: Error, uncompressed?: string | Buffer) => void): void;
export function uncompressSync(compressed: Buffer, opts: any): string | Buffer;
