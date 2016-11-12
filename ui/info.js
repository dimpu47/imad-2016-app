function loadArticles () {
    
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            var articles = document.getElementById('articles');
            if (request.status === 200) {
                var content = '<ul>';
                var articleData = JSON.parse(this.responseText);
                for (var i=0; i< articleData.length; i++) {
                 
                 content += `<div class="gart"> <li>
                    <a class="btn btn-primary" href="/articles/${articleData[i].title}">${articleData[i].heading}</a>
                    (${articleData[i].date.split('T')[0]})</li></div> </br>`;
                 
                 
                }
                content += "</ul>";
                articles.innerHTML = content;
            } else {
               articles.innerHTML('Oops! Could not load all articles!');
            }
        }
    };

    request.open('GET', '/get-articles', true);
    request.send(null);

}


loadArticles();
