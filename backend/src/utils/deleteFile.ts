import { promises as fs } from 'fs';

export async function deleteFile(filePath: string | undefined): Promise<void> {
    if (!filePath) return;
    
    try {
        await fs.unlink(filePath);
    } catch { /* empty */ }
}