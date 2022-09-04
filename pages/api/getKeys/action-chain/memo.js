

export default async function handler(req, res) {
    res.send(process.env.ActionChain_PUB_MEMO);
}