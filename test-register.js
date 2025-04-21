const axios = require('axios');

async function testEmailVerification() {
    try {
        console.log('测试发送验证码...');
        const response = await axios.post('http://localhost:3001/api/email', {
            email: 'test@example.com',
            cypher: 'testpassword'
        });
        console.log('发送验证码结果:', response.data);
        return response.data;
    } catch (error) {
        console.log('发送验证码出错:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function testRegister(captcha) {
    try {
        console.log('测试注册功能...');
        const response = await axios.post('http://localhost:3001/api/register', {
            email: 'test@example.com',
            cypher: 'testpassword',
            captcha: captcha || '123456',
            identity: false
        });
        console.log('注册测试结果:', response.data);
    } catch (error) {
        console.log('注册测试出错:', error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    console.log('开始测试流程...');
    // 先发送验证码
    const emailResult = await testEmailVerification();
    // 等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000));
    // 然后尝试注册
    await testRegister('123456');
}

runTests(); 