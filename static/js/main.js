$(".upload").click(function () {
    $(".uploadform").toggle("slide");
});

$("#uploadq").click(function () {
    $("#quoteform").toggle("slide");
});

$("#suggest_quote").click(function () {
    $("#quote_suggestion").slideToggle(300);
    $(this).html(($(this).text() == "+") ? "-" : "+");
});

function toggle_submenu(){
    $("#submenu").slideToggle(200);
}

function toggle_submenu2(){
    $("#submenu2").slideToggle(200);
}

Modernizr.addTest('meter', function(){
    var elem = document.createElement('meter');
    return !(elem instanceof HTMLUnknownElement);
});