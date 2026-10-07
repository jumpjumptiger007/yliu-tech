export function takeSampleBlocks(previous, input, blockSize = 512) {
    const combined = new Int16Array(previous.length + input.length);
    combined.set(previous);
    combined.set(input, previous.length);
    const alignedLength = Math.floor(combined.length / blockSize) * blockSize;
    const blocks = [];
    for (let offset = 0; offset < alignedLength; offset += blockSize)
        blocks.push(combined.slice(offset, offset + blockSize));
    return { blocks, remainder: combined.slice(alignedLength) };
}
