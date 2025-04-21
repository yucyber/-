import { Context } from 'koa';
import { getManager, getConnection } from "typeorm";
import { User } from '../../entity/User';
import { Test } from '../../entity/Test';
import responseClass from '../../config/responseClass';
import { exec, ExecException, spawn, execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const readFileAsync = promisify(fs.readFile);

interface RunCodeRequest {
    code: string;
    language: string;
    testKey: number;
    cookie: string;
}

// 定义具有stderr属性的错误类型
interface ExecError extends Error {
    stderr?: string;
    stdout?: string;
    code?: number;
    signal?: string;
}

export default async (ctx: Context) => {
    try {
        const { code, language, testKey, cookie } = ctx.request.body as RunCodeRequest;
        console.log('运行代码请求:', { language, testKey, cookie: cookie?.substring(0, 5) + '...' });

        // 验证用户登录状态
        const userRepository = getConnection().getRepository(User);
        const user = await userRepository.findOne({ where: { session: cookie } });

        if (!user) {
            console.log('用户未登录');
            ctx.status = 401;
            ctx.body = new responseClass(401, '请先登录', { status: false });
            return;
        }

        console.log('用户已验证:', { email: user.email });

        // 验证测试题目是否存在
        const testRepository = getConnection().getRepository(Test);
        const test = await testRepository.findOne({ where: { key: testKey } });

        if (!test) {
            console.log('题目不存在:', { testKey });
            ctx.status = 404;
            ctx.body = new responseClass(404, '题目不存在', { status: false });
            return;
        }

        console.log('题目已找到:', { testName: test.test_name });

        // 创建临时目录来存储代码文件
        const tempDir = path.join(__dirname, '../../../temp', Date.now().toString());
        const fileName = `Main`;  // 改为固定的 Main 类名
        const filePath = path.join(tempDir, `${fileName}.java`);

        try {
            // 确保临时目录存在
            if (!(await existsAsync(path.join(__dirname, '../../../temp')))) {
                await mkdirAsync(path.join(__dirname, '../../../temp'), { recursive: true });
            }
            await mkdirAsync(tempDir, { recursive: true });
            console.log('临时目录创建成功:', { tempDir });

            // 写入代码文件
            await writeFileAsync(filePath, code);
            console.log('代码文件已写入:', { filePath });

            // 检查Java是否安装
            try {
                const javaVersionResult = await execAsync('java -version');
                console.log('Java已安装:', javaVersionResult.stderr); // java -version输出在stderr
            } catch (error) {
                const err = error as ExecError;
                console.error('Java未安装或无法访问:', err);
                ctx.status = 500;
                ctx.body = new responseClass(500, 'Java未安装或无法访问', {
                    status: false,
                    error: "服务器未安装Java或Java路径配置错误"
                });
                return;
            }

            // 修改代码确保类名为Main
            let codeContent = await readFileAsync(filePath, 'utf8');
            const classNameMatch = codeContent.match(/public\s+class\s+(\w+)/);

            if (classNameMatch && classNameMatch[1] !== 'Main') {
                const className = classNameMatch[1];
                console.log(`检测到类名为 ${className}，将替换为 Main`);
                codeContent = codeContent.replace(/public\s+class\s+(\w+)/, 'public class Main');
                await writeFileAsync(filePath, codeContent);
            }

            // 编译Java代码
            console.log('开始编译Java代码');
            try {
                // 使用javac编译Java文件
                const javacProcess = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
                    const javacProc = spawn('javac', [filePath], {
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        shell: true
                    });

                    let stdout = '';
                    let stderr = '';

                    javacProc.stdout?.on('data', (data) => {
                        stdout += data.toString();
                    });

                    javacProc.stderr?.on('data', (data) => {
                        stderr += data.toString();
                    });

                    javacProc.on('close', (code) => {
                        if (code === 0) {
                            resolve({ stdout, stderr });
                        } else {
                            reject(new Error(`编译失败，退出码: ${code}\n${stderr}`));
                        }
                    });

                    javacProc.on('error', (err) => {
                        reject(err);
                    });
                });

                // 检查.class文件是否生成
                const classFilePath = path.join(tempDir, `${fileName}.class`);
                const classFileExists = await existsAsync(classFilePath);

                if (!classFileExists) {
                    throw new Error(`编译未产生 ${fileName}.class 文件`);
                }

                console.log('编译成功，生成的文件:', fs.readdirSync(tempDir));
            } catch (error) {
                const compileError = error as Error;
                console.error('编译错误:', compileError);
                ctx.status = 400;
                ctx.body = new responseClass(400, '编译错误', {
                    status: false,
                    error: compileError.message || String(compileError),
                    results: [{
                        status: 'error',
                        error: compileError.message || String(compileError),
                        input: [],
                        expected: [],
                        actual: null
                    }]
                });
                return;
            }

            // 运行所有测试用例
            const results = [];
            const testCases = test.testCases || [{
                input: ["1", "1"],
                output: ["2"]  // 默认期望输出
            }];
            console.log(`开始运行${testCases.length}个测试用例`);

            for (const testCase of testCases) {
                try {
                    // 准备输入数据
                    const inputData = testCase.input.join('\n');

                    // 运行Java程序
                    console.log('运行Java代码，输入数据:', inputData);

                    // 使用spawn运行Java程序
                    const javaResult = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
                        // 使用绝对路径
                        const classDir = path.resolve(tempDir);

                        // 在Windows上使用不同的CLASSPATH设置方式
                        const classPathOption = os.platform() === 'win32'
                            ? { env: { ...process.env, CLASSPATH: classDir } }
                            : { env: { ...process.env, CLASSPATH: '.' } };

                        console.log('执行环境:', {
                            classDir,
                            platform: os.platform(),
                            classPathOption
                        });

                        // 启动Java进程
                        const javaProc = spawn('java', ['Main'], {
                            cwd: classDir,
                            stdio: 'pipe',
                            shell: true,
                            env: classPathOption.env
                        });

                        let stdout = '';
                        let stderr = '';

                        javaProc.stdout?.on('data', (data) => {
                            stdout += data.toString();
                        });

                        javaProc.stderr?.on('data', (data) => {
                            stderr += data.toString();
                        });

                        // 如果需要输入数据
                        if (inputData) {
                            javaProc.stdin?.write(inputData);
                            javaProc.stdin?.end();
                        }

                        javaProc.on('close', (code) => {
                            if (code === 0 || code === null) {
                                resolve({ stdout, stderr });
                            } else {
                                reject(new Error(`执行失败，退出码: ${code}\n${stderr}`));
                            }
                        });

                        javaProc.on('error', (err) => {
                            reject(err);
                        });

                        // 设置超时
                        setTimeout(() => {
                            try {
                                javaProc.kill();
                                reject(new Error('执行超时(10秒)'));
                            } catch (e) {
                                // 忽略杀死进程时的错误
                            }
                        }, 10000);
                    });

                    // 处理结果
                    const stderr = javaResult.stderr.trim();
                    const stdout = javaResult.stdout.trim();

                    if (stderr && !stderr.includes('Loaded')) { // 忽略Java的类加载信息
                        console.log('执行出错:', { stderr });
                        results.push({
                            status: 'error',
                            error: stderr,
                            input: testCase.input,
                            expected: testCase.output,
                            actual: null
                        });
                        continue;
                    }

                    // 比较输出 - 规范化比较，去除所有空白字符影响
                    const actualOutput = stdout.trim();
                    const expectedOutput = testCase.output.join('\n').trim();

                    // 清理字符串，移除所有空白字符进行比较
                    const normalizedActual = actualOutput.replace(/\s+/g, '');
                    const normalizedExpected = expectedOutput.replace(/\s+/g, '');

                    // 添加详细日志用于调试
                    console.log('比较详情:', {
                        actualOutput: actualOutput,
                        expectedOutput: expectedOutput,
                        testCaseOutput: testCase.output, // 原始测试用例输出
                        actualLength: actualOutput.length,
                        expectedLength: expectedOutput.length,
                        actualCharCodes: [...actualOutput].map(c => c.charCodeAt(0)),
                        expectedCharCodes: [...expectedOutput].map(c => c.charCodeAt(0)),
                        normalizedActual,
                        normalizedExpected
                    });

                    const passed = normalizedActual === normalizedExpected;
                    console.log('测试结果:', { passed, actualOutput, expectedOutput });

                    results.push({
                        status: passed ? 'passed' : 'failed',
                        input: testCase.input,
                        expected: testCase.output, // 保持原始的期望输出格式
                        expectedFormatted: expectedOutput, // 添加格式化后的期望输出，以便前端展示
                        actual: actualOutput,
                        details: passed ? undefined : '输出格式可能与预期不符。请检查空格、换行等格式差异。'
                    });
                } catch (error) {
                    const runError = error as Error;
                    console.error('运行时错误:', runError);

                    let errorMessage = runError.message || String(runError);

                    // 对常见错误提供更友好的提示
                    if (errorMessage.includes('找不到或无法加载主类') ||
                        errorMessage.includes('Could not find or load main class')) {
                        errorMessage = `找不到主类 ${fileName}。请确保您的代码中定义了一个名为 Main 的公共类，并且包含 public static void main 方法。`;
                    }

                    results.push({
                        status: 'error',
                        error: errorMessage,
                        input: testCase.input,
                        expected: testCase.output,
                        actual: null
                    });
                }
            }

            // 返回结果
            const allPassed = results.every(r => r.status === 'passed');
            console.log('所有测试结果汇总:', { allPassed, resultCount: results.length });
            ctx.status = 200;
            ctx.body = new responseClass(200, allPassed ? '所有测试用例通过' : '部分测试用例失败', {
                status: allPassed,
                results: results
            });

        } catch (error) {
            console.error('代码执行失败:', error);
            ctx.status = 500;
            ctx.body = new responseClass(500, '代码执行失败', {
                status: false,
                error: error instanceof Error ? error.message : String(error)
            });
        } finally {
            // 清理临时文件
            try {
                if (await existsAsync(tempDir)) {
                    // 递归删除目录
                    const deleteFolderRecursive = async (folderPath) => {
                        if (fs.existsSync(folderPath)) {
                            for (const file of fs.readdirSync(folderPath)) {
                                const curPath = path.join(folderPath, file);
                                try {
                                    if (fs.lstatSync(curPath).isDirectory()) {
                                        await deleteFolderRecursive(curPath);
                                    } else {
                                        try {
                                            fs.unlinkSync(curPath);
                                        } catch (e) {
                                            const err = e as Error;
                                            console.log(`无法删除文件 ${curPath}:`, err.message);
                                        }
                                    }
                                } catch (e) {
                                    const err = e as Error;
                                    console.log(`处理路径 ${curPath} 时出错:`, err.message);
                                }
                            }
                            try {
                                fs.rmdirSync(folderPath);
                                console.log('成功删除临时目录:', folderPath);
                            } catch (e) {
                                const err = e as Error;
                                console.log(`无法删除目录 ${folderPath}:`, err.message);
                                // 设置定时任务稍后尝试删除
                                setTimeout(() => {
                                    try {
                                        if (fs.existsSync(folderPath)) {
                                            fs.rmdirSync(folderPath);
                                            console.log('延迟删除临时目录成功:', folderPath);
                                        }
                                    } catch (err) {
                                        const error = err as Error;
                                        console.log('延迟删除临时目录失败:', error.message);
                                    }
                                }, 5000); // 5秒后尝试
                            }
                        }
                    };

                    await deleteFolderRecursive(tempDir);
                }
            } catch (e) {
                const err = e as Error;
                console.log('清理临时文件失败，但不影响继续运行:', err.message);
            }
        }

    } catch (error) {
        console.error('运行代码服务器错误:', error);
        ctx.status = 500;
        ctx.body = new responseClass(500, '服务器错误', {
            status: false,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}; 