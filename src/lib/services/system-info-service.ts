import si from "systeminformation";
import path from 'path';
import { CMS_DATA_PATH } from "@/settings";


class SystemInfoService {
    async getMountedDirectoryStorageStatus(targetPath = CMS_DATA_PATH || "/") {
        const resolved = path.resolve(targetPath);
        const root = path.parse(resolved).root; // Windows -> 'C:\\', POSIX -> '/'
        const list = await si.fsSize(); // [{ fs, type, size, used, use, mount }, ... ]

        // first try exact / prefix matches (platform aware)
        let entry = list.find((f) => {
            if (!f.mount) return false;
            if (process.platform === 'win32') {
                const m = f.mount.replace(/\\/g, '/').toLowerCase();
                const r = root.replace(/\\/g, '/').toLowerCase();
                return m === r || r.startsWith(m);
            } else {
                return resolved.startsWith(f.mount);
            }
        });

        // fallback: choose mount with longest matching prefix
        if (!entry) {
            entry = list
                .filter((f) => f.mount && resolved.startsWith(f.mount))
                .sort((a, b) => (b.mount?.length || 0) - (a.mount?.length || 0))[0];
        }

        if (!entry) {
            throw new Error(`No filesystem entry found for path: ${targetPath}`);
        }
        //MB
        const total = entry.size;
        const used = entry.used
        const free = total - used;
        return {
            fs: entry.fs,
            mount: entry.mount,
            total,
            used,
            free,
            usedPercent: entry.use,
        };
    }

    async getCurrentLoad() {
        return si.currentLoad();
    }

    async getMemoryInfo() {
        return si.mem();
    }
}


export const systemInfoService = new SystemInfoService();