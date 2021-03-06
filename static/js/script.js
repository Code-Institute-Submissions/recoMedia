var elems;
var elemCarousel;
var instances;
var instanceCarousel;
var currYear = (new Date()).getFullYear();    

$(document).ready(function(){
    elems = document.querySelectorAll('select');
    $('.sidenav').sidenav();
    $('.carousel.carousel-slider').carousel({
        fullWidth: true,
    });        
    $('.prev').click(function(){
        $('.carousel').carousel('prev');
    });
    $('.next').click(function(){
        $('.carousel').carousel('next');
    });
    $('.modal').modal();    
    let tpBtnCount=$('.top-picks > .page-btn').length;
    let nrBtnCount=$('.new-releases > .page-btn').length;
    // GenPageBtnCount initiated in the getUserGenre function 
    // (as AJAX btnCount will be 0 on document ready)
    // eliminates chevrons where only one or less pages exists within pagination.
    if (tpBtnCount<2){ 
        $(".top-picks .left-chev").hide();
        $(".top-picks .right-chev").hide();
    }
    if (nrBtnCount<2){ 
        $(".new-releases .left-chev").hide();
        $(".new-releases .right-chev").hide();
    }
});

// Index.html

function checkUsername(username){
    $("#username-err").remove();
    if( /[^A-z0-9]/.test(username.value) ){
        $("div #err-msg").append(`<p class="error" id="username-err">Username must
        be alphanumeric with no spaces.</p>`);
    }
}

function checkPasswordsMatch(input) {
    $("#pw-match-err").remove();
    if ( $('#c_password').val() != $('#password').val() && $('#c_password').val().length>0 ) {
        $("div #err-msg").append(`<p class="error" id="pw-match-err">Password Must be Matching.</p>`);
        $("#err-msg").css("color","red");
    } else {
        // input is valid -- reset the error message
        $("#pw-match-err").remove();
    }
}

//  Userprofile
function getSuggestions(filmname){
    $.get('https://www.omdbapi.com/?s='+filmname.value+'&apikey=61e49492',function(rawdata){
        /**** clear previous suggestions ****/
        let title_object = {};
        /**** autocomplete film suggestions ****/
        for (let film of rawdata.Search){
            title_object[film.Title] = "";
        }

        $('input.autocomplete').autocomplete({
            data: title_object,
            limit: 5
        });  
    }); 
}  
        
function getFilms(filmname){
    $.get('https://www.omdbapi.com/?s='+filmname.value+'&apikey=61e49492',function(rawdata){
        /**** clear previous search data ****/
        $("#film-display").html("");
        $('#years').html(`<option value="" disabled selected>Choose which year</option>`);
        $('#imdbID').html(`<option value="" disabled selected>Imdb ID</option>`);
        let year_object = {};
        let arrayNoDuplicatesID = [];
        let id = 0;
        for (let film of rawdata.Search){
            if (filmname.value.toLowerCase()===film.Title.toLowerCase() && 
            arrayNoDuplicatesID.indexOf(film.imdbID)===-1 && film.Type==='movie'){
                year_object[film.Year] = null;
                id++;
                $("#film-display").append(`<div class="film-data" id="`+film.imdbID+`">
                <img src="`+film.Poster+`"/>
                <ul><li>`+film.Title+`</li><li>`+film.Year+`</li></ul></div>`);
                arrayNoDuplicatesID.push(film.imdbID);
                }
        }
        if (id===0){
            $("#film-display").html("<p>Unfortunately this film doesn't exist in our database.</p>")
        }
        
            $('#film-display > div').on('click', function() {
            $('select').formSelect();
            getFilm(this.id);
        });
    });
}

function getFilm(chosen_id) {
    let film_title=$('#film_title').val();
    $.get('https://www.omdbapi.com/?i='+chosen_id+'&apikey=61e49492',function(rawdata){
        let arrayNoDuplicatesID=[];
        var rawstring=JSON.stringify(rawdata);
        let omdb_data = JSON.parse(rawstring);
        let fields=["imdbID","Year","Director","Actors","Runtime"];
        for (let f of fields){
            $('#'+f).empty();
            createElem(f, chosen_id);
        }
    });
}

