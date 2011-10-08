try {
    var initializationDelay = setInterval(function() {
        if (!$('#threeBeatsExtPopup').createPopup) {
            return;
        }
        clearInterval(initializationDelay);

        // popupHTML will be initialized from the caller code
        $('body').prepend(popupHTML);

        $('#threeBeatsExtPopup').createPopup();
        $("i[title=threeBeatsExtPopup]").each(function(i) {
            $(this).mymodal();
        });
    }, 100);
} catch(exc) {
    alert("Injected code exception: " + exc + "\n\n" + exc.stack);
}
