import path from "path";
import { exec } from "child_process";

describe("integration tests", () => {
  class CliTestRunner {
    constructor(public fileName: string) {
      return this;
    }

    async runWith(
      args: string[]
    ): Promise<{ code: number; error: any; stdout: any; stderr: string }> {
      return new Promise((resolve) => {
        exec(
          `npx ts-node ${path.resolve(this.fileName)} ${args.join(" ")}`,
          {},
          (error, stdout, stderr) => {
            resolve({
              code: error && error.code ? error.code : 0,
              error,
              stdout,
              stderr,
            });
          }
        );
      });
    }
  }

  const imustCommand = new CliTestRunner("./src/index.ts");

  it("should print hello world when [hello world] is passsed", async () => {
    const result = await imustCommand.runWith(["hello", "world"]);

    expect(result.stdout).toContain("Hello World...");
    expect(result.code).toBe(0);
  });
});
