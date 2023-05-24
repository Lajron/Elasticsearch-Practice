const express = require('express');
const asyncHandler = require('express-async-handler');
const es = require('@elastic/elasticsearch');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

const esClient = new es.Client({ node: 'http://localhost:9200' });
const indexName = "testtest"

const getFiles = () => {
    const dir = __dirname + "/public/books";
    const files = [];

    fs.readdirSync(dir).forEach(fileName => {
        const filePath = dir + "/" + fileName
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const fileSize = (fs.statSync(filePath)).size

        files.push({
            index: indexName, 
            document: {
                name: fileName, 
                path: filePath, 
                size: fileSize, 
                content: fileContent
            }
        })        
    })
    return files;
}

app.get("/indexer", asyncHandler(async (req, res) => {
    const createResult = await esClient.indices.create({ index: indexName })  

    const files = getFiles();  
    for(const file of files) 
        await esClient.index(file)

    res.status(200).json("Success");
}));

app.get("/searcher", asyncHandler(async (req, res) => {
    let { field, text, page } = req.query
    start = (page == 0) ? 0 : page - 1
    amount = 5

    const result = await esClient.search({
        index: indexName,
        from: start,
        size: amount,
        query: { 
            match: { [field]: text} 
        },
    });   
    res.json(result);
}));

app.listen(3000, () => console.log(`Server started - localhost:3000`));
