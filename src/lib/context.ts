import os from 'os';
import path from 'path';
import fs from 'fs';

export function getSystemContext(): string {
    const cwd = process.cwd();
    const platform = os.platform();
    const release = os.release();
    const homedir = os.homedir();
    const shell = process.env.SHELL || (platform === 'win32' ? 'cmd.exe' : '/bin/bash');

    // Baca ingatan saat ini dari file
    const memoryPath = path.join(homedir, '.voidex-cli', 'memory.md');
    let memory = 'No specific memories yet.';
    if (fs.existsSync(memoryPath)) {
        try {
            memory = fs.readFileSync(memoryPath, 'utf-8');
        } catch (e) { }
    }

    // KONTEKS UTAMA & INSTRUKSI MEMORI
    return `OS: ${platform} ${release}
Home: ${homedir}
CWD: ${cwd}
Shell: ${shell}
Date: ${new Date().toLocaleString()}

[SOVEREIGN LONG-TERM MEMORY]
The following list contains facts you have learned about the user in the past:
${memory}

[INSTRUCTIONS]
1. You are running in a sovereign CLI environment.
2. You have access to the file system at '${cwd}'.
3. **MEMORY MANAGEMENT**: If the user asks you to REMEMBER something (e.g. "My name is Void"), you MUST save it.
   - To save a memory, start your response with the tag: "MEMORY_SAVE: <fact>"
   - Example: "MEMORY_SAVE: User's name is Void."
   - Do not use this tag unless explicitly storing information.`.trim();
}