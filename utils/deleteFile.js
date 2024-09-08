import fs from 'fs';
import path from 'path';

export const deleteFile = (filePath) => {
    const fullPath = path.resolve(filePath)
    fs.unlinkSync(fullPath)
}