const axios = require('axios');

async function testAPI() {
    try {
        // 1. 测试邮箱验证
        console.log('测试邮箱验证...');
        const emailResponse = await axios.post('http://localhost:3001/api/email', {
            email: 'test@example.com',
            cypher: ''
        });
        console.log('邮箱验证结果:', emailResponse.data);

        // 等待验证码
        console.log('请查看邮箱获取验证码...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        const captcha = '123456'; // 需要替换为实际收到的验证码

        // 2. 测试注册
        console.log('\n测试注册...');
        const registerResponse = await axios.post('http://localhost:3001/api/register', {
            email: 'test@example.com',
            cypher: '123456',
            captcha: captcha,
            identity: false
        });
        console.log('注册结果:', registerResponse.data);

        // 3. 测试登录
        console.log('\n测试登录...');
        const loginResponse = await axios.post('http://localhost:3001/api/login', {
            email: 'test@example.com',
            cypher: '123456'
        });
        console.log('登录结果:', loginResponse.data);

        // 4. 测试搜索邮箱
        console.log('\n测试搜索邮箱...');
        const searchResponse = await axios.post('http://localhost:3001/api/search_email', {
            email: 'test@example.com'
        });
        console.log('搜索结果:', searchResponse.data);

        // 5. 测试登出
        console.log('\n测试登出...');
        const logoutResponse = await axios.post('http://localhost:3001/api/logout', {
            cookie: loginResponse.data.cookie
        });
        console.log('登出结果:', logoutResponse.data);

    } catch (error) {
        console.error('测试出错:', error.response ? error.response.data : error.message);
    }
}

testAPI(); 