function createElem(parentNode, film_id) {
    $.get('https://www.omdbapi.com/?i='+film_id+'&apikey=61e49492',function(rawdata){
        let option=document.createElement("OPTION");
        // Create a "class" attribute
        let att = document.createAttribute("value");       
        // Set the value of the class attribute
        att.value = rawdata[parentNode];                           
        option.setAttributeNode(att);                  
        option.innerHTML=rawdata[parentNode];
        document.getElementById(parentNode).appendChild(option);
    });
}
function confirmDelete(film){
    let filmId=film.id.slice(4);
    let filmTitle=$('#title-'+filmId).text();
    let filmYear=$('#year-'+filmId).text();
    $('#del-msg').html("Delete review for "+filmTitle+" ("+filmYear+") ?");
    $('#modal1').modal('open');
    $('#del-btn').attr("href", $SCRIPT_ROOT+'/delete_rating/'+filmId); 
}

function checkRating(){
    $('#err-msg').empty();
    let runtime= $('#Runtime').val();
    let rating= $('#rating').val();
    let review= $('#review').val();
    if (runtime===null){
        $('#err-msg').append('<p class="error">A film has not yet been selected.</p>');
    }
    if (rating===null){
        $('#err-msg').append(`<p class="error">A rating remains to be selected for
         this film.</p>`);
    }
    if (review===""){
        $('#err-msg').append(`<p class="error">The review field is empty.</p>`);
    }
}

//  Userview.html 

function getYears(filmname){
    $.get('https://www.omdbapi.com/?s='+filmname.value+'&apikey=61e49492',function(rawdata){
            /**** clear previous search data ****/
            $("#search-err-msg p").remove();
            $("#Year").empty();
            $('#Year').html(`<option value="" disabled selected>Choose which year</option>`);
            var year_object = {};
	        let id = 0;
	        for (let film of rawdata.Search){
	            if (filmname.value.toLowerCase()===film.Title.toLowerCase() && film.Type===
                'movie'){
                    year_object[film.Year] = null;
                    id++;
                    createElem("Year", film.imdbID);
                    $("#Year").append(`<option value="`+film.Year+`" selected>`+film.Year+
                    `</option>`);
                }
            }
            if (id===0){
                $("#search-err-msg").append(`<p>Unfortunately this film doesn't exist in our 
                database.</p>`);
            }
            $('select').not('.disabled').formSelect();
        });
    }

function showFilmInCarousel() {
    $("#search-err-msg p").remove();
    let filmTitle=$('#search-film-title').val();
    let filmYear=$('#Year').val();
    if (filmYear==null){
        $("#search-err-msg").append(`<p class="error">Unfortunately this film doesn't exist in
        our database.</p>`);
    }
    $.get('https://www.omdbapi.com/?s='+filmTitle+'&apikey=61e49492',function(rawdata){
        let filmID=0;
        // Obtain film ID of searched film.
        for (let film of rawdata.Search){
            if (filmTitle.toLowerCase()==film['Title'].toLowerCase() && filmYear==film['Year']){
                filmID=film['imdbID'];
            }
        }
        goToFilmSlide(filmID);
        
    });
}

function goToFilmSlide(filmID){
    let elemCarousel = document.querySelector('.carousel');
    let instanceCarousel = M.Carousel.getInstance(elemCarousel);
    // Find number of carousel-slide by finding the carousel-item ID matching with filmID above. 
    let carouselChildren=$('.carousel-slider').children();
    let carouselItemIdPattern = /^[0-9]+/;
    let filmSlide;
    for (let child of carouselChildren){
        if ((child.id).match(filmID)){
            filmSlide=child.id.match(carouselItemIdPattern);
        }
    }
    if (filmSlide== undefined){
        $("#search-err-msg").append(`<p class="error">This user hasn't rated this film.</p>`);
    } else{
        instanceCarousel.set(filmSlide);
    }
}

function getPage(pageButton){
    if ($(pageButton).parent().hasClass('top-picks')){
        $(".top-picks.film-card-container").hide();
    }
    if ($(pageButton).parent().hasClass('new-releases')){
        $(".new-releases.film-card-container").hide();
    }
    if ($(pageButton).parent().hasClass('genre-picks')){
        $(".genre-picks.film-card-container").hide();
    }
    let pageLink=$(pageButton).children('a').attr('href');
    /* The link attribute is the same as the id of its associated page table.*/
    $(pageLink).css('display', 'grid');
}

