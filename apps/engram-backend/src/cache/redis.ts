import Redis from "ioredis";

const redisUrl = Bun.env.REDIS_URL;

if (!redisUrl){
    throw new Error("Redis Url is missing in env variable");
}

export const redis = new Redis(redisUrl,{
    retryStrategy : (times)=>{
        const delay = Math.min(times*50,2000)
        return delay
    }
})


redis.on('connect',()=>{
    console.log("Redis is Connected");
})

redis.on('error', (err) => {
    console.error(' Redis error:', err);
});

process.on('SIGINT',async()=>{
    await redis.quit();
    process.exit(0);
})
      
