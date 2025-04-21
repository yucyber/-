import Koa from 'koa';

declare module 'koa' {
    interface Request {
        body: any;
    }
} 