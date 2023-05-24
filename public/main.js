
indexing.onclick = async () => {
    try {
        const result = await fetch("http://localhost:3000/indexer", { 
            headers:{ "Content-Type":"application/json" },
            method:"GET"
        })
        alert("Successful indexing")
        console.log(result)
    } catch (error) {
        alert("Failed indexing")
        console.log(error)
    }
}

searchButton.onclick = async () => {
    try {
        let field = $('#searchField').find(":selected").val();
        let text = $("#searchText").val()

        search(field, text, 1)
    } catch (error) {
        alert("Search failed")
        console.log(error)
    }
}

$(document).on('click', '.pageNumber', async function() {
    let field = $('#searchField').find(":selected").val()
    let text = $("#searchText").val()
    const page = this.innerText

    search(field, text, page)
});

async function search(field, text, page) {
    clearSearchResultsTable();
    const results = await getSearchResultsTable(field, text, page)
    writeSearchResultsTable(results, page)
}

function clearSearchResultsTable() {
    $('#searchResultsTable').empty()
}

async function getSearchResultsTable(field, text, page) {
    const urlResults = `http://localhost:3000/searcher?field=${field}&text=${text}&page=${page}`
        const result = await fetch( urlResults, { 
            headers:{ "Content-Type":"application/json" },
            method:"GET"
        })
    const resultJson = await result.json().then(books => books)
    return resultJson
}

function writeSearchResultsTable(result, page) {
    //Results
    const resultHits = result.hits.hits

    resultHits.forEach(res => {
        const obj = res._source
        console.log(obj)
        $("#searchResultsTable").append(`
            <div class="searchResult" style="background-color:aliceblue; margin-bottom: 2px;">
                <div>Name: <a href="http://localhost:3000/books/${obj.name}"><b>${obj.name}</b></a></div>
                <div>File size: <a><b>${obj.size} B</b></a></div>
                <div>Content: <a><b>${obj.content.substring(0,96)}...</b></a></div>
            </div>
        `)
    })

    //Pagination
    let resultTotal = result.hits.total.value / 5
    if (resultTotal % 5 != 0) resultTotal++;
    $("#searchResultsTable").append(`<div id="pagination"></div>`)

    for(let i = 1; i < resultTotal+1; i++) {
        $("#pagination").append(`
            <button class="pageNumber" style="background-color: ${(i == page) ? "red" : ""}">${i}</button>
        `)
    }
}