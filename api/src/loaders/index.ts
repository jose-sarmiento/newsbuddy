import expressLoader from './express';
import esloader from './elasticsearch';
import type { Express } from 'express';

export default async function({ app }: { app: Express }) {
    await esloader();
    console.log('elasticsearch loaded');

    await expressLoader({ app });
    console.log('express loaded');
}