function updateChevronState(activeBtnId){
    let tpPageBtnCount=$('.top-picks > li').length-2;
    let nrPageBtnCount=$('.new-releases > li').length-2;
    let genPageBtnCount=$('.genre-picks > li').length-2;
    
    /* Determine chevron states to be disabled or not - applies to prevPage() and 
    nextPage() also  --> refactor / on doc ready */
    /* Top-pick Chevrons */
    if (activeBtnId=="tp-page-btn1"){
        $('.top-picks .right-chev').removeClass("disabled");
        $('.top-picks .left-chev').addClass("disabled");
    } else if (activeBtnId=="tp-page-btn"+tpPageBtnCount){
        $('.top-picks .left-chev').removeClass("disabled");
        $('.top-picks .right-chev').addClass("disabled");
    } else if (activeBtnId.slice(0,11)=='tp-page-btn'){    /* Both chevrons enabled */
        $('.top-picks .left-chev').removeClass("disabled");
        $('.top-picks .right-chev').removeClass("disabled");
    }
    /* New-releases Chevrons */
    if (activeBtnId=="nr-page-btn1"){
        $('.new-releases .right-chev').removeClass("disabled");
        $('.new-releases .left-chev').addClass("disabled");
    } else if (activeBtnId=="nr-page-btn"+nrPageBtnCount){
        $('.new-releases .left-chev').removeClass("disabled");
        $('.new-releases .right-chev').addClass("disabled");
    } else if(activeBtnId.slice(0,11)=='nr-page-btn'){    /* Both chevrons enabled */
        $('.new-releases .left-chev').removeClass("disabled");
        $('.new-releases .right-chev').removeClass("disabled");
    }
    /* Genre-picks Chevrons */
    if (activeBtnId=="gen-page-btn1"){
        $('.genre-picks .right-chev').removeClass("disabled");
        $('.genre-picks .left-chev').addClass("disabled");
    } else if (activeBtnId=="gen-page-btn"+genPageBtnCount){
        $('.genre-picks .left-chev').removeClass("disabled");
        $('.genre-picks .right-chev').addClass("disabled");
    } else if(activeBtnId.slice(0,12)=='gen-page-btn'){    /* Both chevrons enabled */
        $('.genre-picks .left-chev').removeClass("disabled");
        $('.genre-picks .right-chev').removeClass("disabled");
    }
}

function goToPage(page){
    getPage(page);
    if ($(page).parent().hasClass('top-picks')){
        $('.top-picks > li').removeClass('active');
    }
    if ($(page).parent().hasClass('new-releases')){
        $('.new-releases > li').removeClass('active');
    }
    if ($(page).parent().hasClass('genre-picks')){
        $('.genre-picks > li').removeClass('active');
    }
    $(page).addClass("active");
    let activeBtnId=$(page).attr("id");
    updateChevronState(activeBtnId);  
}

function getCurrentBtn(paginationClass){
    // Retrieves the page button with active status 
    // (currently displaying that number page of results) 
    // paginationClass distinguishes the sets of buttons being dealth with.
    let currentBtnId;
    let pageBtns=$('.pagination'+paginationClass).children().each(function(){
        if($(this).hasClass('active')){
            currentBtnId=$(this).attr('id');
        }
        return currentBtnId;
    });
    return currentBtnId;
}

function prevPage(chevron) {
    let isTopPicks=$(chevron).parent().hasClass('top-picks');
    let isNewRelease=$(chevron).parent().hasClass('new-releases');
    let isGenre=$(chevron).parent().hasClass('genre-picks');
    /* if chevron btn enabled allow prev function to be carried out */
    if (!$(chevron).hasClass("disabled") ){
        let currentBtnId, prevBtnId;

        if (isTopPicks){
            currentBtnId=getCurrentBtn('.top-picks');
            // Extracts number from page button Id and decrements by 1 to establish previous page.
            prevBtnId='tp-page-btn'+(String(currentBtnId).match(/\d+/)-1 ); 
        }
        if (isNewRelease){
            currentBtnId=getCurrentBtn('.new-releases');
            prevBtnId='nr-page-btn'+(String(currentBtnId).match(/\d+/)-1 );
        }
        if (isGenre){
            currentBtnId=getCurrentBtn('.genre-picks');
            prevBtnId='gen-page-btn'+(String(currentBtnId).match(/\d+/)-1 );
        }
        $('#'+currentBtnId).removeClass('active');
        $('#'+prevBtnId).addClass('active');
        /* Change page table showing */
        getPage('#'+prevBtnId);
        updateChevronState(prevBtnId); 
    }
}

