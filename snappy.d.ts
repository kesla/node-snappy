export function compress(input: string | Buffer): Promise<Buffer>;
export function compressSync(input: string | Buffer): Buffer;
export function isValidCompressed(input: Buffer): Promise<boolean>;
export var isValidCompressedSync: (buffer: Buffer) => boolean;
export function uncompress(compressed: Buffer, opts?: any): Promise<string | Buffer>;
export function uncompressSync(compressed: Buffer, opts?: any): string | Buffer;
