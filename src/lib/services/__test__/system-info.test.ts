import { vi, describe, it } from "vitest";
import path from "path";

vi.mock('@/config', () => ({
    APPLICATION_DATA_PATH: path.join(__dirname, "..", "..", "..", "..", "data"),
}));
const { systemInfoService } = await import("../system-info-service");
describe("system-info-service", () => {
    it("Get current load.", async () => {
        const currentLoad = await systemInfoService.getCurrentLoad();
        console.log("System current load:", currentLoad);
    });

    it("Get mounted directory storage status.", async () => {
        const fsInfo = await systemInfoService.getMountedDirectoryStorageStatus();
        console.log("Mounted Directory Storage Status:", fsInfo);
    })

});