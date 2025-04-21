const axios = require('axios');

// 创建一个带有 cookie 支持的 axios 实例
const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    baseURL: 'http://localhost:3001'
});

// 存储cookie的变量
let sessionCookie = '';

// 拦截响应，保存cookie
axiosInstance.interceptors.response.use(response => {
    const cookies = response.headers['set-cookie'];
    if (cookies) {
        sessionCookie = cookies[0].split(';')[0];
        // 将cookie添加到后续请求中
        axiosInstance.defaults.headers.Cookie = sessionCookie;
    }
    return response;
}, error => {
    console.log('请求错误:', error.message);
    if (error.response) {
        console.log('错误状态码:', error.response.status);
        console.log('错误数据:', error.response.data);
        console.log('错误头信息:', error.response.headers);
    }
    if (error.request) {
        console.log('请求信息:', error.request);
    }
    if (error.config) {
        console.log('请求配置:', {
            url: error.config.url,
            method: error.config.method,
            data: error.config.data
        });
    }
    return Promise.reject(error);
});

async function testRegister() {
    try {
        console.log('测试注册...');
        console.log('发送注册请求:', {
            email: 'test2@example.com',
            cypher: 'testpassword',
            identity: true,
            captcha: '123456'
        });
        const response = await axiosInstance.post('/api/register', {
            email: 'test2@example.com',
            cypher: 'testpassword',
            identity: true,
            captcha: '123456'
        });
        console.log('注册结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('注册出错:', error.message);
        return null;
    }
}

async function testLogin() {
    try {
        console.log('测试登录...');
        console.log('发送登录请求:', {
            email: 'test2@example.com',
            cypher: 'testpassword'
        });
        const response = await axiosInstance.post('/api/login', {
            email: 'test2@example.com',
            cypher: 'testpassword'
        });
        console.log('登录结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('登录出错:', error.message);
        return null;
    }
}

async function testAddPaper() {
    try {
        console.log('测试添加试卷...');
        const response = await axiosInstance.post('/api/paper/add', {
            paper_name: '测试试卷1',
            description: '这是一个测试试卷',
            time_limit: 120,  // 120分钟
            total_score: 100
        });
        console.log('添加试卷结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('添加试卷出错:', error.message);
        if (error.response) {
            console.log('错误状态码:', error.response.status);
            console.log('错误数据:', error.response.data);
        }
        return null;
    }
}

async function testShowPaper() {
    try {
        console.log('测试显示试卷列表...');
        const response = await axiosInstance.post('/api/paper/show');
        console.log('显示试卷结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('显示试卷出错:', error.message);
        if (error.response) {
            console.log('错误状态码:', error.response.status);
            console.log('错误数据:', error.response.data);
        }
        return null;
    }
}

async function testModifyPaper(paperId) {
    try {
        console.log('测试修改试卷...');
        const response = await axiosInstance.post('/api/paper/modify', {
            key: paperId,
            paper_name: '修改后的试卷1',
            description: '这是修改后的测试试卷',
            time_limit: 90,  // 修改为90分钟
            total_score: 100
        });
        console.log('修改试卷结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('修改试卷出错:', error.message);
        if (error.response) {
            console.log('错误状态码:', error.response.status);
            console.log('错误数据:', error.response.data);
        }
        return null;
    }
}

async function testDeletePaper(paperId) {
    try {
        console.log('测试删除试卷...');
        const response = await axiosInstance.post('/api/paper/delete', {
            key: paperId
        });
        console.log('删除试卷结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('删除试卷出错:', error.message);
        if (error.response) {
            console.log('错误状态码:', error.response.status);
            console.log('错误数据:', error.response.data);
        }
        return null;
    }
}

async function runTests() {
    console.log('开始测试流程...');

    // 1. 注册用户
    const registerResult = await testRegister();
    if (!registerResult || registerResult.code !== 200) {
        console.log('注册失败，无法继续测试');
        return;
    }

    // 2. 登录
    const loginResult = await testLogin();
    if (!loginResult || loginResult.code !== 200 || !loginResult.data.isLogin) {
        console.log('登录失败，无法继续测试');
        return;
    }

    console.log('开始测试试卷功能...');

    // 3. 显示当前试卷列表
    await testShowPaper();

    // 4. 添加一个新试卷
    const addResult = await testAddPaper();
    let paperId = addResult?.data?.key;

    if (paperId) {
        // 5. 再次显示试卷列表，查看是否添加成功
        await testShowPaper();

        // 6. 修改刚添加的试卷
        await testModifyPaper(paperId);

        // 7. 显示修改后的试卷列表
        await testShowPaper();

        // 8. 最后删除测试用的试卷
        await testDeletePaper(paperId);

        // 9. 确认删除成功
        await testShowPaper();
    }
}

runTests(); 