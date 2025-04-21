module.exports = [
  {
    name: "alimydb",
    type: 'mysql', // 数据库类型
    host: 'localhost', // 改用 localhost 而不是 127.0.0.1
    port: 3306, // 移除引号，使用数字
    username: 'root', // 本地用户名
    password: '123456', // 请根据您的实际密码修改
    database: 'alimydb', // 数据库名
    logging: true, // 开启日志以便调试
    synchronize: true, // 首次运行时设置为 true，以便自动创建表
    entities: [
      __dirname + '/src/entity/*.ts'
    ],
    timezone: '+08:00', // 设置为中国时区
    dateStrings: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  },
  {
    name: "examydb",
    type: 'mysql', // 数据库类型
    host: 'localhost', // 改用 localhost 而不是 127.0.0.1
    port: 3306, // 移除引号，使用数字
    username: 'root', // 本地用户名
    password: '123456', // 请根据您的实际密码修改
    database: 'examydb', // 数据库名
    logging: true, // 开启日志以便调试
    synchronize: true, // 首次运行时设置为 true，以便自动创建表
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    entities: [
      __dirname + '/src/entity/*.ts'
    ],
    timezone: '+08:00', // 设置为中国时区
    dateStrings: true
  }
]