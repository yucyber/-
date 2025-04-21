const axios = require('axios');

// 测试用户登录
async function testLogin() {
    try {
        console.log('测试用户登录...');
        const response = await axios.post('http://localhost:3002/api/login', {
            email: "test@example.com",
            cypher: "test123456",
            account: "testuser",
            password: "test123456"
        });
        console.log('登录响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('登录错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 测试用户注册
async function testRegister() {
    try {
        console.log('测试用户注册...');
        const response = await axios.post('http://localhost:3002/api/register', {
            email: "test@example.com",
            cypher: "test123456",
            account: "testuser",
            password: "test123456",
            identity: true
        });
        console.log('注册响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('注册错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 测试创建试卷
async function testCreatePaper(session) {
    try {
        console.log('测试创建试卷...');
        const paperName = `测试试卷_${Date.now()}`;
        const response = await axios.post('http://localhost:3002/api/paper/add', {
            values: {
                paper: paperName,
                paperDescription: "这是一个测试试卷",
                candidate: ["test@example.com"],
                check: true,
                timeBegin: new Date().toISOString(),
                timeEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                answerTime: 60
            },
            cookie: session
        });
        console.log('创建试卷响应:', response.data);
        return { data: response.data, paperName };
    } catch (error) {
        console.error('创建试卷错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 测试添加题目
async function testAddTest(session, paperName) {
    try {
        console.log('测试添加题目...');
        const response = await axios.post('http://localhost:3002/api/test/add', {
            paper: paperName,
            data: [{
                test_name: "测试题目",
                test: "这是一个测试题目",
                answer: "标准答案",
                tags: ["编程"],
                level: "easy",
                point: 20
            }],
            cookie: session
        });
        console.log('添加题目响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('添加题目错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 测试显示试卷
async function testShowPaper(session, paperName) {
    try {
        console.log('测试显示试卷...');
        const response = await axios.post('http://localhost:3002/api/paper/show', {
            paper: paperName,
            cookie: session
        });
        console.log('显示试卷响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('显示试卷错误:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 运行所有测试
async function runTests() {
    try {
        console.log('开始测试...');

        // 先注册用户
        await testRegister();

        // 登录获取session
        const loginResponse = await testLogin();
        const session = loginResponse.data.session;

        // 创建试卷
        const createPaperResponse = await testCreatePaper(session);
        const paperName = createPaperResponse.paperName;

        // 添加题目
        await testAddTest(session, paperName);

        // 显示试卷
        await testShowPaper(session, paperName);

        console.log('所有测试完成！');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

runTests(); 