function nextPage(chevron) {
    let isTopPicks=$(chevron).parent().hasClass('top-picks');
    let isNewRelease=$(chevron).parent().hasClass('new-releases');
    let isGenre=$(chevron).parent().hasClass('genre-picks');
    /* if chevron btn enabled allow next function to be carried out */
    if (!$(chevron).hasClass("disabled")){
        let currentBtnId, nextBtnId;
        if (isTopPicks){
            currentBtnId=getCurrentBtn('.top-picks');
            // Extracts number from page button Id and decrements by 1 to establish previous page.
            nextBtnId='tp-page-btn'+(1+parseInt(String(currentBtnId).match(/\d+/)) ); 
        }
        if (isNewRelease){
            currentBtnId=getCurrentBtn('.new-releases');
            nextBtnId='nr-page-btn'+(1+parseInt(String(currentBtnId).match(/\d+/) ) );
        }
        if (isGenre){
            currentBtnId=getCurrentBtn('.genre-picks');
            // Extracts number from page button Id and decrements by 1 to establish previous page.
            nextBtnId='gen-page-btn'+(1+parseInt(String(currentBtnId).match(/\d+/)) ); 
        }
        $('#'+currentBtnId).removeClass('active');
        $('#'+nextBtnId).addClass('active');
        /* Change page table showing */
        getPage('#'+nextBtnId);
        updateChevronState(nextBtnId); 
    }
}

function getUserGenre(genre){
    let genreToQuery = $(genre).html();
    // extract username from Jinja template using regex.
    let usernamePattern = /^[a-z0-9]+/i;
    let userToQuery = $('#user-title').html().match(usernamePattern); 
    userToQuery=userToQuery[0];
    $.getJSON($SCRIPT_ROOT + '/user_genre', 
    { genre: genreToQuery,
        username: userToQuery
    },
    function(data) {
        let r = data.result;
        r=JSON.parse(r);
        $('#genre-results-area h3').remove();
        $('#user-genre-picks').remove();
        let pageCounter=0;
        for (let page in r) {pageCounter++;} 
        if (pageCounter>0){
            $('#genre-results-area').html(`<div class="title-area"><h3>`+userToQuery+
            `'s `+genreToQuery+` Recommendations</h3></div>`);
            $('#genre-results-area').append(`<ul class="pagination genre-picks">
                <li class="disabled left-chev" onclick="prevPage(this)">
                <a href="#!"><i class="material-icons">chevron_left</i></a></li></ul>`);
                for(let page=1; page<=pageCounter; page++){
                    if (page ==1){
                        $('.pagination.genre-picks').append(`<li id="gen-page-btn`+page+
                        `" class="active page-btn" onclick="goToPage(this)"></li>`);
                    } else {
                        $('.pagination.genre-picks').append(`<li id="gen-page-btn`+page+
                        `" class="page-btn" onclick="goToPage(this)"></li>`);
                    }
                    $('#gen-page-btn'+page).append(`<a href="#gen-page-`+page+`.genre-picks">`
                    +page+`</a>`);
                }
                $('.pagination.genre-picks').append(`<li class="waves-effect right-chev" 
                onclick="nextPage(this)"><a href="#!"><i class="material-icons">chevron_right</i>
                </a></li></ul>`);
            let genBtnCount=$('.genre-picks > .page-btn').length;
            if (genBtnCount==1){ 
                $(".genre-picks .left-chev").hide();
                $(".genre-picks .right-chev").hide();
            }
            
            $('#genre-results-area').append(`<div id="user-genre-picks"></div>`);
            let filmCounter=1;
            pageCounter=1;
            for (let page of r){
                $('#user-genre-picks').append(`<div id="gen-page-`+pageCounter+
                `" class="film-card-container genre-picks">
                <div class="table">`);
                
                for (let film of page){
                    let rating;
                    // Find rating inside of array and set as variable to place in table row.
                    for(let index of film.ratings){
                        for(let property in index){
                            if (property=="rating")
                                rating=index[property];
                        }
                    }
                    $('#gen-page-'+pageCounter+' .table').append(`<a class="table-row film-card"
                     href="#userview-carousel" onclick="goToFilmSlide('`+film.imdbID+`')">
                        <div class="table-cell rank">`+filmCounter+`</div>
                        <div class="table-cell title">`+film.title+`</div>
                        <div class="table-cell year">`+film.year+`</div>
                        <div class="table-cell rating">`+rating+`</div>    
                    </a>`);
                    filmCounter+=1;
                }
                pageCounter++;
                $('#genre-results-area').append(`</div></div>`);
                }
            } else {
                $('#genre-results-area').html(`<div class="title-area"><p id="empty-msg">`+
                userToQuery+` has no films in this genre.</p></div>`);
            }
        }
    );
}

