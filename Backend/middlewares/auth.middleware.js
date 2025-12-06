import jwt from 'jsonwebtoken'
import redisClient from '../services/redis.service.js';

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1]

        if (!token) {
            return res.status(401).send("Unauthorized User")
        }


        const isBlacklisted = await redisClient.get(token);

        if (isBlacklisted) {

            res.cookie('token', '');
            return res.status(401)
                .json({
                    message: "Unauthorized User"
                })
        }

        const decode = jwt.verify(token, process.env.JWT_TOKEN)
        req.user = decode
        next()
    } catch (err) {
        return res.status(401).send(err.message)
    }
}