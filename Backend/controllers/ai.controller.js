import * as aiService from "../services/ai.service.js"

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query
        const result = await aiService.generateAiContent(prompt)
        res.send(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}