// films.html

function getGenre(genre){
    let genreToQuery = $(genre).html(); 
    $("#genre-top-10").empty();
    $.getJSON($SCRIPT_ROOT + '/show_genre_films', { genre: genreToQuery },
    function(data) {
        let r = data.result;
        r=JSON.parse(r);
        $("#genre-table").empty();
        if (r.length>0){
            $("#genre-top-10").append(`<h3>`+genreToQuery+` Top 10</h3>`);
        } else {
            $("#genre-top-10").append(`<p id="empty-msg">There are currently no films 
            reviewed in this genre.</p>`);
        }
        for(let i=0; i<r.length; i++){
            $("#genre-table").append(`
            <a class="table-row film-card" href="`+$SCRIPT_ROOT+
            `/get_reviews/`+r[i].imdbID+`/`+r[i].averageRating+`">
                <div class="table-cell rank">`+(i+1)+`</div>
                <div class="table-cell title">`+r[i].title+`</div>
                <div class="table-cell year">`+r[i].year+`</div>
                <div class="table-cell avg-rating">`+r[i].averageRating+`</div>
                <div class="table-cell ratings-count">(`+r[i].ratingsCount+` ratings)</div>    
            </a>`)
        }
    });
}

function getDirectors(){
    let directorToQuery = $("#director_name").val();
    $.getJSON($SCRIPT_ROOT + '/show_director_films', 
        { director: directorToQuery },
        function(data) {
            let r = data.result;
            r=JSON.parse(r);
            $("#director-table").empty();
            $('#director-top-10').empty();
            if (r.length===0){
                $('#director-top-10').append(`<p id="empty-msg">There are currently no films reviewed,
                for this director.</p>`);
            } else {
                $("#director-top-10").append(`<h3>`+formatDirectorInput(directorToQuery)+
                `'s Top 10</h3>`);
                for(let i=0; i<r.length; i++){
                    $("#director-table").append(`
                    <a class="table-row film-card" href="`+$SCRIPT_ROOT+`/get_reviews/`+
                    r[i].imdbID+`/`+r[i].averageRating+`">
                        <div class="table-cell rank">`+(i+1)+`</div>
                        <div class="table-cell title">`+r[i].title+`</div>
                        <div class="table-cell year">`+r[i].year+`</div>
                        <div class="table-cell avg-rating">`+r[i].averageRating+`</div>
                        <div class="table-cell ratings-count">(`+r[i].ratingsCount+` ratings)</div>    
                    </a>`
                )
            }
        }
    }); 
}    

function formatDirectorInput(directorName){
    // formats input to 
    directorName=directorName.toLowerCase();
    let directorWords=directorName.split(" ");
    let formattedWords=[];
    for(let word of directorWords){
        word=word.charAt(0).toUpperCase()+word.slice(1);
        formattedWords.push(word);
    }
    let formattedDirectorName=formattedWords.join(" ");
    return formattedDirectorName;
}

function getDecade(year){
    let decadeToQuery = $(year).attr('id');
    decadeToQuery= parseInt(decadeToQuery);
    $.getJSON($SCRIPT_ROOT + '/show_decade_films', { decade: decadeToQuery },
        function(data) {
            let r = data.result;
            r=JSON.parse(r);
            $("#decade-table").empty();
            $("#decade-top-10").empty();
            if (r.length>0){
                $("#decade-top-10").append(`<h3>`+decadeToQuery+`'s Top 10</h3>`);
            } else {
                $("#decade-top-10").append(
                `<p id="empty-msg">There are currently no films reviewed, for this decade.</p>`);
            }
            for(let i=0; i<r.length; i++){
                $("#decade-table").append(`
                <a class="table-row film-card" href="`+$SCRIPT_ROOT+`/get_reviews/`+
                r[i].imdbID+`/`+r[i].averageRating+`">
                    <div class="table-cell rank">`+(i+1)+`</div>
                    <div class="table-cell title">`+r[i].title+`</div>
                    <div class="table-cell year">`+r[i].year+`</div>
                    <div class="table-cell avg-rating">`+r[i].averageRating+`</div>
                    <div class="table-cell ratings-count">(`+r[i].ratingsCount+
                    ` ratings)</div>    
                </a>`
            )
        }
    }); 
} 
   